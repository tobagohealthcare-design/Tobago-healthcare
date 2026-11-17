import React, { useState } from 'react';
import { X, CheckCircle2, Clock, MessageSquare, Share2, Shield, ArrowLeft, ExternalLink, HardDrive, Check, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { uploadDriveFile } from '../services/driveService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEnquire: (product: Product, channel?: 'form' | 'whatsapp') => void;
  relatedProducts: Product[];
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEnquire,
  relatedProducts,
  onSelectRelated,
}) => {
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  if (!product) return null;

  const handleSaveToDrive = async () => {
    setIsSavingToDrive(true);
    setDriveError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Google Drive authorization required.');
      }

      let doc = `# TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES\n`;
      doc += `## Product Specification Sheet\n\n`;
      doc += `Product Name: ${product.name}\n`;
      doc += `Category: ${product.category}\n`;
      doc += `Brand: ${product.brand}\n`;
      doc += `SKU: ${product.sku}\n`;
      doc += `Price: ${product.priceTTD ? `TTD $${product.priceTTD.toLocaleString()}` : 'Contact for Price'}\n`;
      doc += `Availability: ${product.availability}\n\n`;
      doc += `### Description\n${product.fullDescription}\n\n`;
      doc += `### Intended Clinical / Domestic Use\n${product.intendedUse}\n\n`;
      doc += `### Key Features\n`;
      product.keyFeatures.forEach((f) => {
        doc += `- ${f}\n`;
      });
      doc += `\n### Technical Specifications\n`;
      Object.entries(product.specifications).forEach(([k, v]) => {
        doc += `- ${k}: ${v}\n`;
      });
      doc += `\nGenerated: ${new Date().toLocaleString()}\n`;
      doc += `Company Email: tobagohealthcare@gmail.com\n`;

      const fileName = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_SpecSheet.txt`;
      const uploaded = await uploadDriveFile(token, fileName, doc, 'text/plain');
      setDriveSavedLink(uploaded.webViewLink || '#');
    } catch (err: any) {
      console.error('Drive save error:', err);
      setDriveError(err.message || 'Could not save to Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const prefilledEnquiryMessage = `Hello, I am enquiring about ${product.name} (SKU: ${product.sku}). Could you please confirm the current price, availability, and any relevant product details?`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Catalogue</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="font-mono text-slate-700">{product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Main 2-column Product Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left: Product Image */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-4/3 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/wheelchair_mobility_1791914619247.jpg';
                  }}
                />
              </div>

              {/* Status & SKU strip */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Availability</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    {product.availability === 'In Stock' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {product.availability}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Brand</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{product.brand}</span>
                </div>
              </div>
            </div>

            {/* Right: Product Identification, Price & Enquiry Actions */}
            <div className="md:col-span-7 space-y-5">
              
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
                  {product.category}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Item SKU: {product.sku}
                </div>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Indicative Price (Trinidad & Tobago Dollars)</div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {product.priceTTD !== null ? (
                    <>TTD ${product.priceTTD.toLocaleString()}</>
                  ) : (
                    <span className="text-base font-medium text-slate-700 font-sans">
                      Enquire for Verified Price
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Taxes and final delivery terms confirmed upon enquiry submission.
                </div>
              </div>

              {/* Primary Enquiry Action Block */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-700">
                  Enquire About This Product:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => onEnquire(product, 'form')}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Website Enquiry Form</span>
                  </button>

                  <button
                    onClick={() => onEnquire(product, 'whatsapp')}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-700" />
                    <span>WhatsApp Enquiry Draft</span>
                  </button>
                </div>

                {/* Google Drive Integration Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToDrive}
                    disabled={isSavingToDrive}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingToDrive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                        <span>Saving Spec Sheet to Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <HardDrive className="w-3.5 h-3.5 text-sky-700" />
                        <span>Save Spec Sheet to Google Drive</span>
                      </>
                    )}
                  </button>

                  {driveSavedLink && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved to your Google Drive!</span>
                      </span>
                      <a
                        href={driveSavedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-emerald-900 underline inline-flex items-center gap-1"
                      >
                        <span>Open in Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {driveError && (
                    <div className="mt-2 text-xs text-rose-600">
                      {driveError}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 italic pt-1">
                  Pre-fills inquiry with exact SKU and product name so our team can check current stock and confirm pricing immediately.
                </div>
              </div>

            </div>

          </div>

          {/* Detailed Product Tabs / Information Blocks */}
          <div className="space-y-6 pt-4 border-t border-slate-200">
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Product Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.fullDescription}
              </p>
            </div>

            {/* Intended Use as Described by Manufacturer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Intended Clinical / Domestic Use
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {product.intendedUse}
              </p>
            </div>

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.keyFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100"
                    >
                      <span className="text-sky-700 font-bold shrink-0">·</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Technical Specifications
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        >
                          <td className="px-4 py-2.5 font-medium text-slate-600 w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-2.5 font-normal text-slate-900">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Related Products in {product.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedProducts.slice(0, 3).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-sky-500 transition-colors cursor-pointer bg-white group flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-4/3 rounded-lg bg-slate-100 overflow-hidden mb-2">
                          <img
                            src={rel.image}
                            alt={rel.name}
                            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-sky-700 line-clamp-1">
                          {rel.name}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                          {rel.priceTTD ? `TTD $${rel.priceTTD.toLocaleString()}` : 'Contact for Price'}
                        </div>
                      </div>
                      <div className="text-[11px] text-sky-700 font-medium mt-2 pt-2 border-t border-slate-100">
                        View Product →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalogue</span>
          </button>

          <button
            onClick={() => onEnquire(product, 'form')}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
          >
            Make an Enquiry
          </button>
        </div>

      </div>
    </div>
  );
};
