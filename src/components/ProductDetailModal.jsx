import React, { useState } from "react";
import { X, ShoppingCart, User, MapPin, Star, ShieldCheck, CheckCircle } from "lucide-react";
import { formatINR } from "../utils/formatters";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

export default function ProductDetailModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(product.minOrder || 1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.unit} of ${product.name} to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5EAE5] shadow-2xl p-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-[#17231D] hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#17231D]/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">
            {product.category}
          </div>
          {product.organic && (
            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Organic
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-[#17231D]">{product.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#647067]">
              <span className="flex items-center gap-1 font-semibold text-[#17231D]">
                <User className="w-3.5 h-3.5 text-[#15803D]" /> {product.farmer}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#15803D]" /> {product.location}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed bg-[#F7F9F5] p-3 rounded-xl border border-[#E5EAE5]">
            {product.description}
          </p>

          {/* Pricing & Quantity Row */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Price</span>
              <span className="text-2xl font-black text-[#15803D]">
                {formatINR(product.price)}
              </span>
              <span className="text-xs text-gray-500 font-medium">/{product.unit}</span>
            </div>

            {/* Qty Selector */}
            <div className="flex items-center gap-3 bg-[#F7F9F5] px-3 py-1.5 rounded-xl border border-[#E5EAE5]">
              <span className="text-xs font-bold text-gray-600">Qty:</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="text-sm font-bold text-[#17231D] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 flex gap-3">
            <button
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-[#E5EAE5] text-sm font-semibold text-[#17231D] hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAddToCart}
              className="w-2/3 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart ({formatINR(product.price * quantity)})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
