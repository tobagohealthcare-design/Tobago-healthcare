import React from 'react';
import { Search, MessageSquare, Headphones, FileText } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: <Search className="w-5 h-5 text-sky-700" />,
      title: 'Convenient Product Information',
      description:
        'Easily discover key product features, manufacturer specifications, intended uses, and dimensional details in one organised catalogue.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-sky-700" />,
      title: 'Direct Enquiry Channels',
      description:
        'A straightforward way to contact our team by email, telephone, WhatsApp, or website form to confirm availability and exact pricing.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-sky-700" />,
      title: 'Assistance With Inquiries',
      description:
        'Whether you are purchasing for personal care, a loved one, or a clinic, our team is available to assist with practical product questions.',
    },
    {
      icon: <FileText className="w-5 h-5 text-sky-700" />,
      title: 'Clear Quotations & Sourcing',
      description:
        'Transparent itemised quotations in Trinidad and Tobago dollars (TTD) with guidance on availability and delivery arrangements.',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
            Why Contact Us
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Practical Assistance for Healthcare Equipment & Supplies
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Tobago Healthcare Equipment & Supplies is established to provide individuals, caregivers, healthcare professionals, and local organisations with reliable access to medical equipment and essential supply information.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
