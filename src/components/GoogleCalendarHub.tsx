import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Car,
  Bed,
  CalendarCheck,
  Filter,
  UserCheck,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  scheduleTransportInCalendar,
  scheduleRentalInCalendar,
  scheduleConsultationInCalendar,
  CalendarEvent,
  CalendarEventInput,
  TOBAGO_TIMEZONE,
} from '../services/calendarService';
import { operationsStore } from '../services/operationsStore';
import { TransportRequest, RentalRequest, ConsultationRequest } from '../types';

interface GoogleCalendarHubProps {
  onNotify?: (msg: string) => void;
}

export const GoogleCalendarHub: React.FC<GoogleCalendarHubProps> = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transport' | 'rental' | 'consultation'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New Event Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventType, setEventType] = useState<'transport' | 'rental' | 'consultation' | 'general'>('transport');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('11:00');
  const [eventLocation, setEventLocation] = useState('Burnett Hill, Scarborough, Tobago');
  const [eventAttendeeEmail, setEventAttendeeEmail] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Destructive Delete Confirmation Modal State (MANDATORY SAFEGUARD)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick-sync pending operational requests
  const [transportReqs, setTransportReqs] = useState<TransportRequest[]>(operationsStore.getTransportRequests());
  const [rentalReqs, setRentalReqs] = useState<RentalRequest[]>(operationsStore.getRentalRequests());
  const [consultReqs, setConsultReqs] = useState<ConsultationRequest[]>(operationsStore.getConsultationRequests());
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch events when access token changes
  useEffect(() => {
    if (accessToken) {
      loadCalendarEvents(accessToken);
    } else {
      setEvents([]);
    }
  }, [accessToken]);

  // Subscribe to operations store changes for operational queue
  useEffect(() => {
    const unsub = operationsStore.subscribe(() => {
      setTransportReqs(operationsStore.getTransportRequests());
      setRentalReqs(operationsStore.getRentalRequests());
      setConsultReqs(operationsStore.getConsultationRequests());
    });
    return () => unsub();
  }, []);

  const loadCalendarEvents = async (token: string, q?: string) => {
    setLoadingEvents(true);
    setErrorMsg(null);
    try {
      const result = await listCalendarEvents(token, { q });
      setEvents(result.items || []);
    } catch (err: any) {
      console.error('Error fetching Calendar events:', err);
      setErrorMsg(err.message || 'Unable to load events from Google Calendar.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMsg('Successfully connected to Google Calendar.');
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setErrorMsg(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setEvents([]);
      setStatusMsg('Disconnected from Google Calendar.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setErrorMsg('Error signing out.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadCalendarEvents(accessToken, searchQuery);
    }
  };

  // Quick preset title & location updater
  const handlePresetChange = (type: 'transport' | 'rental' | 'consultation' | 'general') => {
    setEventType(type);
    if (type === 'transport') {
      setEventTitle('🚑 [Medical Transport] Non-Emergency Patient Journey');
      setEventLocation('Scarborough General Hospital Outpatient Clinic');
      setEventStartTime('08:30');
      setEventEndTime('10:30');
    } else if (type === 'rental') {
      setEventTitle('📦 [Equipment Rental] Hospital Bed Delivery & Setup');
      setEventLocation('Burnett Hill, Scarborough, Tobago');
      setEventStartTime('10:00');
      setEventEndTime('12:00');
    } else if (type === 'consultation') {
      setEventTitle('🩺 [Consultation] Travel Coordination & Equipment Assessment');
      setEventLocation('Burnett Hill, Scarborough or Telehealth');
      setEventStartTime('14:00');
      setEventEndTime('15:00');
    } else {
      setEventTitle('Healthcare Service Appointment');
      setEventLocation('Burnett Hill, Scarborough, Tobago');
      setEventStartTime('09:00');
      setEventEndTime('10:00');
    }
  };

  // Create Event Form Submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !eventTitle.trim() || !eventDate) return;

    setIsSubmittingEvent(true);
    setErrorMsg(null);

    try {
      const tzOffset = '-04:00';
      const startDateTime = `${eventDate}T${eventStartTime}:00${tzOffset}`;
      const endDateTime = `${eventDate}T${eventEndTime}:00${tzOffset}`;

      let colorId = '1';
      if (eventType === 'transport') colorId = '9'; // Blueberry
      if (eventType === 'rental') colorId = '10';   // Basil
      if (eventType === 'consultation') colorId = '3'; // Grape

      const attendees = eventAttendeeEmail.trim()
        ? [{ email: eventAttendeeEmail.trim() }]
        : undefined;

      const eventPayload: CalendarEventInput = {
        summary: eventTitle.trim(),
        description: `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES\nBurnett Hill, Scarborough, Tobago (Next to Sports and Games)\n\nService Details:\n${eventNotes || 'Standard scheduled session.'}`,
        location: eventLocation.trim(),
        start: { dateTime: startDateTime, timeZone: TOBAGO_TIMEZONE },
        end: { dateTime: endDateTime, timeZone: TOBAGO_TIMEZONE },
        attendees,
        colorId,
      };

      await createCalendarEvent(accessToken, eventPayload);
      setStatusMsg(`Event "${eventTitle.trim()}" added to Google Calendar.`);
      setTimeout(() => setStatusMsg(null), 3500);
      setIsCreateModalOpen(false);
      setEventNotes('');
      setEventAttendeeEmail('');
      loadCalendarEvents(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create event in Google Calendar.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Quick sync transport request to Calendar
  const handleSyncTransport = async (req: TransportRequest) => {
    if (!accessToken) return;
    setSyncingId(req.id);
    setErrorMsg(null);
    try {
      await scheduleTransportInCalendar(accessToken, req);
      setStatusMsg(`Transport journey (${req.reference}) scheduled in Google Calendar!`);
      setTimeout(() => setStatusMsg(null), 3500);
      loadCalendarEvents(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync transport to Calendar.');
    } finally {
      setSyncingId(null);
    }
  };

  // Quick sync rental request to Calendar
  const handleSyncRental = async (req: RentalRequest) => {
    if (!accessToken) return;
    setSyncingId(req.id);
    setErrorMsg(null);
    try {
      await scheduleRentalInCalendar(accessToken, req);
      setStatusMsg(`Rental booking (${req.reference}) scheduled in Google Calendar!`);
      setTimeout(() => setStatusMsg(null), 3500);
      loadCalendarEvents(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync rental to Calendar.');
    } finally {
      setSyncingId(null);
    }
  };

  // Quick sync consultation request to Calendar
  const handleSyncConsultation = async (req: ConsultationRequest) => {
    if (!accessToken) return;
    setSyncingId(req.id);
    setErrorMsg(null);
    try {
      await scheduleConsultationInCalendar(accessToken, req);
      setStatusMsg(`Consultation (${req.reference}) scheduled in Google Calendar!`);
      setTimeout(() => setStatusMsg(null), 3500);
      loadCalendarEvents(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync consultation to Calendar.');
    } finally {
      setSyncingId(null);
    }
  };

  // Confirm and execute destructive delete (MANDATORY SAFEGUARD)
  const confirmDeleteEvent = async () => {
    if (!eventToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteCalendarEvent(accessToken, eventToDelete.id);
      setStatusMsg(`Deleted event "${eventToDelete.summary}" from Google Calendar.`);
      setTimeout(() => setStatusMsg(null), 3500);
      setEventToDelete(null);
      loadCalendarEvents(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete event from Google Calendar.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (filterType === 'transport') {
      return ev.summary.toLowerCase().includes('transport') || ev.summary.includes('🚑');
    }
    if (filterType === 'rental') {
      return ev.summary.toLowerCase().includes('rental') || ev.summary.includes('📦');
    }
    if (filterType === 'consultation') {
      return ev.summary.toLowerCase().includes('consultation') || ev.summary.includes('🩺');
    }
    return true;
  });

  // Format date helper
  const formatEventTime = (ev: CalendarEvent) => {
    if (ev.start.date) {
      return `All Day · ${new Date(ev.start.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (ev.start.dateTime) {
      const d = new Date(ev.start.dateTime);
      const datePart = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart} at ${timePart}`;
    }
    return 'Scheduled Time';
  };

  const getEventBadge = (summary: string) => {
    if (summary.toLowerCase().includes('transport') || summary.includes('🚑')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">
          <Car className="w-3 h-3" /> Medical Transport
        </span>
      );
    }
    if (summary.toLowerCase().includes('rental') || summary.includes('📦')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
          <Bed className="w-3 h-3" /> Equipment Rental
        </span>
      );
    }
    if (summary.toLowerCase().includes('consultation') || summary.includes('🩺')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
          <CalendarCheck className="w-3 h-3" /> Consultation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
        <Calendar className="w-3 h-3" /> Appointment
      </span>
    );
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              Google Workspace Cloud Integration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Google Calendar Scheduling & Dispatches
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Coordinate medical transport vehicle departures, equipment rental deliveries/collections, and patient consultation sessions with real-time Google Calendar synchronization.
            </p>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google Account'}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                  {currentUser.displayName || 'Google User'}
                </span>
                <span className="text-slate-500 block truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
                title="Disconnect Google Calendar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Status & Error Alerts */}
        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If Not Authenticated: Official Styled Google Sign-In */}
        {!currentUser ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Connect Your Google Calendar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sign in with Google to view and schedule medical transports, equipment deliveries, and patient consultations on your Google Calendar with your explicit permission.
              </p>
            </div>

            {/* Official Google Sign-in Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Authentication and tokens are handled strictly in-memory per Google Workspace least-privilege security guidelines. Timezone: Trinidad & Tobago (GMT-4).
            </div>
          </div>
        ) : (
          /* Authenticated Calendar Interface */
          <div className="space-y-8">
            
            {/* Quick Sync Queue Banner: Pending Operational Requests Ready to Schedule */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Operational Queue · 1-Click Sync to Google Calendar
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Instantly schedule patient bookings into your Google Calendar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transport Quick Sync item */}
                {transportReqs.slice(0, 1).map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          Transport
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{t.reference}</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900">{t.contactName}</div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {t.origin} ➔ {t.destination}
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Date: {t.requestedDate} ({t.preferredTimeWindow})
                      </div>
                    </div>

                    <button
                      onClick={() => handleSyncTransport(t)}
                      disabled={syncingId === t.id}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{syncingId === t.id ? 'Scheduling...' : 'Add to Calendar'}</span>
                    </button>
                  </div>
                ))}

                {/* Rental Quick Sync item */}
                {rentalReqs.slice(0, 1).map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Rental
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{r.reference}</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900">{r.customerName}</div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {r.equipmentCategory} (Qty: {r.quantityRequested})
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Starts: {r.requestedStartDate} ({r.expectedDurationDays} days)
                      </div>
                    </div>

                    <button
                      onClick={() => handleSyncRental(r)}
                      disabled={syncingId === r.id}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{syncingId === r.id ? 'Scheduling...' : 'Add to Calendar'}</span>
                    </button>
                  </div>
                ))}

                {/* Consultation Quick Sync item */}
                {consultReqs.slice(0, 1).map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          Consultation
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{c.reference}</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900">{c.contactName}</div>
                      <p className="text-[11px] text-slate-600 leading-tight truncate">
                        {c.consultationTopic}
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Date: {c.preferredDate} ({c.preferredTimeSlot})
                      </div>
                    </div>

                    <button
                      onClick={() => handleSyncConsultation(c)}
                      disabled={syncingId === c.id}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{syncingId === c.id ? 'Scheduling...' : 'Add to Calendar'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar & Controls */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by patient name, reference code, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </form>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Filter Type Pills */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      filterType === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('transport')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      filterType === 'transport' ? 'bg-white text-sky-800 shadow-xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Transport
                  </button>
                  <button
                    onClick={() => setFilterType('rental')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      filterType === 'rental' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Rentals
                  </button>
                  <button
                    onClick={() => setFilterType('consultation')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      filterType === 'consultation' ? 'bg-white text-purple-800 shadow-xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Consults
                  </button>
                </div>

                {/* Schedule Event Button */}
                <button
                  onClick={() => {
                    handlePresetChange('transport');
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Schedule Event</span>
                </button>

                {/* Refresh */}
                <button
                  onClick={() => accessToken && loadCalendarEvents(accessToken, searchQuery)}
                  disabled={loadingEvents}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Refresh calendar events"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* Calendar Events List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Calendar Events ({filteredEvents.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Google Calendar · Timezone: America/Port_of_Spain (GMT-4)
                </span>
              </div>

              {loadingEvents ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                  <span>Loading schedule from Google Calendar...</span>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {getEventBadge(ev.summary)}
                          <span className="text-xs font-bold text-slate-900">
                            {ev.summary}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatEventTime(ev)}</span>
                          </div>

                          {ev.location && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-xs">{ev.location}</span>
                            </div>
                          )}

                          {ev.attendees && ev.attendees.length > 0 && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>{ev.attendees.map((a) => a.displayName || a.email).join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1 whitespace-pre-line">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Event Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Open in Google Calendar"
                          >
                            <span>Open in Calendar</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        )}

                        {/* Mandatory Destructive Action with Confirmation Modal */}
                        <button
                          onClick={() => setEventToDelete(ev)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete from Google Calendar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700 text-sm">
                    No scheduled events found in Google Calendar.
                  </p>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Use the "Schedule Event" button above or click "Add to Calendar" on any pending booking in your operational queue.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Schedule New Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Schedule New Google Calendar Event
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Type Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Service Category Preset</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetChange('transport')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    eventType === 'transport'
                      ? 'bg-sky-50 border-sky-600 text-sky-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Transport
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('rental')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    eventType === 'rental'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Rental
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('consultation')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    eventType === 'consultation'
                      ? 'bg-purple-50 border-purple-600 text-purple-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Consult
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('general')}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    eventType === 'general'
                      ? 'bg-slate-100 border-slate-600 text-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  General
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  placeholder="e.g. 🚑 [Medical Transport] Patient Transfer"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (Tobago or Trinidad)
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Burnett Hill, Scarborough, Tobago"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invited Attendee Email (Optional)
                </label>
                <input
                  type="email"
                  value={eventAttendeeEmail}
                  onChange={(e) => setEventAttendeeEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Notes & Details
                </label>
                <textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  rows={3}
                  placeholder="Include vehicle pathway, equipment serial numbers, or special escort requirements..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent || !eventTitle.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer shadow-xs"
                >
                  {isSubmittingEvent ? 'Saving to Calendar...' : 'Confirm & Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY DESTRUCTIVE CONFIRMATION MODAL FOR CALENDAR DELETION */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion from Google Calendar
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to permanently delete the calendar event{' '}
                <strong>"{eventToDelete.summary}"</strong> scheduled for{' '}
                <strong>{formatEventTime(eventToDelete)}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
