import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Eye, MessageSquare, CheckCircle2, Clock, X, Info } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../data/catalogueData';

interface ProductCataloguePageProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onViewProduct: (product: Product) => void;
  onEnquireProduct: (product: Product) => void;
  initialSearchQuery?: string;
}

export const ProductCataloguePage: React.FC<ProductCataloguePageProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onViewProduct,
  onEnquireProduct,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('featured');

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.shortDescription.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          const matchBrand = product.brand.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku && !matchCat && !matchBrand) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'price-asc') {
          return (a.priceTTD ?? 999999) - (b.priceTTD ?? 999999);
        }
        if (sortBy === 'price-desc') {
          return (b.priceTTD ?? 0) - (a.priceTTD ?? 0);
        }
        // default featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObject = PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory);

  const resetAllFilters = () => {
    onSelectCategory('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {selectedCategory === 'all' ? 'All Products' : activeCategoryObject?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Healthcare Equipment & Medical Supplies Catalogue
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Browse our range of mobility aids, patient care equipment, diagnostic monitors, emergency first aid packs, PPE, and medical consumables.
          </p>
        </div>

        {/* Informational Catalogue Note */}
        <div className="mb-8 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">
              Demonstration Product Catalogue Notice:
            </span>
            <p>
              The items listed below represent core product categories and demonstration stock configurations for Tobago Healthcare Equipment & Supplies. Please use the <strong>Enquire</strong> button on any item to verify live stock availability, delivery schedules, and confirmed quotation pricing in Trinidad & Tobago Dollars (TTD).
            </p>
          </div>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs mb-8 space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills / Buttons (Functional Segmented Interactive Controls) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>

            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>

            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={resetAllFilters}
                className="ml-auto text-xs text-sky-700 hover:text-sky-900 font-medium underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredProducts.length}</span>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'all' && (
              <span> in <strong>{activeCategoryObject?.name}</strong></span>
            )}
            {searchQuery && (
              <span> matching "<strong>{searchQuery}</strong>"</span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Product Image Area */}
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

                    {/* Stock Status Pill */}
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

                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-mono text-slate-500 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-200">
                        {product.sku}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      {product.category}
                    </div>

                    <h2
                      onClick={() => onViewProduct(product)}
                      className="text-base font-semibold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer line-clamp-2 min-h-12"
                      title={product.name}
                    >
                      {product.name}
                    </h2>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Price in TTD */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                          Price (TTD)
                        </div>
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

                      <div className="text-right text-[11px] text-slate-400">
                        Brand: <span className="text-slate-600 font-medium">{product.brand}</span>
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
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No products found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any products matching your current search or category filter. Try clearing your search term or contact our team for specialized procurement.
            </p>
            <div>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
