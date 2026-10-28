import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Tractor, 
  TrendingUp, 
  Store, 
  CalendarCheck, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { 
  PRICE_TRENDS_7D, 
  CURRENT_MARKET_INDICATORS, 
  DEMO_PLATFORM_STATS 
} from "../data/marketPrices";
import { useEquipmentStore } from "../store/useEquipmentStore";
import { useBookingStore } from "../store/useBookingStore";
import { useAdvisorStore } from "../store/useAdvisorStore";
import { formatINR, formatDateReadable } from "../utils/formatters";

export default function DashboardPage({ onOpenListModal }) {
  const equipment = useEquipmentStore((state) => state.equipment);
  const bookings = useBookingStore((state) => state.bookings);
  const savedAnalyses = useAdvisorStore((state) => state.savedAnalyses);

  const [selectedCropTrend, setSelectedCropTrend] = useState("Tomato");

  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const estimatedSavings = DEMO_PLATFORM_STATS.totalRentalSavedINR + (confirmedBookings.length * 4500);

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Farmer Operational Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#17231D] tracking-tight">
              Farmer Economic Dashboard
            </h1>
            <p className="text-sm text-[#647067] mt-1">
              Real-time monitoring of your equipment rentals, crop profit analyses, and mandi rates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenListModal}
              className="px-4 py-2.5 rounded-xl bg-[#15803D] text-white text-xs font-bold shadow-sm hover:bg-[#166534] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#EAB308]" />
              <span>List Equipment</span>
            </button>
            <Link
              to="/advisor"
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E5EAE5] text-[#17231D] text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-[#15803D]" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* ─── 4 Key Performance Metric Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Metric 1: Rental Expenses Saved */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Rental Expense Saved
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
                <Tractor className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#15803D]">
              {formatINR(estimatedSavings)}
            </div>
            <p className="text-[11px] text-[#647067] leading-tight">
              Saved by leasing vs. machinery ownership EMI and maintenance.
            </p>
          </div>

          {/* Metric 2: Active Equipment in Pool */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Available Machinery
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Tractor className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#17231D]">
              {equipment.length} Units
            </div>
            <p className="text-[11px] text-[#647067] leading-tight">
              Tractors, harvesters, and sprayers ready in regional radius.
            </p>
          </div>

          {/* Metric 3: Active Bookings */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Bookings
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#17231D]">
              {confirmedBookings.length}
            </div>
            <p className="text-[11px] text-[#647067] leading-tight">
              Upcoming field work scheduled across local farms.
            </p>
          </div>

          {/* Metric 4: Crop Analyses Completed */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Crop Analyses Run
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#17231D]">
              {savedAnalyses.length}
            </div>
            <p className="text-[11px] text-[#647067] leading-tight">
              Value addition calculations saved in your local store.
            </p>
          </div>

        </div>

        {/* ─── Quick Actions Row ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Quick Platform Actions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/equipment"
              className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] hover:border-[#15803D] hover:bg-emerald-50/50 transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#15803D] text-white flex items-center justify-center shrink-0">
                <Tractor className="w-5 h-5 text-[#EAB308]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17231D] block group-hover:text-[#15803D]">
                  Find Equipment
                </span>
                <span className="text-[10px] text-gray-500">Rent nearby tools</span>
              </div>
            </Link>

            <button
              onClick={onOpenListModal}
              className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] hover:border-[#15803D] hover:bg-emerald-50/50 transition-all group flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17231D] block group-hover:text-[#15803D]">
                  List Equipment
                </span>
                <span className="text-[10px] text-gray-500">Earn idle rental</span>
              </div>
            </button>

            <Link
              to="/advisor"
              className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] hover:border-[#15803D] hover:bg-emerald-50/50 transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17231D] block group-hover:text-[#15803D]">
                  Analyze Crop
                </span>
                <span className="text-[10px] text-gray-500">Compare profit</span>
              </div>
            </Link>

            <Link
              to="/marketplace"
              className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] hover:border-[#15803D] hover:bg-emerald-50/50 transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17231D] block group-hover:text-[#15803D]">
                  AgroMarket
                </span>
                <span className="text-[10px] text-gray-500">Direct sales</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── 7-Day Crop Price Trend Chart (Recharts) ────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAE5] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EAE5]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#17231D]">
                  7-Day Mandi Price Benchmarks
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Demonstration Feed
                </span>
              </div>
              <p className="text-xs text-[#647067] mt-0.5">
                Regional wholesale prices per quintal (Maharashtra APMC benchmarks).
              </p>
            </div>

            {/* Crop selector */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {["Tomato", "Wheat", "Soybean", "Onion"].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCropTrend(crop)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCropTrend === crop
                      ? "bg-[#15803D] text-white shadow-xs"
                      : "bg-[#F7F9F5] text-gray-600 border border-[#E5EAE5] hover:bg-gray-100"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full min-w-0 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRICE_TRENDS_7D} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#647067" }} />
                <YAxis tick={{ fontSize: 11, fill: "#647067" }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(val) => `₹${val} / qtl`}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E5EAE5", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line 
                  type="monotone" 
                  dataKey={selectedCropTrend} 
                  stroke="#15803D" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: "#15803D" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Market Indicators & Recent Activity Grid ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Live Market Indicators (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAE5]">
              <h3 className="font-bold text-base text-[#17231D]">
                Regional Mandi Spot Rates
              </h3>
              <span className="text-xs text-gray-400">Oct 28 Benchmark</span>
            </div>

            <div className="divide-y divide-gray-100">
              {CURRENT_MARKET_INDICATORS.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#17231D]">{item.crop}</h4>
                    <span className="text-[11px] text-gray-500">{item.mandi} · {item.note}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-xs text-[#17231D] block">{item.price}</span>
                    <span className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${
                      item.isUp ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {item.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.change} (24h)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAE5]">
              <h3 className="font-bold text-base text-[#17231D]">
                Platform Activity Feed
              </h3>
              <Link to="/my-bookings" className="text-xs font-bold text-[#15803D] hover:underline">
                View All Bookings
              </Link>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#17231D]">{b.equipmentName}</span>
                      <span className="text-[10px] font-bold text-[#15803D] bg-white px-2 py-0.5 rounded border border-[#E5EAE5]">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Reserved for {b.totalDays} Days · {formatINR(b.totalCost)} ({b.startDate} to {b.endDate})
                    </p>
                  </div>
                </div>
              ))}

              {savedAnalyses.slice(0, 2).map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950">
                        {a.cropName} ➔ {a.productName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                        +{a.profitUpliftPercent}% Uplift
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Additional estimated profit: <strong>+{formatINR(a.additionalProfit)}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── "How Farm2Value Helps" Visual Summary ───────────────────────────── */}
        <div className="bg-gradient-to-br from-[#166534] to-[#15803D] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#EAB308]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#EAB308]">
              Economic Impact Manifesto
            </span>
          </div>

          <h3 className="text-2xl font-black">
            How Farm2Value Revolutionizes Farm Economics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs sm:text-sm text-emerald-100">
            <div className="space-y-1">
              <strong className="text-white block font-bold text-base">1. Zero Debt Mechanization</strong>
              <p>Smallholders access modern 50 HP tractors and rotavators without bank loans or high interest rates.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-bold text-base">2. Higher Realized Value</strong>
              <p>Converting raw sugarcane or wheat into jaggery or branded flour retains 50% to 200% more income on the farm.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-bold text-base">3. Fair Direct Channels</strong>
              <p>Eliminate 3 to 4 intermediaries between the farm gate and urban household kitchens.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
