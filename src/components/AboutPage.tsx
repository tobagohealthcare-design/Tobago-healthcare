import React from 'react';
import { ArrowRight, ShieldCheck, Heart, Building, CheckCircle2, MapPin } from 'lucide-react';
import { BusinessConfig } from '../types';

interface AboutPageProps {
  onExploreProducts: () => void;
  onContactUs: () => void;
  businessConfig: BusinessConfig;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onExploreProducts,
  onContactUs,
  businessConfig,
}) => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
            Company Information
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            About Tobago Healthcare Equipment & Supplies
          </h1>
          <p className="text-base sm:text-lg text-slate-700 mt-4 leading-relaxed font-medium">
            “Tobago Healthcare Equipment & Supplies provides a point of contact for customers seeking healthcare equipment and medical supplies. Our website is designed to make it easier to explore products, request information, and enquire about availability.”
          </p>
        </div>

        {/* Company Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Company Overview
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finding dependable medical equipment, daily living aids, and medical supplies in Tobago often requires navigating fragmented sourcing and unclear product availability. Tobago Healthcare Equipment & Supplies was created to simplify this process. We serve as a direct, organized point of contact connecting local residents, caregivers, medical professionals, and institutions with healthcare products suited to their specific needs.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our online catalogue provides transparent product specifications, indicative pricing in Trinidad and Tobago dollars (TTD), and a straightforward enquiry route so customers can make informed choices before purchasing.
          </p>
        </section>

        {/* Mission and Values */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Mission & Core Principles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Accessibility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensuring that individuals, families, and healthcare providers in Tobago have easy online access to detailed healthcare equipment and supply information.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Transparency
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Providing accurate manufacturer specifications, verified availability updates, and honest answers regarding delivery and procurement timelines.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Attentive Service
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Treating every enquiry with care, whether assisting a caregiver with an emergency walker or supporting a clinic with recurring disposable supplies.
              </p>
            </div>
          </div>
        </section>

        {/* Product Offering */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Our Product Range
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our catalogue covers core categories essential for home healthcare, post-operative rehabilitation, and professional medical practice:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-900 block mb-1">Mobility & Walking Supports</span>
              Wheelchairs, rollators, walking frames, canes, and transfer aids.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-900 block mb-1">Patient Care Equipment</span>
              Alternating pressure mattresses, hospital beds, transfer apparatus, and commodes.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-900 block mb-1">Diagnostic & Monitoring</span>
              Blood pressure monitors, pulse oximeters, digital thermometers, and glucometers.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-900 block mb-1">First Aid, PPE & Consumables</span>
              Trauma packs, examination gloves, sterile dressings, and medical consumables.
            </div>
          </div>
        </section>

        {/* Customer Service Approach */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Customer Service Approach
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Healthcare decisions require thoughtful guidance. We prioritize direct communication and respond promptly to product enquiries submitted through our website, email, or telephone. When an item requires custom sizing, verification of patient weight capacity, or clarification on accessories, our team works to verify exact manufacturer data.
          </p>
        </section>

        {/* Service Area */}
        <section className="p-6 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
          <div className="flex items-center gap-2 text-sky-800 font-semibold text-sm">
            <MapPin className="w-4 h-4" />
            <span>Service Area & Fulfilment</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            We primarily serve customers across Tobago, with enquiry support and coordinated shipping arrangements extending throughout Trinidad and Tobago. Inter-island courier options and local collection points are being organised as our physical presence expands.
          </p>
        </section>

        {/* Company History Notice (Editable Placeholder) */}
        <section className="p-4 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 block mb-1">Company Development Notice:</span>
          Official corporate milestones, warehouse location details, and registered certifications will be updated as operational verification progresses. We strictly publish verified business details and do not manufacture artificial claims.
        </section>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <button
            onClick={onExploreProducts}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <span>Explore Product Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onContactUs}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Contact Our Team</span>
          </button>
        </div>

      </div>
    </div>
  );
};
