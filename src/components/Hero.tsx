import React from 'react';
import {
  ArrowRight,
  MessageSquare,
  Car,
  Bed,
  CalendarCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

interface HeroProps {
  onRequestTransport: () => void;
  onRequestConsultation: () => void;
  onBrowseRentals: () => void;
  onCheckAvailability: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onRequestTransport,
  onRequestConsultation,
  onBrowseRentals,
  onCheckAvailability,
}) => {
  const whatsAppLink = `https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
    'Hello Tobago Healthcare Equipment & Supplies, I would like to make an enquiry.'
  )}`;

  return (
    <section className="relative bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, Supporting Copy, Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Verified Location Marker (Burnett Hill, Scarborough) */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span>Burnett Hill, Scarborough, Tobago (Next to Sports and Games)</span>
            </div>

            {/* Mandated Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.18] text-balance">
              Healthcare Equipment, Medical Transport & Rental Services in Tobago
            </h1>

            {/* Mandated Supporting Message */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Tobago Healthcare Equipment & Supplies helps individuals and families access healthcare equipment, arrange non-emergency transportation, coordinate travel requirements, and enquire about medical equipment rentals.
            </p>

            {/* Primary Action Buttons Matrix */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onRequestTransport}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Request Transport Assistance</span>
              </button>

              <button
                onClick={onBrowseRentals}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Bed className="w-4 h-4 text-sky-700" />
                <span>Browse Equipment Rentals</span>
              </button>

              <button
                onClick={onRequestConsultation}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-slate-600" />
                <span>Request a Consultation</span>
              </button>

              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Contact Us on WhatsApp</span>
              </a>
            </div>

            {/* Essential Medical Transport Notice (Strict Non-Emergency Protocol) */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Non-Emergency Notice:</strong> Our service facilitates non-emergency transportation, independent provider coordination, and scheduled travel logistics. We do not operate an emergency ambulance service. In medical emergencies in Tobago, please dial <strong>811</strong> immediately.
              </div>
            </div>

          </div>

          {/* Right Column: Service Divisions Quick Card Grid */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Division A Card */}
            <div
              onClick={onRequestTransport}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-sky-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Enquire Now →
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-sky-700 transition-colors">
                Medical Transport & Travel Coordination
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Non-emergency vehicle transport across Tobago, inter-island airline and ferry coordination, and clinic transfer logistics.
              </p>
            </div>

            {/* Division B Card */}
            <div
              onClick={onBrowseRentals}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  View 4 Categories →
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors">
                Medical Equipment Rentals
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hospital beds, standard/ergonomic wheelchairs, oxygen concentrators, and oxygen cylinders with safety testing and collection at Burnett Hill.
              </p>
            </div>

            {/* Division C Card */}
            <div
              onClick={onRequestConsultation}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Book Discussion →
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-purple-700 transition-colors">
                Consultations & Travel Planning
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Discuss complex inter-island transfers, wheelchair accessibility requirements, or long-term medical equipment rental needs with our team.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Operational Principles Bar */}
      <div className="border-t border-slate-200 bg-slate-50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Company Vehicle & Independent Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Hospital Beds, Wheelchairs & O2 Rentals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Inter-Island Flight & Sea Coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Unique Reference & Staff Follow-up</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
