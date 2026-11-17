/**
 * Gmail API Service for Tobago Healthcare Equipment & Supplies
 * Handles reading messages, composing emails, sending notifications, and dispatching quotations
 * Conforms to Google Workspace client-side least-privilege standards
 */

import { TransportRequest, RentalRequest, ConsultationRequest } from '../types';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  historyId?: string;
  internalDate: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  labelIds?: string[];
  unread?: boolean;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText?: string;
  bodyHtml?: string;
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * Encode string to Base64URL (RFC 4648 §5)
 */
function toBase64Url(str: string): string {
  // Support UTF-8 characters safely in browser
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode Base64URL string
 */
function fromBase64Url(base64UrlStr: string): string {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

/**
 * List messages from Gmail with metadata preview
 */
export async function listGmailMessages(
  accessToken: string,
  options: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
    labelIds?: string[];
  } = {}
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate: number }> {
  const { query, maxResults = 25, pageToken, labelIds } = options;

  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
  });

  if (query && query.trim()) {
    params.append('q', query.trim());
  }
  if (pageToken) {
    params.append('pageToken', pageToken);
  }
  if (labelIds && labelIds.length > 0) {
    labelIds.forEach((l) => params.append('labelIds', l));
  }

  const listRes = await fetch(`${GMAIL_API_BASE}/messages?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch messages from Gmail (${listRes.status})`);
  }

  const listData = await listRes.json();
  const rawList: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (rawList.length === 0) {
    return { messages: [], nextPageToken: listData.nextPageToken, resultSizeEstimate: 0 };
  }

  // Fetch headers for the messages in parallel (capped at batch size for responsiveness)
  const summaries: GmailMessageSummary[] = await Promise.all(
    rawList.slice(0, 20).map(async (item) => {
      try {
        const metaRes = await fetch(
          `${GMAIL_API_BASE}/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!metaRes.ok) return createFallbackSummary(item.id, item.threadId);

        const data = await metaRes.json();
        const headers: GmailHeader[] = data.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: data.id,
          threadId: data.threadId,
          snippet: data.snippet || '',
          internalDate: data.internalDate || '',
          subject: getHeader('Subject') || '(No Subject)',
          from: getHeader('From') || 'Unknown Sender',
          to: getHeader('To') || '',
          date: getHeader('Date') || '',
          labelIds: data.labelIds || [],
          unread: data.labelIds?.includes('UNREAD'),
        };
      } catch {
        return createFallbackSummary(item.id, item.threadId);
      }
    })
  );

  return {
    messages: summaries,
    nextPageToken: listData.nextPageToken,
    resultSizeEstimate: listData.resultSizeEstimate || summaries.length,
  };
}

function createFallbackSummary(id: string, threadId: string): GmailMessageSummary {
  return {
    id,
    threadId,
    snippet: '',
    internalDate: '',
    subject: '(Message)',
    from: '',
    to: '',
    date: '',
  };
}

/**
 * Fetch full Gmail message with body
 */
export async function getGmailMessage(accessToken: string, messageId: string): Promise<GmailMessageDetail> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}?format=full`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch email message details.');
  }

  const data = await res.json();
  const headers: GmailHeader[] = data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let bodyText = '';
  let bodyHtml = '';

  const parsePart = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += fromBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml += fromBase64Url(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(parsePart);
    }
  };

  if (data.payload) {
    if (data.payload.body?.data) {
      if (data.payload.mimeType === 'text/html') {
        bodyHtml = fromBase64Url(data.payload.body.data);
      } else {
        bodyText = fromBase64Url(data.payload.body.data);
      }
    }
    if (data.payload.parts) {
      data.payload.parts.forEach(parsePart);
    }
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    internalDate: data.internalDate || '',
    subject: getHeader('Subject') || '(No Subject)',
    from: getHeader('From') || 'Unknown Sender',
    to: getHeader('To') || '',
    date: getHeader('Date') || '',
    labelIds: data.labelIds || [],
    unread: data.labelIds?.includes('UNREAD'),
    bodyText,
    bodyHtml,
  };
}

/**
 * Send an email via Gmail API
 * Mandatory: The UI MUST present a clear confirmation dialog before calling this mutating function!
 */
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string,
  replyTo?: string
): Promise<{ id: string; threadId: string; labelIds?: string[] }> {
  const senderEmail = CONFIRMED_BUSINESS_CONFIG.email;

  // Build RFC 2822 compliant email message
  const emailLines: string[] = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${toBase64Url(subject)}?=`,
    `From: Tobago Healthcare Equipment & Supplies <${senderEmail}>`,
  ];

  if (replyTo) {
    emailLines.push(`Reply-To: ${replyTo}`);
  }

  emailLines.push(
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody
  );

  const rawMessage = toBase64Url(emailLines.join('\r\n'));

  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email via Gmail (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a message from Gmail (moves to Trash or permanently deletes)
 * Mandatory: The UI MUST present a clear confirmation dialog before calling this!
 */
export async function deleteGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete message from Gmail (${res.status})`);
  }
}

/**
 * Helper: Send Transport Quotation / Confirmation Email
 */
export async function sendTransportEmailViaGmail(
  accessToken: string,
  transportReq: TransportRequest
): Promise<{ id: string; threadId: string }> {
  if (!transportReq.email) {
    throw new Error('Passenger does not have an email address specified.');
  }

  const subject = `Tobago Healthcare — Medical Transport Update (${transportReq.reference})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Tobago Healthcare Equipment & Supplies</h1>
        <p style="color: #38bdf8; margin: 4px 0 0 0; font-size: 13px;">Medical Transport & Travel Coordination</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background: #ffffff;">
        <p>Dear <strong>${transportReq.contactName}</strong>,</p>
        <p>This is an official communication regarding your non-emergency medical transportation request with <strong>Tobago Healthcare Equipment & Supplies</strong>.</p>
        
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px;">
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Enquiry Reference:</strong></td><td style="color: #0369a1; font-weight: bold;">${transportReq.reference}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Status:</strong></td><td style="color: #047857; font-weight: bold;">${transportReq.status}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Origin:</strong></td><td>${transportReq.origin}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Destination:</strong></td><td>${transportReq.destination}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Requested Date:</strong></td><td>${transportReq.requestedDate} (${transportReq.preferredTimeWindow})</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Transport Pathway:</strong></td><td>${transportReq.pathway || 'Under Review'}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Wheelchair Required:</strong></td><td>${transportReq.wheelchairAccessibilityRequired ? 'Yes' : 'No'}</td></tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #475569;">
          <strong>Next Steps:</strong> Our coordination team assesses all vehicle availability, boarding assistance requirements, and provider schedules. You will receive direct phone or WhatsApp follow-up at <strong>${transportReq.phone}</strong>.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;"><strong>Tobago Healthcare Equipment & Supplies</strong></p>
          <p style="margin: 2px 0;">Burnett Hill, Scarborough, Tobago (Next to Sports and Games)</p>
          <p style="margin: 2px 0;">WhatsApp: +1-868-495-9748 · Email: ${CONFIRMED_BUSINESS_CONFIG.email}</p>
        </div>
      </div>
    </div>
  `;

  return await sendGmailMessage(accessToken, transportReq.email, subject, html);
}

/**
 * Helper: Send Rental Quotation / Confirmation Email
 */
export async function sendRentalEmailViaGmail(
  accessToken: string,
  rentalReq: RentalRequest
): Promise<{ id: string; threadId: string }> {
  if (!rentalReq.email) {
    throw new Error('Customer does not have an email address specified.');
  }

  const subject = `Tobago Healthcare — Medical Equipment Rental Quotation (${rentalReq.reference})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Tobago Healthcare Equipment & Supplies</h1>
        <p style="color: #10b981; margin: 4px 0 0 0; font-size: 13px;">Medical Equipment Rentals Division</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background: #ffffff;">
        <p>Dear <strong>${rentalReq.customerName}</strong>,</p>
        <p>Thank you for enquiring about medical equipment rental with <strong>Tobago Healthcare Equipment & Supplies</strong>.</p>
        
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px;">
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Rental Reference:</strong></td><td style="color: #047857; font-weight: bold;">${rentalReq.reference}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Equipment Category:</strong></td><td>${rentalReq.equipmentCategory} (Qty: ${rentalReq.quantityRequested})</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Requested Start:</strong></td><td>${rentalReq.requestedStartDate}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Rental Duration:</strong></td><td>${rentalReq.expectedDurationDays} days</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;"><strong>Fulfilment Arrangement:</strong></td><td>${rentalReq.preferredFulfilment}</td></tr>
            ${rentalReq.quotedRentalRateTTD ? `<tr><td style="color: #64748b; padding: 4px 0;"><strong>Quoted Rate (TTD):</strong></td><td style="font-weight: bold; color: #0f172a;">$${rentalReq.quotedRentalRateTTD.toFixed(2)} TTD</td></tr>` : ''}
            ${rentalReq.quotedDepositTTD ? `<tr><td style="color: #64748b; padding: 4px 0;"><strong>Refundable Deposit:</strong></td><td>$${rentalReq.quotedDepositTTD.toFixed(2)} TTD</td></tr>` : ''}
          </table>
        </div>

        <p style="font-size: 13px; color: #475569;">
          <strong>Equipment Preparation:</strong> All rental assets undergo functional testing and healthcare-grade antimicrobial sanitization prior to collection or delivery.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;"><strong>Collection Location:</strong> Burnett Hill, Scarborough, Tobago (Next to Sports and Games)</p>
          <p style="margin: 2px 0;">WhatsApp: +1-868-495-9748 · Email: ${CONFIRMED_BUSINESS_CONFIG.email}</p>
        </div>
      </div>
    </div>
  `;

  return await sendGmailMessage(accessToken, rentalReq.email, subject, html);
}
