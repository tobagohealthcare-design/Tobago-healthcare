import React, { useState } from 'react';
import {
  Menu,
  X,
  MessageSquare,
  Shield,
  Phone,
  HardDrive,
  Ambulance,
  Bed,
  CalendarCheck,
  Package,
} from 'lucide-react';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEnquiry: (productName?: string) => void;
  onOpenChecklist: () => void;
  onSearchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEnquiry,
  onOpenChecklist,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'transport', label: 'Transport & Travel' },
    { id: 'rentals', label: 'Equipment Rentals' },
    { id: 'consultations', label: 'Consultations' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'gmail', label: 'Gmail' },
    { id: 'forms', label: 'Forms' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'shop', label: 'Retail Supplies' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'drive', label: 'Drive Records' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsAppLink = `https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
    'Hello Tobago Healthcare Equipment & Supplies, I would like to make an enquiry.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      {/* Top operational announcement banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-medium">
              Burnett Hill, Scarborough, Tobago (Next to Sports and Games)
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:inline text-sky-400">
              Email: {CONFIRMED_BUSINESS_CONFIG.email}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <span>WhatsApp: +1-868-495-9748</span>
            </a>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => handleNavClick('admin')}
              className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                activeTab === 'admin' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-20">
          
          {/* Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors whitespace-nowrap">
              Tobago Healthcare Equipment & Supplies
            </div>
            <div className="text-[11px] font-medium text-slate-500 tracking-wide">
              Medical Transport · Consultations · Equipment Rentals · Tobago, W.I.
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-700">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                  activeTab === link.id
                    ? 'text-sky-700 font-bold border-b-2 border-sky-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Us</span>
            </a>

            <button
              onClick={() => handleNavClick('transport')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Request Transport</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={() => handleNavClick('admin')}
              className="p-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 border border-slate-200"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Staff</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === link.id
                    ? 'bg-sky-50 text-sky-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => handleNavClick('admin')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Staff Operations Dashboard</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp (+1-868-495-9748)</span>
            </a>

            <button
              onClick={() => handleNavClick('transport')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Request Medical Transport Assistance</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
