import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, ArrowRight } from 'lucide-react';
import { FREQUENTLY_ASKED_QUESTIONS } from '../data/catalogueData';

interface FAQSectionProps {
  isPreview?: boolean;
  onViewAllFAQs?: () => void;
  onOpenEnquiry?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  isPreview = false,
  onViewAllFAQs,
  onOpenEnquiry,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // First open by default
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const displayedList = isPreview
    ? FREQUENTLY_ASKED_QUESTIONS.slice(0, 4)
    : FREQUENTLY_ASKED_QUESTIONS.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <section className={`py-16 ${isPreview ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
            Questions & Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isPreview ? 'Frequently Asked Questions' : 'Help & Frequently Asked Questions'}
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Clear, practical guidance on enquiring about products, verifying TTD prices, checking availability, and ordering healthcare supplies in Tobago.
          </p>
        </div>

        {/* Search bar on full page */}
        {!isPreview && (
          <div className="relative mb-8 max-w-lg mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
            />
          </div>
        )}

        {/* Accordion List */}
        <div className="space-y-3">
          {displayedList.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {displayedList.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No matching questions found for "{searchQuery}". Please contact us directly with your inquiry.
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {isPreview && onViewAllFAQs && (
          <div className="mt-8 text-center">
            <button
              onClick={onViewAllFAQs}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
            >
              <span>View All Frequently Asked Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isPreview && onOpenEnquiry && (
          <div className="mt-12 p-6 rounded-xl bg-white border border-slate-200 text-center space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              Have a Question That Isn’t Answered Here?
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Our team is available to assist with product specifications, bulk orders, and local sourcing in Tobago.
            </p>
            <button
              onClick={onOpenEnquiry}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Submit a General Enquiry</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
