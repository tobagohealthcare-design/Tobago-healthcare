/**
 * Google Calendar API Service for Tobago Healthcare Equipment & Supplies
 * Handles scheduling, listing, syncing, and updating calendar bookings
 * Timezone: America/Port_of_Spain (Trinidad & Tobago standard time)
 */

import { TransportRequest, RentalRequest, ConsultationRequest } from '../types';

export interface CalendarEventDateTime {
  dateTime?: string; // ISO format e.g. 2026-10-16T09:00:00-04:00
  date?: string;     // YYYY-MM-DD for all-day events
  timeZone?: string;
}

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: string;
  optional?: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  htmlLink?: string;
  status?: string;
  attendees?: CalendarEventAttendee[];
  colorId?: string;
  created?: string;
  updated?: string;
  eventType?: 'transport' | 'rental' | 'consultation' | 'general';
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  attendees?: Array<{ email: string; displayName?: string }>;
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'popup' | 'email'; minutes: number }>;
  };
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
export const TOBAGO_TIMEZONE = 'America/Port_of_Spain';

/**
 * List events from primary calendar
 */
export async function listCalendarEvents(
  accessToken: string,
  options: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
    singleEvents?: boolean;
    orderBy?: string;
  } = {}
): Promise<{ items: CalendarEvent[]; summary?: string }> {
  const calendarId = encodeURIComponent(options.calendarId || 'primary');
  const params = new URLSearchParams({
    singleEvents: (options.singleEvents ?? true).toString(),
    orderBy: options.orderBy || 'startTime',
    maxResults: (options.maxResults || 50).toString(),
    timeZone: TOBAGO_TIMEZONE,
  });

  if (options.timeMin) {
    params.append('timeMin', options.timeMin);
  } else {
    // Default to starting from 30 days ago to show recent + upcoming
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    params.append('timeMin', pastDate.toISOString());
  }

  if (options.timeMax) {
    params.append('timeMax', options.timeMax);
  }

  if (options.q && options.q.trim()) {
    params.append('q', options.q.trim());
  }

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/${calendarId}/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch events from Google Calendar (${res.status})`);
  }

  return await res.json();
}

/**
 * Create a new event in Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEventInput,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  const encodedCalId = encodeURIComponent(calendarId);

  // Default reminder configuration
  const eventPayload = {
    ...event,
    reminders: event.reminders || {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 1440 }, // 1 day before
      ],
    },
  };

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/${encodedCalId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create event in Google Calendar (${res.status})`);
  }

  return await res.json();
}

/**
 * Update an existing event in Google Calendar
 * (Requires explicit confirmation in UI for destructive mutations)
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  event: CalendarEventInput,
  calendarId: string = 'primary'
): Promise<CalendarEvent> {
  const encodedCalId = encodeURIComponent(calendarId);

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/${encodedCalId}/events/${encodeURIComponent(eventId)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update event in Google Calendar (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete an event from Google Calendar
 * Mandatory: must be preceded by a confirmation modal in the UI!
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const encodedCalId = encodeURIComponent(calendarId);

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/${encodedCalId}/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete event from Google Calendar (${res.status})`);
  }
}

/**
 * Parse time window to start and end ISO strings on the requested date
 */
function parseTimeWindow(dateStr: string, timeWindow?: string, specificTime?: string): { startISO: string; endISO: string } {
  // Trinidad & Tobago timezone is UTC-4 all year round (no DST)
  const tzOffset = '-04:00';
  let startHour = 9;
  let startMin = 0;
  let durationHours = 2;

  if (specificTime) {
    const match = specificTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : '';
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      startHour = h;
      startMin = m;
      durationHours = 2;
    }
  } else if (timeWindow) {
    if (timeWindow.toLowerCase().includes('early') || timeWindow.includes('6am')) {
      startHour = 6;
      durationHours = 3;
    } else if (timeWindow.toLowerCase().includes('morning') || timeWindow.includes('8am') || timeWindow.includes('9am')) {
      startHour = 9;
      durationHours = 3;
    } else if (timeWindow.toLowerCase().includes('afternoon') || timeWindow.includes('12pm')) {
      startHour = 13;
      durationHours = 3;
    } else if (timeWindow.toLowerCase().includes('evening') || timeWindow.includes('4pm')) {
      startHour = 16;
      durationHours = 3;
    }
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const startISO = `${dateStr}T${pad(startHour)}:${pad(startMin)}:00${tzOffset}`;

  const endHour = Math.min(23, startHour + durationHours);
  const endISO = `${dateStr}T${pad(endHour)}:${pad(startMin)}:00${tzOffset}`;

  return { startISO, endISO };
}

/**
 * Helper: Schedule a Medical Transport Request to Google Calendar
 */
export async function scheduleTransportInCalendar(
  accessToken: string,
  req: TransportRequest
): Promise<CalendarEvent> {
  const { startISO, endISO } = parseTimeWindow(req.requestedDate, req.preferredTimeWindow, req.specificTime);

  const summary = `🚑 [Medical Transport] ${req.contactName} (${req.reference})`;

  let description = `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES\n`;
  description += `Medical Transport & Travel Coordination\n\n`;
  description += `Reference: ${req.reference}\n`;
  description += `Passenger / Contact: ${req.contactName}\n`;
  description += `Phone: ${req.phone}\n`;
  if (req.email) description += `Email: ${req.email}\n`;
  description += `Transport Type: ${req.transportType}\n`;
  description += `Origin: ${req.origin}\n`;
  description += `Destination: ${req.destination}\n`;
  description += `Journey Type: ${req.journeyType}\n`;
  description += `Wheelchair Accessible: ${req.wheelchairAccessibilityRequired ? 'YES' : 'No'}\n`;
  description += `Boarding Assistance: ${req.boardingAssistanceRequired ? 'YES' : 'No'}\n`;
  description += `Inter-Island Transfer: ${req.isInterIsland ? 'YES (Trinidad/Tobago)' : 'No (Local Tobago)'}\n`;
  if (req.notes) description += `\nSpecial Notes: ${req.notes}\n`;
  description += `\nCollection & Operations Base: Burnett Hill, Scarborough, Tobago (Next to Sports and Games).\n`;

  const attendees: Array<{ email: string; displayName?: string }> = [];
  if (req.email && req.email.includes('@')) {
    attendees.push({ email: req.email, displayName: req.contactName });
  }

  const eventInput: CalendarEventInput = {
    summary,
    description,
    location: `${req.origin} ➔ ${req.destination}`,
    start: { dateTime: startISO, timeZone: TOBAGO_TIMEZONE },
    end: { dateTime: endISO, timeZone: TOBAGO_TIMEZONE },
    attendees: attendees.length > 0 ? attendees : undefined,
    colorId: '9', // Blueberry / Navy Blue in Google Calendar palette
  };

  return await createCalendarEvent(accessToken, eventInput);
}

/**
 * Helper: Schedule Equipment Rental Fulfilment / Return in Google Calendar
 */
export async function scheduleRentalInCalendar(
  accessToken: string,
  req: RentalRequest
): Promise<CalendarEvent> {
  // If delivery or collection, start on requested date
  const tzOffset = '-04:00';
  const startISO = `${req.requestedStartDate}T09:30:00${tzOffset}`;
  const endISO = `${req.requestedStartDate}T11:30:00${tzOffset}`;

  const summary = `📦 [Equipment Rental] ${req.equipmentCategory} - ${req.customerName} (${req.reference})`;

  let description = `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES\n`;
  description += `Medical Equipment Rental Booking\n\n`;
  description += `Reference: ${req.reference}\n`;
  description += `Customer: ${req.customerName}\n`;
  description += `Phone: ${req.phone}\n`;
  if (req.email) description += `Email: ${req.email}\n`;
  description += `Category: ${req.equipmentCategory} (Qty: ${req.quantityRequested})\n`;
  description += `Duration: ${req.expectedDurationDays} days\n`;
  description += `Fulfilment Mode: ${req.preferredFulfilment}\n`;
  if (req.deliveryGeneralLocation) description += `Delivery Location: ${req.deliveryGeneralLocation}\n`;
  if (req.allocatedAssetIds && req.allocatedAssetIds.length > 0) {
    description += `Allocated Asset Units: ${req.allocatedAssetIds.join(', ')}\n`;
  }
  description += `\nCollection Base: Burnett Hill, Scarborough, Tobago (Next to Sports and Games).\n`;

  const location = req.preferredFulfilment.includes('Collection')
    ? 'Burnett Hill, Scarborough, Tobago (Next to Sports and Games)'
    : req.deliveryGeneralLocation || 'Tobago, Trinidad and Tobago';

  const attendees: Array<{ email: string; displayName?: string }> = [];
  if (req.email && req.email.includes('@')) {
    attendees.push({ email: req.email, displayName: req.customerName });
  }

  const eventInput: CalendarEventInput = {
    summary,
    description,
    location,
    start: { dateTime: startISO, timeZone: TOBAGO_TIMEZONE },
    end: { dateTime: endISO, timeZone: TOBAGO_TIMEZONE },
    attendees: attendees.length > 0 ? attendees : undefined,
    colorId: '10', // Basil / Emerald Green
  };

  return await createCalendarEvent(accessToken, eventInput);
}

/**
 * Helper: Schedule Consultation Session in Google Calendar
 */
export async function scheduleConsultationInCalendar(
  accessToken: string,
  req: ConsultationRequest
): Promise<CalendarEvent> {
  const { startISO, endISO } = parseTimeWindow(req.preferredDate, req.preferredTimeSlot);

  const summary = `🩺 [Consultation] ${req.consultationTopic} - ${req.contactName} (${req.reference})`;

  let description = `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES\n`;
  description += `Patient Consultation & Planning Session\n\n`;
  description += `Reference: ${req.reference}\n`;
  description += `Client: ${req.contactName}\n`;
  description += `Phone: ${req.phone}\n`;
  if (req.email) description += `Email: ${req.email}\n`;
  description += `Topic: ${req.consultationTopic}\n`;
  description += `Preferred Window: ${req.preferredTimeSlot}\n`;
  if (req.message) description += `\nClient Discussion Notes:\n${req.message}\n`;
  description += `\nLocation / Channel: Telephone, WhatsApp Video, or Office at Burnett Hill, Scarborough, Tobago.\n`;

  const attendees: Array<{ email: string; displayName?: string }> = [];
  if (req.email && req.email.includes('@')) {
    attendees.push({ email: req.email, displayName: req.contactName });
  }

  const eventInput: CalendarEventInput = {
    summary,
    description,
    location: 'Burnett Hill, Scarborough, Tobago / Remote Telehealth',
    start: { dateTime: startISO, timeZone: TOBAGO_TIMEZONE },
    end: { dateTime: endISO, timeZone: TOBAGO_TIMEZONE },
    attendees: attendees.length > 0 ? attendees : undefined,
    colorId: '3', // Grape / Purple
  };

  return await createCalendarEvent(accessToken, eventInput);
}
