import React from 'react';
import { ArrowRight, MessageSquare, Eye, CheckCircle2, Clock } from 'lucide-react';
import { Product } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onEnquireProduct: (product: Product) => void;
  onViewAllProducts: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onViewProduct,
  onEnquireProduct,
  onViewAllProducts,
}) => {
  const featuredList = products.filter((p) => p.featured);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              Selected Showcase
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Representative healthcare equipment and essential supplies commonly requested for home care and clinical settings.
            </p>
          </div>

          <button
            onClick={onViewAllProducts}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredList.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Product Image Area */}
              <div>
                <div
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => onViewProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/wheelchair_mobility_1791914619247.jpg';
                    }}
                  />

                  {/* Availability Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                        product.availability === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : product.availability === 'Available to Order'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {product.availability === 'In Stock' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{product.availability}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category unboxed text metadata */}
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {product.category}
                  </div>

                  <h3
                    onClick={() => onViewProduct(product)}
                    className="text-sm font-semibold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer line-clamp-2 min-h-10"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  {/* Price */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] text-slate-400">Indicative Price</div>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {product.priceTTD !== null ? (
                        <>TTD ${product.priceTTD.toLocaleString()}</>
                      ) : (
                        <span className="text-xs font-medium text-slate-600 font-sans">
                          Contact for Price
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => onEnquireProduct(product)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enquire</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Demonstration Inventory Disclosure Notice */}
        <div className="mt-8 text-center text-xs text-slate-500 max-w-3xl mx-auto">
          <em>Product entries shown demonstrate catalogue layout and functional enquiry routing. Please submit an enquiry to verify exact stock, current specifications, and confirmed TTD pricing with our team.</em>
        </div>

      </div>
    </section>
  );
};
