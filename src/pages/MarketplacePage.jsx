import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Store, 
  Search, 
  PlusCircle, 
  ShoppingCart, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { PRODUCT_CATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function MarketplacePage({ onSelectProduct, onOpenListProductModal }) {
  const products = useProductStore((state) => state.products);
  const cartCount = useCartStore((state) => state.getTotalCount());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      const matchesOrganic = !organicOnly || p.organic === true;

      return matchesSearch && matchesCategory && matchesOrganic;
    });
  }, [products, searchQuery, selectedCategory, organicOnly]);

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5" />
              <span>Direct-to-Consumer Store</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#17231D] tracking-tight">
              Farm-to-Consumer AgroMarket
            </h1>
            <p className="text-sm text-[#647067] mt-1">
              Buy directly from verified farmers with zero middleman markups.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={onOpenListProductModal}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#15803D] text-[#15803D] hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Produce</span>
            </button>
            <Link
              to="/cart"
              className="px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-[#EAB308]" />
              <span>View Cart ({cartCount})</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jaggery, flour, tomatoes, or farmer..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <input
                type="checkbox"
                id="organicFilter"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="w-4 h-4 text-[#15803D] rounded border-gray-300 focus:ring-[#15803D]"
              />
              <label htmlFor="organicFilter" className="text-xs font-bold text-[#17231D] cursor-pointer flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Only Organic Certified
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5EAE5]">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#15803D] text-white shadow-xs"
                    : "bg-[#F7F9F5] text-[#17231D] border border-[#E5EAE5] hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE5] max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#17231D]">No Products Found</h3>
            <p className="text-xs text-[#647067]">
              No farm goods match your search. Try resetting your category or search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setOrganicOnly(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#15803D] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
