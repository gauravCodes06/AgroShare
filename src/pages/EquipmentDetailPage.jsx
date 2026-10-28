import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Star, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles
} from "lucide-react";
import { useEquipmentStore } from "../store/useEquipmentStore";
import { formatINR, calculateDaysBetween } from "../utils/formatters";

export default function EquipmentDetailPage({ onOpenBookModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const getEquipmentById = useEquipmentStore((state) => state.getEquipmentById);
  const equipment = getEquipmentById(id);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);

  if (!equipment) {
    return (
      <div className="min-h-screen bg-[#F7F9F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-[#E5EAE5] text-center max-w-md space-y-4">
          <h2 className="text-xl font-bold text-[#17231D]">Equipment Not Found</h2>
          <p className="text-sm text-[#647067]">
            The machinery you are looking for is either removed or has an invalid reference ID.
          </p>
          <Link
            to="/equipment"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#15803D] text-white text-sm font-bold"
          >
            Back to Equipment Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const days = calculateDaysBetween(startDate, endDate);
  const totalCost = days * equipment.pricePerDay;

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#647067] hover:text-[#15803D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Main Grid: Left Details + Right Booking Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Media, Specs, Description */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Machinery Media Banner */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-sm border border-[#E5EAE5] bg-gray-100">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#17231D]/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {equipment.category}
              </div>
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#15803D] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                <span>{equipment.status || "Available"}</span>
              </div>
            </div>

            {/* Title & Core Meta */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE5] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#17231D]">
                  {equipment.name}
                </h1>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#17231D] bg-[#F7F9F5] px-3 py-1.5 rounded-xl border border-[#E5EAE5] self-start sm:self-auto">
                  <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
                  <span>{equipment.rating ? equipment.rating.toFixed(1) : "4.9"}</span>
                  <span className="text-gray-400 font-normal">({equipment.reviewsCount || 24} Verified Rentals)</span>
                </div>
              </div>

              {/* Owner and location bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#647067] pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold text-[#17231D]">{equipment.ownerName}</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Host
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#15803D]" />
                  <span>{equipment.village}, {equipment.district}, {equipment.state || "Maharashtra"}</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-[#E5EAE5] space-y-2">
                <h3 className="text-sm font-bold text-[#17231D] uppercase tracking-wider">
                  About Machinery
                </h3>
                <p className="text-sm text-[#647067] leading-relaxed">
                  {equipment.description}
                </p>
              </div>

              {/* Specifications Grid */}
              {equipment.specs && (
                <div className="pt-4 border-t border-[#E5EAE5] space-y-3">
                  <h3 className="text-sm font-bold text-[#17231D] uppercase tracking-wider">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(equipment.specs).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5]">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="text-xs font-bold text-[#17231D]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rental Terms */}
              <div className="pt-4 border-t border-[#E5EAE5] space-y-3">
                <h3 className="text-sm font-bold text-[#17231D] uppercase tracking-wider">
                  Rental & Operating Terms
                </h3>
                <ul className="space-y-2 text-xs text-[#647067]">
                  {(equipment.includedTerms || [
                    "Fuel to be provided by renter",
                    "Return machinery in washed/clean state",
                    "Valid tractor license required"
                  ]).map((term, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Right Column (4 cols): Booking & Contact Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Booking Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-lg space-y-5">
              <div>
                <span className="text-[11px] font-bold text-[#647067] uppercase tracking-wider">Daily Rental Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-[#15803D]">
                    {formatINR(equipment.pricePerDay)}
                  </span>
                  <span className="text-sm font-medium text-[#647067]">/ day</span>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="space-y-3 pt-2 border-t border-[#E5EAE5]">
                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Duration:</span>
                  <span className="font-bold text-[#17231D]">{days} Day{days > 1 ? "s" : ""}</span>
                </div>
                <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#17231D]">Total Cost:</span>
                  <span className="text-2xl font-black text-[#15803D]">{formatINR(totalCost)}</span>
                </div>
              </div>

              {/* Book Action */}
              <button
                onClick={() => onOpenBookModal && onOpenBookModal(equipment)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#EAB308]" />
                <span>Reserve Equipment Now</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 justify-center">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                <span>No advance payment needed for demo booking</span>
              </div>
            </div>

            {/* Direct Owner Contact Card */}
            <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>Direct Owner Contact (Demo)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Want to inspect the tractor or confirm operator availability before booking?
              </p>
              <div className="flex gap-2">
                <a
                  href={`tel:${equipment.phone || "9822014321"}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Host
                </a>
                <a
                  href={`https://wa.me/919822014321?text=Hello%20${encodeURIComponent(equipment.ownerName)},%20I%20am%20inquiring%20about%20your%20${encodeURIComponent(equipment.name)}%20on%20Farm2Value.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
