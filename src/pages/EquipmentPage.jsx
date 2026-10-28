import React, { useState, useMemo } from "react";
import { 
  Tractor, 
  Search, 
  PlusCircle, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useEquipmentStore } from "../store/useEquipmentStore";
import { EQUIPMENT_CATEGORIES } from "../data/equipment";
import EquipmentCard from "../components/EquipmentCard";

export default function EquipmentPage({ onOpenBookModal, onOpenListModal }) {
  const equipment = useEquipmentStore((state) => state.equipment);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("rating"); // "price-asc" | "price-desc" | "rating"
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // "all" | "Available"

  // Filter & sort logic
  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((item) => {
        // Search query
        const matchesSearch = 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = 
          selectedCategory === "All" || item.category === selectedCategory;

        // Max price filter
        const matchesPrice = item.pricePerDay <= maxPrice;

        // Availability filter
        const matchesAvailability = 
          availabilityFilter === "all" || item.status === availabilityFilter;

        return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price-desc") return b.pricePerDay - a.pricePerDay;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [equipment, searchQuery, selectedCategory, maxPrice, sortBy, availabilityFilter]);

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2">
              <Tractor className="w-3.5 h-3.5" />
              <span>AgroShare Rental Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#17231D] tracking-tight">
              Farm Equipment Marketplace
            </h1>
            <p className="text-sm text-[#647067] mt-1">
              Find the right machinery for your next farming task.
            </p>
          </div>

          <button
            onClick={onOpenListModal}
            className="px-5 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-5 h-5 text-[#EAB308]" />
            <span>List Your Equipment</span>
          </button>
        </div>

        {/* Search & Filters Controls Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5EAE5] shadow-xs space-y-5">
          
          {/* Search Bar + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractor, rotavator, or village location..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 whitespace-nowrap">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Lowest Price First</option>
                <option value="price-desc">Highest Price First</option>
              </select>
            </div>
          </div>

          {/* Category Chips Carousel/Wrap */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Category Filter
            </div>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_CATEGORIES.map((cat) => (
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

          {/* Slider for Max Price */}
          <div className="pt-2 border-t border-[#E5EAE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-72">
              <span className="font-bold text-[#17231D] whitespace-nowrap">Max Price:</span>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#15803D] cursor-pointer"
              />
              <span className="font-extrabold text-[#15803D] whitespace-nowrap min-w-[60px]">
                ₹{maxPrice}/day
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Showing <strong>{filteredEquipment.length}</strong> of {equipment.length} machinery items</span>
              {(searchQuery || selectedCategory !== "All" || maxPrice < 5000) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setMaxPrice(5000);
                  }}
                  className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onBookClick={onOpenBookModal}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE5] max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
              <Tractor className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#17231D]">No Machinery Found</h3>
            <p className="text-xs text-[#647067]">
              No farm equipment matches your current search filters. Try widening your price filter or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setMaxPrice(5000);
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
