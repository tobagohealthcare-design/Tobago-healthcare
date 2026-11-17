import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TransportPage } from './components/TransportPage';
import { RentalsPage } from './components/RentalsPage';
import { ConsultationsPage } from './components/ConsultationsPage';
import { StaffAdminDashboard } from './components/StaffAdminDashboard';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedProducts } from './components/FeaturedProducts';
import { WhyChooseUs } from './components/WhyChooseUs';
import { CustomerEnquiryBanner } from './components/CustomerEnquiryBanner';
import { FAQSection } from './components/FAQSection';
import { ProductCataloguePage } from './components/ProductCataloguePage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { LaunchChecklistModal } from './components/LaunchChecklistModal';
import { GoogleDriveHub } from './components/GoogleDriveHub';
import { GoogleCalendarHub } from './components/GoogleCalendarHub';
import { GmailHub } from './components/GmailHub';
import { GoogleFormsHub } from './components/GoogleFormsHub';
import { GoogleContactsHub } from './components/GoogleContactsHub';
import { Footer } from './components/Footer';
import { DEMO_PRODUCTS } from './data/catalogueData';
import { CONFIRMED_BUSINESS_CONFIG } from './data/rentalData';
import { Product, BusinessConfig } from './types';
import { Car, Bed, CalendarCheck, ShieldCheck, ArrowRight, MessageSquare, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'transport' | 'rentals' | 'consultations' | 'calendar' | 'gmail' | 'forms' | 'contacts' | 'shop' | 'about' | 'contact' | 'faq' | 'drive' | 'admin'
  >('home');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prefilledProductName, setPrefilledProductName] = useState<string>('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  // Business config
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(CONFIRMED_BUSINESS_CONFIG);

  const handleUpdateBusinessConfig = (newConfig: BusinessConfig) => {
    setBusinessConfig(newConfig);
  };

  // Navigations & Actions
  const handleSelectCategoryFromHome = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleEnquireFromProduct = (product: Product, channel: 'form' | 'whatsapp' = 'form') => {
    setSelectedProduct(null);
    if (channel === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hello, I am enquiring about ${product.name} (SKU: ${product.sku}). Could you please confirm the current price, availability, and any relevant product details?`
      );
      window.open(`https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${msg}`, '_blank', 'noopener,noreferrer');
    } else {
      setPrefilledProductName(product.name);
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGeneralEnquiry = (productName?: string) => {
    if (productName) {
      setPrefilledProductName(productName);
    }
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find related products for the modal
  const relatedProducts = selectedProduct
    ? DEMO_PRODUCTS.filter(
        (p) => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      
      {/* Universal Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenEnquiry={handleOpenGeneralEnquiry}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        onSearchClick={handleSearchClick}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <Hero
              onRequestTransport={() => {
                setActiveTab('transport');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRequestConsultation={() => {
                setActiveTab('consultations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBrowseRentals={() => {
                setActiveTab('rentals');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCheckAvailability={() => {
                setActiveTab('rentals');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Core Service Divisions Spotlight on Home */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
                    Integrated Healthcare Solutions
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Comprehensive Services for Tobago & Trinidad
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Connecting personal care recipients, medical practitioners, and healthcare organisations with reliable transport coordination and verified medical equipment rentals.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Division A Feature */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                        <Car className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Medical Transport & Travel
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Facilitating non-emergency vehicle transport, wheelchair accessible rides, independent provider coordination, and airline or ferry travel logistics.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1 pt-1">
                        <li>• Company vehicle assessment</li>
                        <li>• Verified independent providers</li>
                        <li>• Inter-island flight & sea travel</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('transport');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 pt-2 border-t border-slate-100 cursor-pointer"
                    >
                      <span>Request Transport Assistance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Division B Feature */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Bed className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Medical Equipment Rentals
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Short-term and long-term rental of hospital beds, standard & ergonomic wheelchairs, oxygen concentrators, and oxygen cylinders.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1 pt-1">
                        <li>• Semi & full-electric hospital beds</li>
                        <li>• Oxygen concentrators & cylinders</li>
                        <li>• Collection at Burnett Hill, Scarborough</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('rentals');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100 cursor-pointer"
                    >
                      <span>Browse 4 Rental Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Division C Feature */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Consultations & Planning
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Schedule a focused consultation to discuss complex transit needs, accessibility requirements, or custom equipment procurement with our staff.
                      </p>
                      <ul className="text-xs text-slate-500 space-y-1 pt-1">
                        <li>• Inter-island travel consultation</li>
                        <li>• Accessibility evaluations</li>
                        <li>• Dedicated staff follow-up</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('consultations');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 pt-2 border-t border-slate-100 cursor-pointer"
                    >
                      <span>Schedule a Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* How the Process Works */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
                    Clear Operational Process
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    How Enquiries & Bookings Work
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    Transparent steps distinguishing between submitting an enquiry, receiving a quotation, making provisional arrangements, and confirmed booking.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Submit Request</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete our mobile-first transport, rental, or consultation form with journey or equipment details.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Unique Reference</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instantly receive your tracking reference code (e.g., THC-TRN-2026-XXXX) for easy follow-up.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Staff Review & Quotation</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our coordinators verify vehicle suitability or equipment inventory and provide transparent TTD pricing.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      4
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Confirmed Booking</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Once details and terms are agreed, written confirmation is issued for collection or journey dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Retail Products Showcase */}
            <FeaturedProducts
              products={DEMO_PRODUCTS}
              onViewProduct={handleViewProduct}
              onEnquireProduct={(prod) => handleEnquireFromProduct(prod, 'form')}
              onViewAllProducts={() => {
                setSelectedCategory('all');
                setActiveTab('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Customer Enquiry Banner */}
            <CustomerEnquiryBanner
              onOpenEnquiry={() => {
                setActiveTab('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* FAQ Preview */}
            <FAQSection
              isPreview={true}
              onViewAllFAQs={() => {
                setActiveTab('faq');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenEnquiry={() => {
                setActiveTab('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {/* Division A: Medical Transport */}
        {activeTab === 'transport' && <TransportPage />}

        {/* Division B: Equipment Rentals */}
        {activeTab === 'rentals' && <RentalsPage />}

        {/* Division C: Consultations */}
        {activeTab === 'consultations' && <ConsultationsPage />}

        {/* Retail Shop */}
        {activeTab === 'shop' && (
          <ProductCataloguePage
            products={DEMO_PRODUCTS}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onViewProduct={handleViewProduct}
            onEnquireProduct={(prod) => handleEnquireFromProduct(prod, 'form')}
            initialSearchQuery={initialSearchQuery}
          />
        )}

        {/* Staff Operations Portal */}
        {activeTab === 'admin' && (
          <StaffAdminDashboard
            onOpenDrive={() => setActiveTab('drive')}
            onOpenCalendar={() => setActiveTab('calendar')}
            onOpenGmail={() => setActiveTab('gmail')}
            onOpenForms={() => setActiveTab('forms')}
            onOpenContacts={() => setActiveTab('contacts')}
          />
        )}

        {/* Google Calendar Hub */}
        {activeTab === 'calendar' && <GoogleCalendarHub />}

        {/* Gmail Communications Hub */}
        {activeTab === 'gmail' && <GmailHub />}

        {/* Google Forms Hub */}
        {activeTab === 'forms' && <GoogleFormsHub />}

        {/* Google Contacts Hub */}
        {activeTab === 'contacts' && <GoogleContactsHub />}

        {/* Google Drive Records Hub */}
        {activeTab === 'drive' && <GoogleDriveHub />}

        {/* About Page */}
        {activeTab === 'about' && (
          <AboutPage
            onExploreProducts={() => {
              setSelectedCategory('all');
              setActiveTab('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContactUs={() => {
              setActiveTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            businessConfig={businessConfig}
          />
        )}

        {/* Contact Page */}
        {activeTab === 'contact' && (
          <ContactPage
            prefilledProductName={prefilledProductName}
            onClearPrefill={() => setPrefilledProductName('')}
          />
        )}

        {/* FAQ Page */}
        {activeTab === 'faq' && (
          <FAQSection
            isPreview={false}
            onOpenEnquiry={() => {
              setActiveTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Individual Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEnquire={handleEnquireFromProduct}
        relatedProducts={relatedProducts}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      {/* Owner Setup Checklist Modal */}
      <LaunchChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        businessConfig={businessConfig}
        onUpdateBusinessConfig={handleUpdateBusinessConfig}
      />

      {/* Universal Footer */}
      <Footer
        onNavClick={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChecklist={() => setIsChecklistOpen(true)}
      />

    </div>
  );
}
