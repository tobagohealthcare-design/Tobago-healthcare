import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface CustomerEnquiryBannerProps {
  onOpenEnquiry: () => void;
}

export const CustomerEnquiryBanner: React.FC<CustomerEnquiryBannerProps> = ({ onOpenEnquiry }) => {
  return (
    <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Product Assistance & Procurement
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Looking for a Specific Healthcare Product?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Tell us what equipment or supplies you need. Contact our team to enquire about product options, pricing, and current availability.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenEnquiry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Make an Enquiry</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
