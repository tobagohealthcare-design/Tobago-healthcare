import React from 'react';
import { Mail, Phone, MapPin, Shield, MessageSquare, ShieldAlert } from 'lucide-react';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenChecklist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenChecklist }) => {
  const currentYear = new Date().getFullYear();
  const whatsAppDirectUrl = `https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
    'Hello Tobago Healthcare Equipment & Supplies, I would like to make an enquiry.'
  )}`;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="text-base font-bold text-white tracking-tight">
                Tobago Healthcare Equipment & Supplies
              </div>
              <div className="text-[11px] font-medium text-sky-400 uppercase tracking-wider mt-0.5">
                Medical Transport · Consultations · Equipment Rentals
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Supporting individuals, caregivers, healthcare professionals, and organisations across Tobago and Trinidad & Tobago with non-emergency transport coordination, travel planning, and verified equipment rentals.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: +1-868-495-9748</span>
              </a>

              <button
                onClick={() => onNavClick('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Operations Portal</span>
              </button>
            </div>
          </div>

          {/* Column 2: Core Services */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Core Service Divisions
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavClick('transport')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Medical Transport & Travel Coordination
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('rentals')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Medical Equipment Rentals (4 Categories)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('consultations')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Consultations & Travel Planning
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('shop')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Retail Healthcare Supplies Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('calendar')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Google Calendar Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('gmail')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gmail Communications Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('drive')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Google Drive Records Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Equipment Rental Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Rental Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Hospital Beds (Semi & Full Electric)</li>
              <li>Wheelchairs (Standard & Ergonomic)</li>
              <li>Oxygen Concentrators (Stationary & Mobile)</li>
              <li>Oxygen Cylinders & Regulators</li>
            </ul>
          </div>

          {/* Column 4: Confirmed Location & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Confirmed Business Location
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{CONFIRMED_BUSINESS_CONFIG.location}</strong>
                  <span className="text-[11px] text-sky-300 block">Collection: Next to Sports and Games</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <a href={`mailto:${CONFIRMED_BUSINESS_CONFIG.email}`} className="hover:text-white">
                  {CONFIRMED_BUSINESS_CONFIG.email}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>+1-868-495-9748 (WhatsApp 18687133859)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Emergency Services Protocol Banner */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Non-Emergency Service Notice:</strong> Tobago Healthcare Equipment & Supplies coordinates non-emergency medical transportation, travel arrangements, and equipment rentals. We do not dispatch emergency ambulances. In acute medical emergencies in Tobago, dial: <strong className="text-white">811</strong> (Ambulance) · <strong className="text-white">999</strong> (Police) · <strong className="text-white">211</strong> (Tobago Emergency Management Agency).
          </div>
        </div>

        {/* Bottom Bar: Dynamic Copyright & Legal */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {currentYear} Tobago Healthcare Equipment & Supplies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Burnett Hill, Scarborough, Tobago</span>
            <span aria-hidden="true">·</span>
            <span>Non-Emergency Coordination</span>
            <span aria-hidden="true">·</span>
            <span>Privacy Notice Enforced</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
