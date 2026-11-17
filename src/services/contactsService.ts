/**
 * Google People / Contacts API Service for Tobago Healthcare Equipment & Supplies
 * Handles fetching, searching, creating, syncing, and deleting contacts
 */

import { getAccessToken } from './firebaseAuth';
import { TransportRequest, RentalRequest, ConsultationRequest } from '../types';

export interface GoogleContactPerson {
  resourceName: string;
  etag: string;
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }>;
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  addresses?: Array<{
    formattedValue?: string;
    streetAddress?: string;
    city?: string;
    region?: string;
    country?: string;
    type?: string;
  }>;
  biographies?: Array<{
    value: string;
    contentType?: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
  }>;
  userDefined?: Array<{
    key: string;
    value: string;
  }>;
  photos?: Array<{
    url: string;
  }>;
}

export interface NewContactPayload {
  givenName: string;
  familyName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  organization?: string;
  jobTitle?: string;
  notes?: string;
  categoryTag?: string;
}

/**
 * List connections (contacts) from Google People API
 */
export async function listContacts(pageSize = 100): Promise<GoogleContactPerson[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const personFields = [
    'names',
    'emailAddresses',
    'phoneNumbers',
    'addresses',
    'biographies',
    'organizations',
    'userDefined',
    'photos',
  ].join(',');

  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=${personFields}&pageSize=${pageSize}&sortOrder=FIRST_NAME_ASCENDING`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch contacts (${response.status})`);
  }

  const data = await response.json();
  return data.connections || [];
}

/**
 * Search Google contacts by query string
 */
export async function searchContacts(query: string): Promise<GoogleContactPerson[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const safeQuery = encodeURIComponent(query.trim());
  const readMask = 'names,emailAddresses,phoneNumbers,addresses,biographies,organizations,userDefined,photos';
  const url = `https://people.googleapis.com/v1/people:searchContacts?query=${safeQuery}&readMask=${readMask}&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    // If search endpoint fails or is unsupported on some account types, fallback to filtering connections
    return [];
  }

  const data = await response.json();
  return (data.results || []).map((r: any) => r.person);
}

/**
 * Create a new contact in Google Contacts
 */
export async function createGoogleContact(payload: NewContactPayload): Promise<GoogleContactPerson> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  const body: any = {
    names: [
      {
        givenName: payload.givenName.trim(),
        familyName: (payload.familyName || '').trim(),
      },
    ],
  };

  if (payload.email && payload.email.trim()) {
    body.emailAddresses = [
      {
        value: payload.email.trim(),
        type: 'work',
      },
    ];
  }

  if (payload.phone && payload.phone.trim()) {
    body.phoneNumbers = [
      {
        value: payload.phone.trim(),
        type: 'mobile',
      },
    ];
  }

  if (payload.streetAddress || payload.city) {
    body.addresses = [
      {
        streetAddress: (payload.streetAddress || '').trim(),
        city: (payload.city || 'Scarborough').trim(),
        region: 'Tobago',
        country: 'Trinidad and Tobago',
        type: 'home',
      },
    ];
  }

  if (payload.organization || payload.jobTitle) {
    body.organizations = [
      {
        name: payload.organization || 'Tobago Healthcare Equipment & Supplies Client',
        title: payload.jobTitle || 'Patient / Client',
      },
    ];
  }

  const notesParts: string[] = [];
  if (payload.categoryTag) {
    notesParts.push(`Category: ${payload.categoryTag}`);
  }
  if (payload.notes) {
    notesParts.push(payload.notes.trim());
  }

  if (notesParts.length > 0) {
    body.biographies = [
      {
        value: notesParts.join('\n\n'),
        contentType: 'TEXT_PLAIN',
      },
    ];
  }

  if (payload.categoryTag) {
    body.userDefined = [
      {
        key: 'Category',
        value: payload.categoryTag,
      },
      {
        key: 'Location',
        value: 'Tobago, Trinidad and Tobago',
      },
    ];
  }

  const url = 'https://people.googleapis.com/v1/people:createContact';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create contact (${response.status})`);
  }

  return await response.json();
}

/**
 * Delete a contact by resourceName (e.g. "people/c12345678")
 * IMPORTANT: Calling code must present explicit confirmation dialog before invoking this function.
 */
export async function deleteGoogleContact(resourceName: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with your Google account.');
  }

  // resourceName looks like "people/c1234567890"
  // Format URL: https://people.googleapis.com/v1/{resourceName}:deleteContact
  const safeResourceName = resourceName.replace(/^\/+/, '');
  const url = `https://people.googleapis.com/v1/${safeResourceName}:deleteContact`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete contact (${response.status})`);
  }

  return true;
}

/**
 * Sync / Export a Transport Request into Google Contacts
 */
export async function syncTransportRequestToContacts(req: TransportRequest): Promise<GoogleContactPerson> {
  const [givenName, ...familyParts] = (req.contactName || 'Client').trim().split(' ');
  const familyName = familyParts.join(' ');

  return await createGoogleContact({
    givenName: givenName || 'Patient',
    familyName: familyName || '',
    email: req.email,
    phone: req.phone,
    streetAddress: `${req.origin} to ${req.destination}`,
    city: 'Scarborough',
    organization: 'Tobago Healthcare Transport Client',
    jobTitle: `Pathway: ${req.pathway || 'Under Review'}`,
    categoryTag: 'Medical Transport Client',
    notes: `Transport Ref: ${req.reference}\nStatus: ${req.status}\nRequested Date: ${req.requestedDate} (${req.preferredTimeWindow})\nOrigin: ${req.origin}\nDestination: ${req.destination}\nWheelchair Access: ${req.wheelchairAccessibilityRequired ? 'Yes' : 'No'}\nEscort Required: ${req.escortRequired ? 'Yes' : 'No'}`,
  });
}

/**
 * Sync / Export a Rental Request into Google Contacts
 */
export async function syncRentalRequestToContacts(req: RentalRequest): Promise<GoogleContactPerson> {
  const [givenName, ...familyParts] = (req.customerName || 'Client').trim().split(' ');
  const familyName = familyParts.join(' ');

  return await createGoogleContact({
    givenName: givenName || 'Client',
    familyName: familyName || '',
    email: req.email,
    phone: req.phone,
    streetAddress: req.deliveryGeneralLocation || 'Self-Collection (Burnett Hill, Scarborough)',
    city: 'Scarborough',
    organization: 'Tobago Healthcare Rental Client',
    jobTitle: `Rental: ${req.equipmentCategory}`,
    categoryTag: 'Medical Equipment Renter',
    notes: `Rental Ref: ${req.reference}\nCategory: ${req.equipmentCategory}\nDuration: ${req.expectedDurationDays || 1} days starting ${req.requestedStartDate}\nFulfilment: ${req.preferredFulfilment}\nStatus: ${req.status}`,
  });
}

/**
 * Sync / Export a Consultation Request into Google Contacts
 */
export async function syncConsultationRequestToContacts(req: ConsultationRequest): Promise<GoogleContactPerson> {
  const [givenName, ...familyParts] = (req.contactName || 'Client').trim().split(' ');
  const familyName = familyParts.join(' ');

  return await createGoogleContact({
    givenName: givenName || 'Consultation Client',
    familyName: familyName || '',
    email: req.email,
    phone: req.phone,
    city: 'Scarborough',
    organization: 'Tobago Healthcare Consultation Client',
    jobTitle: `Consultation: ${req.consultationTopic}`,
    categoryTag: 'Consultation Client',
    notes: `Consultation Ref: ${req.reference}\nTopic: ${req.consultationTopic}\nPreferred Date: ${req.preferredDate} (${req.preferredTimeSlot})\nMessage: ${req.message}\nStatus: ${req.status}`,
  });
}

/**
 * Extract clean numeric digits for WhatsApp link
 */
export function extractWhatsAppDigits(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 7) {
    return `1868${digits}`;
  }
  if (digits.length === 10 && digits.startsWith('868')) {
    return `1${digits}`;
  }
  return digits;
}
