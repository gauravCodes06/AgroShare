import React from "react";
import { User, MapPin, ShoppingCart, Star, ShieldCheck } from "lucide-react";
import { formatINR } from "../utils/formatters";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

export default function ProductCard({ product, onSelect }) {
  const {
    id,
    name,
    category,
    farmer,
    location,
    price,
    unit,
    rating,
    reviewsCount,
    organic,
    badge,
    imageUrl
  } = product;

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`Added 1 ${unit} of ${name} to cart! 🛒`);
  };

  return (
    <div 
      onClick={() => onSelect && onSelect(product)}
      className="group bg-white rounded-2xl border border-[#E5EAE5] shadow-xs hover:shadow-xl hover:border-[#15803D]/40 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80";
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-[#17231D]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {category}
        </div>

        {/* Organic or Custom Badge */}
        {organic && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Organic
          </div>
        )}

        {badge && (
          <div className="absolute bottom-3 left-3 bg-amber-500 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {badge}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3 className="font-bold text-[#17231D] text-base leading-snug line-clamp-1 group-hover:text-[#15803D] transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#17231D] shrink-0">
              <Star className="w-3 h-3 text-[#EAB308] fill-[#EAB308]" />
              <span>{rating ? rating.toFixed(1) : "4.9"}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-[#647067] mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-[#15803D]" />
              <span className="font-medium text-[#17231D] truncate">{farmer}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#15803D]" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-[#E5EAE5] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-[#15803D]">
                {formatINR(price)}
              </span>
              <span className="text-xs text-[#647067] font-medium">/{unit}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-3 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
}
