import React, { useState } from 'react';
import {
  Bed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Flame,
  Info,
  Calendar,
} from 'lucide-react';
import { RENTAL_CATEGORIES, CONFIRMED_BUSINESS_CONFIG, RentalCategoryInfo } from '../data/rentalData';
import { operationsStore } from '../services/operationsStore';
import { RentalRequest } from '../types';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { scheduleRentalInCalendar } from '../services/calendarService';

export const RentalsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<RentalCategoryInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedRental, setSubmittedRental] = useState<RentalRequest | null>(null);

  // Rental Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState<RentalRequest['equipmentCategory']>('Hospital beds');
  const [quantityRequested, setQuantityRequested] = useState<number>(1);
  const [requestedStartDate, setRequestedStartDate] = useState('');
  const [expectedDurationDays, setExpectedDurationDays] = useState<number>(14);
  const [preferredFulfilment, setPreferredFulfilment] = useState<RentalRequest['preferredFulfilment']>('Collection (Burnett Hill, Scarborough)');
  const [deliveryGeneralLocation, setDeliveryGeneralLocation] = useState('');
  const [accessibilityRequirements, setAccessibilityRequirements] = useState('');
  const [clinicalPrescriptionNotes, setClinicalPrescriptionNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const handleAddToCalendar = async () => {
    if (!submittedRental) return;
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
      await scheduleRentalInCalendar(token, submittedRental);
      setCalendarSyncStatus('success');
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setCalendarError(err.message || 'Failed to add rental booking to Google Calendar.');
      setCalendarSyncStatus('error');
    }
  };

  const openRentalModal = (category: RentalCategoryInfo) => {
    setSelectedCategory(category);
    setEquipmentCategory(category.id);
    setIsModalOpen(true);
    setSubmittedRental(null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'Please enter your full name.';
    if (!phone.trim()) errs.phone = 'Please enter a contact telephone number.';
    if (!requestedStartDate) errs.requestedStartDate = 'Please select a requested start date.';
    if (preferredFulfilment.includes('Delivery') && !deliveryGeneralLocation.trim()) {
      errs.deliveryGeneralLocation = 'Please provide general location for delivery feasibility assessment.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newReq = operationsStore.createRentalRequest({
      customerName,
      phone,
      email: email || undefined,
      equipmentCategory,
      quantityRequested,
      requestedStartDate,
      expectedDurationDays,
      preferredFulfilment,
      deliveryGeneralLocation: deliveryGeneralLocation || undefined,
      accessibilityRequirements: accessibilityRequirements || undefined,
      clinicalPrescriptionNotes: clinicalPrescriptionNotes || undefined,
    });

    setSubmittedRental(newReq);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
            Service Division B
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Medical Equipment Rentals
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed max-w-3xl">
            We provide medical equipment rentals for home convalescence, rehabilitation, and patient care throughout Tobago. Explore our four core rental categories below and submit an enquiry for confirmed availability and rental pricing.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-700 shrink-0" />
              <span><strong>Collection Location:</strong> Burnett Hill, Scarborough (Next to Sports and Games)</span>
            </div>
            <div className="text-slate-500">
              Delivery subject to scheduling, location access, and equipment type.
            </div>
          </div>
        </div>

        {/* 4 Core Rental Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {RENTAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Category Title */}
                <div className="relative aspect-16/9 bg-slate-100 overflow-hidden border-b border-slate-200">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    Rental Category
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {cat.shortDescription}
                    </p>
                  </div>

                  {/* Mandatory Pricing Statement */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Pricing & Availability Status
                    </span>
                    <span className="text-sm font-semibold text-sky-900 block mt-0.5">
                      Contact us for rental pricing and availability.
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Prices depend on duration, deposit terms, and collection vs delivery arrangements.
                    </span>
                  </div>

                  {/* Common Uses */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      Common Applications:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {cat.commonUses.map((use, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-sky-700 font-bold">•</span>
                          <span>{use}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Oxygen Safety Directives Notice */}
                  {(cat.id === 'Oxygen concentrators' || cat.id === 'Oxygen cylinders') && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <Flame className="w-4 h-4 text-amber-700" />
                        <span>Oxygen Safety Notice:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Flow rates and duration must strictly follow the written prescription of the patient’s physician. Keep away from smoking, open flames, and heat. We do not provide clinical therapy prescriptions.
                      </p>
                    </div>
                  )}

                  {/* Fulfilment note */}
                  <div className="text-xs text-slate-500">
                    <strong>Fulfilment:</strong> {cat.fulfilmentNotes}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => openRentalModal(cat)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire About Renting {cat.id}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Clinical Disclaimer & Safety Standards */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            <span>Equipment Inspection & Sanitization Standard</span>
          </h3>
          <p className="leading-relaxed">
            Every piece of medical equipment returned from rental undergoes strict mechanical inspection, functional testing, and healthcare-grade antimicrobial sanitization prior to being returned to available status.
          </p>
          <p className="leading-relaxed">
            For safety-sensitive oxygen concentrators and cylinders, pressure integrity, filter cleanliness, and valve seats are audited before release. Patients and caregivers are reminded to follow their attending physician’s prescribed clinical parameters at all times.
          </p>
        </div>

      </div>

      {/* RENTAL ENQUIRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-700">Medical Equipment Rental Enquiry</span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCategory?.id}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              
              {submittedRental ? (
                /* Submission Confirmation */
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Rental Request Received: {submittedRental.reference}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Thank you, {submittedRental.customerName}. Your rental enquiry for <strong>{submittedRental.equipmentCategory}</strong> has been logged into our queue. Staff will verify availability, inspect unit scheduling, and contact you at <strong>{submittedRental.phone}</strong> with quotation pricing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Fulfilment Method:</span>
                      <span className="font-semibold text-slate-800">{submittedRental.preferredFulfilment}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Requested Start:</span>
                      <span className="font-semibold text-slate-800">{submittedRental.requestedStartDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pricing Status:</span>
                      <span className="font-medium text-amber-700">Pending staff confirmation</span>
                    </div>
                  </div>

                  {/* Google Calendar Sync Action */}
                  <div className="pt-1">
                    {calendarSyncStatus === 'success' ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Rental booking reminder added to your Google Calendar!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleAddToCalendar}
                          disabled={calendarSyncStatus === 'syncing'}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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
                        `Hello, I would like to enquire about renting ${submittedRental.equipmentCategory}. My reference is ${submittedRental.reference}. Could you please confirm availability and rental pricing?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Follow Up on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                /* Rental Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (errors.customerName) setErrors({ ...errors, customerName: '' });
                        }}
                        placeholder="e.g. David Williams"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                      {errors.customerName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Contact Phone (WhatsApp preferred) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="e.g. +1 (868) 495-0000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                      {errors.phone && <p className="text-[11px] text-rose-600 mt-0.5">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email & Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. david@example.tt"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Quantity Requested
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={quantityRequested}
                        onChange={(e) => setQuantityRequested(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Requested Start Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={requestedStartDate}
                        onChange={(e) => {
                          setRequestedStartDate(e.target.value);
                          if (errors.requestedStartDate) setErrors({ ...errors, requestedStartDate: '' });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                      {errors.requestedStartDate && <p className="text-[11px] text-rose-600 mt-0.5">{errors.requestedStartDate}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Expected Duration (Days)
                      </label>
                      <select
                        value={expectedDurationDays}
                        onChange={(e) => setExpectedDurationDays(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        <option value={7}>1 Week (7 Days)</option>
                        <option value={14}>2 Weeks (14 Days)</option>
                        <option value={30}>1 Month (30 Days)</option>
                        <option value={60}>2 Months (60 Days)</option>
                        <option value={90}>3 Months or longer</option>
                      </select>
                    </div>
                  </div>

                  {/* Fulfilment Method */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Fulfilment Method
                    </label>
                    <select
                      value={preferredFulfilment}
                      onChange={(e) => setPreferredFulfilment(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option value="Collection (Burnett Hill, Scarborough)">
                        Collection at Burnett Hill, Scarborough (Next to Sports and Games)
                      </option>
                      <option value="Delivery (Subject to review)">
                        Delivery requested (Subject to vehicle scheduling and feasibility review)
                      </option>
                      <option value="Discuss Options">
                        Discuss Options with Staff
                      </option>
                    </select>
                  </div>

                  {preferredFulfilment.includes('Delivery') && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Delivery General Location / Community <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryGeneralLocation}
                        onChange={(e) => {
                          setDeliveryGeneralLocation(e.target.value);
                          if (errors.deliveryGeneralLocation) setErrors({ ...errors, deliveryGeneralLocation: '' });
                        }}
                        placeholder="e.g. Lowlands, Crown Point, Plymouth, Roxborough"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                      {errors.deliveryGeneralLocation && <p className="text-[11px] text-rose-600 mt-0.5">{errors.deliveryGeneralLocation}</p>}
                    </div>
                  )}

                  {/* Accessibility & Logistics */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Accessibility or Setup Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={accessibilityRequirements}
                      onChange={(e) => setAccessibilityRequirements(e.target.value)}
                      placeholder="e.g. Ground floor access, steps, narrow hallway..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    <strong>Submission Note:</strong> Submitting this form lodges an enquiry for availability verification. Rental rates, deposit terms, and fulfilment arrangements are confirmed in writing prior to equipment release.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Submit Rental Enquiry
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
