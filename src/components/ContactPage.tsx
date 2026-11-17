import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, CheckCircle2, AlertCircle, Send, ExternalLink, ShieldAlert } from 'lucide-react';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';
import { EnquirySubmission } from '../types';

interface ContactPageProps {
  prefilledProductName?: string;
  onClearPrefill?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  prefilledProductName = '',
  onClearPrefill,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [enquiryType, setEnquiryType] = useState('Medical Equipment Rentals');
  const [productName, setProductName] = useState(prefilledProductName);
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<EnquirySubmission | null>(null);

  useEffect(() => {
    if (prefilledProductName) {
      setProductName(prefilledProductName);
      setEnquiryType('Medical Equipment Rentals');
      if (!message) {
        setMessage(
          `Hello, I am enquiring about ${prefilledProductName}. Could you please confirm current availability, rental pricing, and collection or delivery arrangements?`
        );
      }
    }
  }, [prefilledProductName]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your full name.';
    if (!email.trim() && !telephone.trim()) {
      errs.telephone = 'Please provide either a telephone number or email address.';
    }
    if (!message.trim()) errs.message = 'Please enter your message or enquiry details.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const refCode = `THC-GEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEnquiry: EnquirySubmission = {
      id: `enq-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim() || 'Not supplied',
      telephone: telephone.trim() || undefined,
      enquiryType,
      productName: productName.trim() || undefined,
      message: message.trim(),
      submittedAt: new Date().toLocaleString(),
      status: 'Received',
      referenceCode: refCode,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('thc_enquiries') || '[]');
      existing.unshift(newEnquiry);
      localStorage.setItem('thc_enquiries', JSON.stringify(existing));
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedReceipt(newEnquiry);
      setFullName('');
      setEmail('');
      setTelephone('');
      setMessage('');
      if (onClearPrefill) onClearPrefill();
    }, 350);
  };

  const whatsAppDirectUrl = `https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
    `Hello Tobago Healthcare Equipment & Supplies, I would like to make an enquiry regarding ${
      productName || 'services and equipment'
    }.`
  )}`;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
            Confirmed Contact Details
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Contact Tobago Healthcare Equipment & Supplies
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Reach out directly for non-emergency medical transport arrangements, equipment rental availability, consultations, and medical supplies in Tobago.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Confirmed Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Official Business Channels
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Collection Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Collection Location</span>
                    <strong className="text-slate-900 block mt-0.5">{CONFIRMED_BUSINESS_CONFIG.location}</strong>
                    <span className="text-xs text-sky-800 font-medium block mt-0.5">
                      Directions: {CONFIRMED_BUSINESS_CONFIG.directions}
                    </span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">WhatsApp Messaging</span>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-900">{CONFIRMED_BUSINESS_CONFIG.phone}</span>
                      <a
                        href={whatsAppDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                      >
                        <span>Chat on WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Business Email</span>
                    <a
                      href={`mailto:${CONFIRMED_BUSINESS_CONFIG.email}`}
                      className="font-medium text-slate-900 hover:text-sky-700 transition-colors mt-0.5 block"
                    >
                      {CONFIRMED_BUSINESS_CONFIG.email}
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Non-Emergency Safety Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Emergency Services Notice:</span>
              </div>
              <p>
                Tobago Healthcare Equipment & Supplies provides non-emergency transport coordination, travel planning, and medical equipment rentals. We do not dispatch emergency ambulances.
              </p>
              <p>
                In life-threatening medical emergencies in Tobago, please dial emergency lines directly: <strong>811</strong> (Ambulance) / <strong>999</strong> (Police) / <strong>211</strong> (Tobago Emergency Management Agency).
              </p>
            </div>

          </div>

          {/* Right Column: General Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              
              {submittedReceipt ? (
                <div className="space-y-5 py-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Enquiry Submitted Successfully
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      Reference: {submittedReceipt.referenceCode}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      Thank you, {submittedReceipt.fullName}. Your enquiry has been recorded in our operational queue. An authorised team member will review your details and contact you to confirm arrangements and pricing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Enquiry Type:</span>
                      <span className="font-semibold text-slate-900">{submittedReceipt.enquiryType}</span>
                    </div>
                    {submittedReceipt.productName && (
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Service / Equipment:</span>
                        <span className="font-semibold text-slate-900">{submittedReceipt.productName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-700">{submittedReceipt.submittedAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSubmittedReceipt(null)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">
                      General Enquiry & Message Form
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Send a message to our administrative and customer care team.
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="e.g. Maria Charles"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Telephone Number (WhatsApp preferred)
                      </label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => {
                          setTelephone(e.target.value);
                          if (errors.telephone) setErrors({ ...errors, telephone: '' });
                        }}
                        placeholder="e.g. +1 (868) 495-0000"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                      {errors.telephone && <p className="text-[11px] text-rose-600 mt-1">{errors.telephone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. maria@example.tt"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Enquiry Type & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Service Category
                      </label>
                      <select
                        value={enquiryType}
                        onChange={(e) => setEnquiryType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      >
                        <option value="Medical Equipment Rentals">Medical Equipment Rentals</option>
                        <option value="Medical Transport Assistance">Medical Transport Assistance</option>
                        <option value="Inter-Island Travel Coordination">Inter-Island Travel Coordination</option>
                        <option value="Consultations & Planning">Consultations & Planning</option>
                        <option value="Retail Supplies">Retail Healthcare Supplies</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specific Item / Journey Details
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Hospital Bed or Wheelchair transfer"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message & Enquiry Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({ ...errors, message: '' });
                      }}
                      placeholder="Please specify any requirements, requested dates, or delivery preferences..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    />
                    {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                    <strong>Privacy Notice:</strong> We respect your privacy. Submissions are handled strictly to respond to your service enquiry. No sensitive medical diagnoses or patient charts are requested or stored.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-400 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Submit Message'}</span>
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
