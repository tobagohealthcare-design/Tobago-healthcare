import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Copy, Check, Save } from 'lucide-react';
import { PRE_LAUNCH_CHECKLIST_ITEMS } from '../data/catalogueData';
import { BusinessConfig } from '../types';

interface LaunchChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessConfig: BusinessConfig;
  onUpdateBusinessConfig: (newConfig: BusinessConfig) => void;
}

export const LaunchChecklistModal: React.FC<LaunchChecklistModalProps> = ({
  isOpen,
  onClose,
  businessConfig,
  onUpdateBusinessConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'configure'>('checklist');

  // Local draft configuration
  const [draftConfig, setDraftConfig] = useState<BusinessConfig>({ ...businessConfig });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleCopyChecklist = () => {
    const text = PRE_LAUNCH_CHECKLIST_ITEMS.map(
      (item, idx) => `${idx + 1}. [${item.status}] ${item.task}\n   Details: ${item.details}`
    ).join('\n\n');

    navigator.clipboard.writeText(
      `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES — PRE-LAUNCH AUDIT CHECKLIST\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusinessConfig(draftConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h2 className="text-base font-bold">
              Business Owner Pre-Launch Review & Configuration
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Review remaining information, configuration status, and update live contact placeholders.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close checklist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-4 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'checklist'
                ? 'border-sky-600 text-sky-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Pre-Launch Audit Checklist (7 Items)
          </button>
          <button
            onClick={() => setActiveTab('configure')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'configure'
                ? 'border-sky-600 text-sky-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Placeholder Settings (Preview Updates)
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === 'checklist' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Required Quality Assurance Checklist:
                </span>
                <button
                  onClick={handleCopyChecklist}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Full Checklist'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {PRE_LAUNCH_CHECKLIST_ITEMS.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {idx + 1}. {item.task}
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Ready for Review' || item.status === 'Ready for Verification'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.details}</p>
                  </div>
                ))}
              </div>

              {/* Cost & External Plan Governance */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 text-xs text-slate-700 space-y-2">
                <span className="font-semibold text-sky-900 block">Future E-Commerce & Payment Notice:</span>
                <p>
                  As outlined in the master brief, online cart checkouts, card payment processors (supporting TTD settlement in Trinidad & Tobago), and automated stock syncing should be configured strictly after supplier catalogue verification.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-100 text-slate-600 leading-relaxed">
                You can edit these placeholders right here to see how your website will look when your official phone number, WhatsApp line, and collection address in Tobago are confirmed.
              </div>

              {savedNotice && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Website placeholders updated successfully across all pages!</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={draftConfig.email}
                  onChange={(e) => setDraftConfig({ ...draftConfig, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Telephone Number Placeholder / Official Line
                </label>
                <input
                  type="text"
                  value={draftConfig.telephonePlaceholder}
                  onChange={(e) => setDraftConfig({ ...draftConfig, telephonePlaceholder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Messaging Number Placeholder
                </label>
                <input
                  type="text"
                  value={draftConfig.whatsAppPlaceholder}
                  onChange={(e) => setDraftConfig({ ...draftConfig, whatsAppPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Premises / Collection Address
                </label>
                <input
                  type="text"
                  value={draftConfig.addressPlaceholder}
                  onChange={(e) => setDraftConfig({ ...draftConfig, addressPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Opening Hours
                </label>
                <input
                  type="text"
                  value={draftConfig.openingHoursPlaceholder}
                  onChange={(e) => setDraftConfig({ ...draftConfig, openingHoursPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply Placeholder Updates</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
