import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  Send,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { operationsStore } from '../services/operationsStore';
import { ConsultationRequest } from '../types';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { scheduleConsultationInCalendar } from '../services/calendarService';

export const ConsultationsPage: React.FC = () => {
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consultationTopic, setConsultationTopic] = useState<ConsultationRequest['consultationTopic']>('Transport Arrangements');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<ConsultationRequest['preferredTimeSlot']>('Morning (9am - 12pm)');
  const [message, setMessage] = useState('');

  const [submittedConsultation, setSubmittedConsultation] = useState<ConsultationRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const handleAddToCalendar = async () => {
    if (!submittedConsultation) return;
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
      await scheduleConsultationInCalendar(token, submittedConsultation);
      setCalendarSyncStatus('success');
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setCalendarError(err.message || 'Failed to add appointment to Google Calendar.');
      setCalendarSyncStatus('error');
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.contactName = 'Please enter your full name.';
    if (!phone.trim()) errs.phone = 'Please enter a contact phone number.';
    if (!preferredDate) errs.preferredDate = 'Please select a preferred date.';
    if (!message.trim()) errs.message = 'Please provide brief details on what you would like to discuss.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newReq = operationsStore.createConsultationRequest({
      contactName,
      phone,
      email: email || undefined,
      consultationTopic,
      preferredDate,
      preferredTimeSlot,
      message,
    });

    setSubmittedConsultation(newReq);
  };

  const resetForm = () => {
    setSubmittedConsultation(null);
    setContactName('');
    setPhone('');
    setEmail('');
    setPreferredDate('');
    setMessage('');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
            Service Consultations & Planning
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Schedule a Consultation
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Planning non-emergency medical transportation, coordinating an inter-island trip to Trinidad, or assessing medical equipment rental options? Request a focused discussion with our team.
          </p>
        </div>

        {/* Overview of topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">Transport Planning</span>
            <p className="text-[11px] text-slate-500">Route feasibility, vehicle suitability, and clinic timing.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">Inter-Island Travel</span>
            <p className="text-[11px] text-slate-500">Flight & ferry connections and wheelchair transit.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">Equipment Options</span>
            <p className="text-[11px] text-slate-500">Hospital beds, wheelchairs, and oxygen specifications.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">Accessibility Review</span>
            <p className="text-[11px] text-slate-500">Stairs, transfer assists, and escort coordination.</p>
          </div>
        </div>

        {/* Consultation Form or Confirmation */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs">
          {submittedConsultation ? (
            <div className="space-y-6 text-center max-w-lg mx-auto py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Consultation Request Received
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Reference: {submittedConsultation.reference}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Thank you, {submittedConsultation.contactName}. Your consultation request has been received. Our team will review staff availability and reach out at <strong>{submittedConsultation.phone}</strong> to confirm your appointment time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Topic:</span>
                  <span className="font-semibold text-slate-800">{submittedConsultation.consultationTopic}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Preferred Date:</span>
                  <span className="font-semibold text-slate-800">{submittedConsultation.preferredDate} ({submittedConsultation.preferredTimeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-amber-700">Pending Staff Confirmation</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-left">
                <strong>Appointment Confirmation Notice:</strong> Preferred dates and times remain provisional until confirmed by an authorized staff coordinator.
              </div>

              {/* Google Calendar Sync Action */}
              <div className="pt-1">
                {calendarSyncStatus === 'success' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Consultation provisional slot added to your Google Calendar!</span>
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
                    `Hello, I would like to request a consultation with Tobago Healthcare Equipment & Supplies. My reference is ${submittedConsultation.reference}. Please let me know the available appointment options.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Follow Up on WhatsApp</span>
                </a>

                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Schedule Another Consultation
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Consultation Request Form
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit your contact details and preferred time window for review.
                </p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      if (errors.contactName) setErrors({ ...errors, contactName: '' });
                    }}
                    placeholder="e.g. Kenneth George"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                  {errors.contactName && <p className="text-[11px] text-rose-600 mt-1">{errors.contactName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
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
              </div>

              {/* Email & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kenneth@example.tt"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Discussion Topic
                  </label>
                  <select
                    value={consultationTopic}
                    onChange={(e) => setConsultationTopic(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  >
                    <option value="Transport Arrangements">Transport Arrangements</option>
                    <option value="Inter-Island Travel Coordination">Inter-Island Travel Coordination</option>
                    <option value="Accessibility Requirements">Accessibility Requirements</option>
                    <option value="Medical Equipment Rental Options">Medical Equipment Rental Options</option>
                    <option value="Other Relevant Service Enquiries">Other Relevant Service Enquiries</option>
                  </select>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      if (errors.preferredDate) setErrors({ ...errors, preferredDate: '' });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                  {errors.preferredDate && <p className="text-[11px] text-rose-600 mt-1">{errors.preferredDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  >
                    <option value="Morning (9am - 12pm)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1pm - 4pm)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Late Afternoon (4pm - 6pm)">Late Afternoon (4:00 PM - 6:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discussion Details / Specific Questions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Please describe your passenger requirements, travel timing, or equipment questions..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
                {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
              </div>

              <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-500 leading-relaxed">
                <strong>Schedule Disclaimer:</strong> Submitting this request allows our staff to review your preferred window. No consultation is confirmed until an authorized staff member coordinates with you.
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Consultation Request</span>
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
