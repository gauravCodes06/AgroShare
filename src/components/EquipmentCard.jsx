import React from "react";
import { Link } from "react-router-dom";
import { MapPin, User, Star, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { formatINR } from "../utils/formatters";

export default function EquipmentCard({ equipment, onBookClick }) {
  const {
    id,
    name,
    category,
    ownerName,
    village,
    district,
    pricePerDay,
    rating,
    reviewsCount,
    status = "Available",
    imageUrl,
    power
  } = equipment;

  return (
    <div className="group bg-white rounded-2xl border border-[#E5EAE5] shadow-xs hover:shadow-xl hover:border-[#15803D]/40 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-[#17231D]/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {category}
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>{status}</span>
        </div>

        {/* Power Tag if available */}
        {power && (
          <div className="absolute bottom-3 left-3 bg-[#EAB308] text-[#17231D] text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
            {power}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-[#17231D] text-lg leading-snug line-clamp-1 group-hover:text-[#15803D] transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-[#17231D] bg-[#F7F9F5] px-2 py-0.5 rounded-md border border-[#E5EAE5] shrink-0">
              <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
              <span>{rating ? rating.toFixed(1) : "4.9"}</span>
              <span className="text-gray-400 font-normal">({reviewsCount || 18})</span>
            </div>
          </div>

          {/* Owner & Location info */}
          <div className="space-y-1.5 text-xs text-[#647067] mb-4">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#15803D]" />
              <span className="font-medium text-[#17231D]">{ownerName}</span>
              <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Owner
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" />
              <span>{village ? `${village}, ${district}` : district || "Maharashtra"}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#E5EAE5] flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold text-[#647067] uppercase tracking-wider">
              Rental Rate
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#15803D]">
                {formatINR(pricePerDay)}
              </span>
              <span className="text-xs text-[#647067] font-medium">/ day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/equipment/${id}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#17231D] border border-[#E5EAE5] hover:bg-[#F7F9F5] hover:border-gray-300 transition-colors"
            >
              Details
            </Link>
            <button
              onClick={() => onBookClick && onBookClick(equipment)}
              className="px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
