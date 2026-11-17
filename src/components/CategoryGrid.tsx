import React from 'react';
import { ArrowRight, Activity, HeartPulse, ShieldAlert, Bed, Stethoscope, Sparkles } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/catalogueData';
import { ProductCategory } from '../types';

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'mobility':
        return <Activity className="w-5 h-5 text-sky-700" />;
      case 'patient-care':
        return <Bed className="w-5 h-5 text-sky-700" />;
      case 'diagnostics':
        return <HeartPulse className="w-5 h-5 text-sky-700" />;
      case 'first-aid':
        return <ShieldAlert className="w-5 h-5 text-sky-700" />;
      case 'ppe':
        return <Stethoscope className="w-5 h-5 text-sky-700" />;
      case 'general-supplies':
      default:
        return <Sparkles className="w-5 h-5 text-sky-700" />;
    }
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              Catalogue Overview
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Our Product Categories
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Discover healthcare equipment and essential supplies arranged by clinical and personal care use.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            <span>6 Core Department Categories</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-white p-6 rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {cat.itemCount} items
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {cat.shortDescription}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700 group-hover:text-sky-800">
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Informative Guidance Note */}
        <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <strong>Note for customers:</strong> Categories are flexible and may be expanded as verified stock arrives. Contact us if you are searching for specific equipment not yet shown.
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-sky-700 hover:text-sky-900 font-semibold whitespace-nowrap cursor-pointer text-left sm:text-right"
          >
            View Entire Catalogue →
          </button>
        </div>

      </div>
    </section>
  );
};
