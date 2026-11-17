import React, { useState } from 'react';
import {
  Car,
  Plane,
  Ship,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Send,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { operationsStore } from '../services/operationsStore';
import { TransportRequest, TransportPathway } from '../types';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { scheduleTransportInCalendar } from '../services/calendarService';

export const TransportPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submittedRequest, setSubmittedRequest] = useState<TransportRequest | null>(null);
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const handleAddToCalendar = async () => {
    if (!submittedRequest) return;
    setCalendarSyncStatus('syncing');
    setCalendarError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        token = authRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Google authentication is required to access your Google Calendar.');
      }
      await scheduleTransportInCalendar(token, submittedRequest);
      setCalendarSyncStatus('success');
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setCalendarError(err.message || 'Failed to add transport journey to Google Calendar.');
      setCalendarSyncStatus('error');
    }
  };

  // Form State
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [passengerRelationship, setPassengerRelationship] = useState<'Self' | 'Family Member' | 'Caregiver' | 'Healthcare Professional' | 'Other'>('Self');

  const [transportType, setTransportType] = useState<TransportRequest['transportType']>('Local Tobago Non-Emergency');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState<TransportRequest['preferredTimeWindow']>('Morning (8am - 12pm)');
  const [specificTime, setSpecificTime] = useState('');
  const [journeyType, setJourneyType] = useState<'One-way' | 'Return'>('One-way');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [hasAccompanyingPerson, setHasAccompanyingPerson] = useState(false);
  const [isInterIsland, setIsInterIsland] = useState(false);

  const [wheelchairAccessibilityRequired, setWheelchairAccessibilityRequired] = useState(false);
  const [boardingAssistanceRequired, setBoardingAssistanceRequired] = useState(false);
  const [lyingFlatRequested, setLyingFlatRequested] = useState(false);
  const [medicalEquipmentAccompanying, setMedicalEquipmentAccompanying] = useState(false);
  const [accompanyingEquipmentDetails, setAccompanyingEquipmentDetails] = useState('');
  const [escortRequired, setEscortRequired] = useState(false);
  const [additionalLogisticalNotes, setAdditionalLogisticalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine provisional pathway preview based on selections
  const getProvisionalPathway = (): TransportPathway => {
    if (isInterIsland) {
      if (transportType === 'Airport/Ferry Connection') return 'Airline coordination required';
      return 'Mixed transport arrangement required';
    }
    if (wheelchairAccessibilityRequired || boardingAssistanceRequired) {
      return 'Company vehicle assessment required';
    }
    return 'Independent transport provider required';
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.contactName = 'Please enter contact person name.';
    if (!phone.trim()) errs.phone = 'Please enter a contact telephone number.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!origin.trim()) errs.origin = 'Please enter pickup location/origin.';
    if (!destination.trim()) errs.destination = 'Please enter destination.';
    if (!requestedDate) errs.requestedDate = 'Please select a requested journey date.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => (prev < 5 ? ((prev + 1) as any) : prev));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = operationsStore.createTransportRequest({
      contactName,
      phone,
      email: email || undefined,
      preferredContactMethod,
      passengerRelationship,
      transportType,
      origin,
      destination,
      requestedDate,
      preferredTimeWindow,
      specificTime: specificTime || undefined,
      journeyType,
      passengerCount,
      hasAccompanyingPerson,
      isInterIsland,
      wheelchairAccessibilityRequired,
      boardingAssistanceRequired,
      lyingFlatRequested,
      medicalEquipmentAccompanying,
      accompanyingEquipmentDetails: accompanyingEquipmentDetails || undefined,
      escortRequired,
      additionalLogisticalNotes: additionalLogisticalNotes || undefined,
      pathway: getProvisionalPathway(),
    });
    setSubmittedRequest(newReq);
  };

  const resetForm = () => {
    setSubmittedRequest(null);
    setStep(1);
    setOrigin('');
    setDestination('');
    setRequestedDate('');
    setSpecificTime('');
    setAccompanyingEquipmentDetails('');
    setAdditionalLogisticalNotes('');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
            Service Division A
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Medical Transport & Travel Coordination
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed max-w-3xl">
            We facilitate suitable non-emergency medical transportation and travel arrangements throughout Trinidad and Tobago. We assist individuals, families, and healthcare organisations with reliable scheduling, vehicle assessment, and inter-island coordination.
          </p>
        </div>

        {/* Essential Operating Principles & Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-700" />
              <span>How Transport Is Arranged</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-sky-700 font-bold">•</span>
                <span><strong>Company Vehicle:</strong> Used for certain local non-emergency transport arrangements where vehicle suitability and scheduling permit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-700 font-bold">•</span>
                <span><strong>Independent Providers:</strong> Coordinated through verified third-party drivers and transport operators across Tobago and Trinidad.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-700 font-bold">•</span>
                <span><strong>Airline & Sea Travel:</strong> Assistance coordinating commercial inter-island flights (e.g. between ANR Robinson and Piarco) and inter-island ferry sailings.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-3">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Service Limitations & Medical Safety</span>
            </h3>
            <p className="leading-relaxed">
              <strong>Non-Emergency Only:</strong> Tobago Healthcare Equipment & Supplies does not own or operate an emergency ambulance or aircraft, nor do we provide emergency sirens or emergency clinical dispatch.
            </p>
            <p className="leading-relaxed">
              We communicate with transport operators, airlines, and port authorities on your behalf, but do not claim formal partnerships or endorsements without verified authorization. All journeys remain subject to vehicle suitability, provider confirmation, accessibility review, and agreed pricing.
            </p>
          </div>
        </div>

        {/* 5-Step Transport Request Application Workflow */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {submittedRequest ? (
            /* Submission Confirmation Screen */
            <div className="p-8 sm:p-12 space-y-6 text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Transport Enquiry Lodged Successfully
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Enquiry Reference: {submittedRequest.reference}
                </h2>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Thank you for contacting Tobago Healthcare Equipment & Supplies. Your transport enquiry has been received. Our team will review your request and contact you at <strong>{submittedRequest.phone}</strong> to discuss possible arrangements.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Journey Route:</span>
                  <span className="font-semibold text-slate-800">{submittedRequest.origin} → {submittedRequest.destination}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Requested Date:</span>
                  <span className="font-semibold text-slate-800">{submittedRequest.requestedDate} ({submittedRequest.preferredTimeWindow})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Initial Pathway:</span>
                  <span className="font-medium text-sky-800">{submittedRequest.pathway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-semibold text-amber-700">{submittedRequest.status}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-left">
                <strong>Important Notice:</strong> Your journey is not confirmed until the details have been reviewed, suitability agreed, and written confirmation has been issued by our staff.
              </div>

              {/* Google Calendar Sync Action */}
              <div className="pt-1">
                {calendarSyncStatus === 'success' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Transport request reminder added to your Google Calendar!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleAddToCalendar}
                      disabled={calendarSyncStatus === 'syncing'}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {calendarSyncStatus === 'syncing' ? 'Connecting to Google Calendar...' : 'Add to My Google Calendar'}
                      </span>
                    </button>
                    {calendarError && (
                      <p className="text-[11px] text-rose-600">{calendarError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
                    `Hello, I would like to enquire about medical transportation. My request reference is ${submittedRequest.reference}. Could you please contact me to discuss availability and arrangements?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send Reference on WhatsApp</span>
                </a>

                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            /* Multi-step Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              
              {/* Progress Indicator */}
              <div className="border-b border-slate-200 pb-5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Step {step} of 5</span>
                  <span className="text-sky-700">
                    {step === 1 && 'Contact Information'}
                    {step === 2 && 'Journey Details'}
                    {step === 3 && 'Accessibility & Logistics'}
                    {step === 4 && 'Transport Pathway Preview'}
                    {step === 5 && 'Review & Submission'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-700 h-full transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: CONTACT INFORMATION */}
              {step === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 1: Contact Information</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provide contact details so our team can follow up regarding your transport request.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Person's Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        if (errors.contactName) setErrors({ ...errors, contactName: '' });
                      }}
                      placeholder="e.g. Maria Charles"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    />
                    {errors.contactName && <p className="text-[11px] text-rose-600 mt-1">{errors.contactName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Telephone Number (WhatsApp preferred) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="e.g. +1 (868) 495-0000"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                      {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. maria@example.tt"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        value={preferredContactMethod}
                        onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Relationship to Passenger
                      </label>
                      <select
                        value={passengerRelationship}
                        onChange={(e) => setPassengerRelationship(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      >
                        <option value="Self">Self (I am the passenger)</option>
                        <option value="Family Member">Family Member</option>
                        <option value="Caregiver">Caregiver</option>
                        <option value="Healthcare Professional">Healthcare Professional</option>
                        <option value="Other">Other Contact</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: JOURNEY DETAILS */}
              {step === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 2: Journey Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specify journey origins, destination, requested date, and travel requirements.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transport Assistance Type
                    </label>
                    <select
                      value={transportType}
                      onChange={(e) => setTransportType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    >
                      <option value="Local Tobago Non-Emergency">Local Tobago Non-Emergency Transport</option>
                      <option value="Clinic/Hospital Appointment">Clinic / Hospital Outpatient Appointment Transfer</option>
                      <option value="Airport/Ferry Connection">Airport / Ferry Port Connection</option>
                      <option value="Trinidad Inter-Island Medical Transfer">Trinidad Inter-Island Travel Coordination</option>
                      <option value="Other Non-Emergency">Other Scheduled Non-Emergency Travel</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pickup Location / Origin <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => {
                          setOrigin(e.target.value);
                          if (errors.origin) setErrors({ ...errors, origin: '' });
                        }}
                        placeholder="e.g. Burnett Hill, Scarborough or Home address"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                      {errors.origin && <p className="text-[11px] text-rose-600 mt-1">{errors.origin}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Destination <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          if (errors.destination) setErrors({ ...errors, destination: '' });
                        }}
                        placeholder="e.g. Scarborough General Hospital or Ferry Terminal"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                      {errors.destination && <p className="text-[11px] text-rose-600 mt-1">{errors.destination}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Requested Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={(e) => {
                          setRequestedDate(e.target.value);
                          if (errors.requestedDate) setErrors({ ...errors, requestedDate: '' });
                        }}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                      {errors.requestedDate && <p className="text-[11px] text-rose-600 mt-1">{errors.requestedDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Time Window
                      </label>
                      <select
                        value={preferredTimeWindow}
                        onChange={(e) => setPreferredTimeWindow(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      >
                        <option value="Morning (8am - 12pm)">Morning (8am - 12pm)</option>
                        <option value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</option>
                        <option value="Evening (4pm - 8pm)">Evening (4pm - 8pm)</option>
                        <option value="Specific Time">Specific Time (Specify below)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Journey Type
                      </label>
                      <select
                        value={journeyType}
                        onChange={(e) => setJourneyType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      >
                        <option value="One-way">One-way Journey</option>
                        <option value="Return">Return Journey</option>
                      </select>
                    </div>
                  </div>

                  {preferredTimeWindow === 'Specific Time' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specific Departure Time
                      </label>
                      <input
                        type="time"
                        value={specificTime}
                        onChange={(e) => setSpecificTime(e.target.value)}
                        className="w-full max-w-xs px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAccompanyingPerson}
                        onChange={(e) => setHasAccompanyingPerson(e.target.checked)}
                        className="rounded text-sky-700 focus:ring-sky-600"
                      />
                      <span>An accompanying family member/caregiver will travel along</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInterIsland}
                        onChange={(e) => setIsInterIsland(e.target.checked)}
                        className="rounded text-sky-700 focus:ring-sky-600"
                      />
                      <span>This journey involves inter-island travel between Tobago and Trinidad</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: ACCESSIBILITY & LOGISTICAL REQUIREMENTS */}
              {step === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 3: Accessibility & Logistics</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Help us assess vehicle suitability without providing confidential medical history or clinical diagnosis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={wheelchairAccessibilityRequired}
                        onChange={(e) => setWheelchairAccessibilityRequired(e.target.checked)}
                        className="mt-0.5 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">Wheelchair Accessibility Required</span>
                        <span className="text-slate-500">Passenger requires vehicle capable of transporting or loading a wheelchair.</span>
                      </div>
                    </label>

                    <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={boardingAssistanceRequired}
                        onChange={(e) => setBoardingAssistanceRequired(e.target.checked)}
                        className="mt-0.5 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">Boarding / Exiting Assistance</span>
                        <span className="text-slate-500">Passenger requires physical guiding or steadying to enter/exit the vehicle.</span>
                      </div>
                    </label>

                    <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={lyingFlatRequested}
                        onChange={(e) => setLyingFlatRequested(e.target.checked)}
                        className="mt-0.5 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">Lying-Flat Arrangement Requested</span>
                        <span className="text-slate-500">Note: Subject to strict vehicle capacity assessment. Emergency transfers require ambulance (811).</span>
                      </div>
                    </label>

                    <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={medicalEquipmentAccompanying}
                        onChange={(e) => setMedicalEquipmentAccompanying(e.target.checked)}
                        className="mt-0.5 rounded text-sky-700 focus:ring-sky-600"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">Medical Equipment Accompanying</span>
                        <span className="text-slate-500">e.g., portable oxygen concentrator, walker, or medical bags.</span>
                      </div>
                    </label>
                  </div>

                  {medicalEquipmentAccompanying && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Accompanying Equipment Details
                      </label>
                      <input
                        type="text"
                        value={accompanyingEquipmentDetails}
                        onChange={(e) => setAccompanyingEquipmentDetails(e.target.value)}
                        placeholder="e.g., Portable oxygen concentrator (battery powered), foldable walker"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Additional Logistical Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={additionalLogisticalNotes}
                      onChange={(e) => setAdditionalLogisticalNotes(e.target.value)}
                      placeholder="e.g. House has 3 entrance steps, or need drop-off at Outpatient gate 2"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: TRANSPORT PATHWAY PREVIEW */}
              {step === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 4: Operational Pathway Assessment</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Based on your requested route and accessibility requirements, our operational team categorises the arrangement pathway.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase">
                      <FileCheck className="w-4 h-4 text-sky-700" />
                      <span>Provisional Routing Pathway:</span>
                    </div>

                    <div className="text-base font-bold text-slate-900">
                      {getProvisionalPathway()}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isInterIsland
                        ? 'This journey requires inter-island logistics (flight coordination or sea ferry crossing). Staff will verify booking requirements with carriers and arrange ground connections on both islands.'
                        : wheelchairAccessibilityRequired
                        ? 'This request will be evaluated for company wheelchair-accessible vehicle allocation or verified accessible transport provider availability.'
                        : 'This journey will be scheduled with an approved local transport provider or company vehicle according to calendar availability.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-2">
                    <span className="font-semibold text-slate-800 block">Coordination Safeguards:</span>
                    <p>• Customers may express preferences, but Tobago Healthcare Equipment & Supplies determines vehicle and provider assignment.</p>
                    <p>• We do not promise accommodation until vehicle suitability and scheduling are confirmed by our team.</p>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & SUBMIT */}
              {step === 5 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 5: Review Summary & Submit Request</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please review your details before submitting your transport request.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Contact Person</span>
                        <span className="font-semibold text-slate-900">{contactName} ({phone})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Relationship</span>
                        <span className="font-semibold text-slate-900">{passengerRelationship}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Pickup / Origin</span>
                        <span className="font-semibold text-slate-900">{origin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Destination</span>
                        <span className="font-semibold text-slate-900">{destination}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Date & Window</span>
                        <span className="font-semibold text-slate-900">{requestedDate} ({preferredTimeWindow})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Journey Type</span>
                        <span className="font-semibold text-slate-900">{journeyType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Wheelchair Access</span>
                        <span className="font-semibold text-slate-900">{wheelchairAccessibilityRequired ? 'Yes (Required)' : 'No'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Operational Pathway</span>
                      <span className="font-semibold text-sky-800">{getProvisionalPathway()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                    <strong>Notice Before Submitting:</strong>
                    <p>• Submitting this form sends an enquiry for review, not a confirmed booking.</p>
                    <p>• Our team will contact you to discuss vehicle suitability, availability, and pricing in TTD.</p>
                    <p>• This service is non-emergency. In life-threatening emergencies, call 811 immediately.</p>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Step</span>
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Transport Request</span>
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
