import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Tractor, 
  TrendingUp, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Zap, 
  Clock, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import { useEquipmentStore } from "../store/useEquipmentStore";
import { useProductStore } from "../store/useProductStore";
import EquipmentCard from "../components/EquipmentCard";
import ProductCard from "../components/ProductCard";
import { formatINR } from "../utils/formatters";

export default function LandingPage({ onOpenBookModal, onSelectProduct, onOpenListModal }) {
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const eyebrowRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const floatCardRef = useRef(null);

  const equipment = useEquipmentStore((state) => state.equipment).slice(0, 3);
  const products = useProductStore((state) => state.products).slice(0, 4);

  useEffect(() => {
    // GSAP Hero Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(eyebrowRef.current, { y: -20, opacity: 0, duration: 0.6 })
        .from(headlineRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(subtextRef.current, { y: 20, opacity: 0, duration: 0.7 }, "-=0.4")
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(floatCardRef.current, { scale: 0.9, opacity: 0, y: 30, duration: 0.8 }, "-=0.5");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-[#F7F9F5] to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E5EAE5]">
        
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#EAB308]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow */}
              <div ref={eyebrowRef} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-[#166534] text-xs font-black tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                <span>SMARTER FARMING. STRONGER COMMUNITIES.</span>
              </div>

              {/* Headline */}
              <h1 ref={headlineRef} className="text-4xl sm:text-6xl font-black text-[#17231D] tracking-tight leading-[1.1]">
                Share Equipment. <br />
                <span className="text-[#15803D]">Grow Profits.</span>
              </h1>

              {/* Supporting Copy */}
              <p ref={subtextRef} className="text-lg sm:text-xl text-[#647067] leading-relaxed max-w-xl">
                Access the farm machinery you need, discover smarter ways to sell your harvest, 
                and make every season more profitable with <strong>Farm2Value</strong>.
              </p>

              {/* Primary & Secondary CTAs */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/equipment"
                  className="px-6 py-3.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-base shadow-lg shadow-green-900/15 hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  <Tractor className="w-5 h-5 text-[#EAB308]" />
                  <span>Find Farm Equipment</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/advisor"
                  className="px-6 py-3.5 rounded-xl bg-white border-2 border-[#15803D] text-[#15803D] hover:bg-emerald-50 font-bold text-base transition-all flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Analyze Crop Profit</span>
                </Link>
              </div>

              {/* Trust Metrics Pill */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#647067] font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>No Machine Purchase Needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Transparent Value Addition ROI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Zero Middlemen Marketplace</span>
                </div>
              </div>

            </div>

            {/* Right Column: High Quality Farm Image + Floating Insight Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80"
                  alt="Indian farmer with agricultural tractor machinery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs uppercase tracking-widest text-[#EAB308] font-bold">Community Machinery Pool</p>
                  <h4 className="text-lg font-bold text-white">Empowering Farmers in Baramati & Nashik</h4>
                </div>
              </div>

              {/* Floating Illustrative Metric Card */}
              <div
                ref={floatCardRef}
                className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E5EAE5] shadow-xl max-w-[280px] sm:max-w-[320px] z-20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full">
                    AI Crop Advisor Insight
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">Estimated</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#17231D]">Sugarcane ➔ Pure Jaggery</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-[#15803D]">+₹24,875</span>
                    <span className="text-xs font-bold text-emerald-600">(+332% Profit)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#647067] leading-tight">
                  Compared to raw cane mill delivery. Verified via Farm2Value transparent calculation.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── Core Platform Pillars ───────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-[#E5EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#15803D] bg-[#F7F9F5] px-3 py-1 rounded-full border border-[#E5EAE5]">
              Core Solution Architecture
            </span>
            <h2 className="text-3xl font-black text-[#17231D]">
              Three Pillars of Farm Prosperity
            </h2>
            <p className="text-sm text-[#647067]">
              Engineered to tackle the biggest pain points in the farmer's seasonal economic cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-[#F7F9F5] rounded-3xl p-7 border border-[#E5EAE5] hover:border-[#15803D]/50 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center shadow-md">
                <Tractor className="w-6 h-6 text-[#EAB308]" />
              </div>
              <h3 className="text-xl font-bold text-[#17231D]">
                Share Farm Equipment
              </h3>
              <p className="text-sm text-[#647067] leading-relaxed">
                Rent tractors, harvesters, rotavators, and sprayers from nearby farmers by the day. Equipment owners monetize idle assets; renters avoid crippling debt.
              </p>
              <Link to="/equipment" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803D] hover:underline pt-2">
                <span>Browse Machinery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#F7F9F5] rounded-3xl p-7 border border-[#E5EAE5] hover:border-[#15803D]/50 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6 text-[#EAB308]" />
              </div>
              <h3 className="text-xl font-bold text-[#17231D]">
                Analyze Crop Profitability
              </h3>
              <p className="text-sm text-[#647067] leading-relaxed">
                Input your harvest volume to compare selling raw produce at mandi prices versus processing it into high-value flour, jaggery, puree, or spices.
              </p>
              <Link to="/advisor" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803D] hover:underline pt-2">
                <span>Run Profit Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#F7F9F5] rounded-3xl p-7 border border-[#E5EAE5] hover:border-[#15803D]/50 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center shadow-md">
                <Store className="w-6 h-6 text-[#EAB308]" />
              </div>
              <h3 className="text-xl font-bold text-[#17231D]">
                Sell Directly to Buyers
              </h3>
              <p className="text-sm text-[#647067] leading-relaxed">
                AgroMarket connects verified agricultural producers directly with households and food processors. Eliminate middleman cuts and retain up to 30% more margin.
              </p>
              <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803D] hover:underline pt-2">
                <span>Explore AgroMarket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F7F9F5] border-b border-[#E5EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#15803D]">Simple 3-Step Journey</span>
            <h2 className="text-3xl font-black text-[#17231D]">How Farm2Value Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#15803D] text-white font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-[#17231D] mb-2">Discover or List Machinery</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Filter nearby tractors and implements by price and location, or publish your own equipment to start earning passive rental revenue.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#15803D] text-white font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-[#17231D] mb-2">Book with Confidence</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Select your farming dates, calculate instant rental totals, prevent double bookings, and contact verified owners immediately.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-[#15803D] text-white font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-[#17231D] mb-2">Maximize Harvest Value</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Use the AI advisor to discover if value-addition beats raw mandi selling, then list finished goods straight onto the AgroMarket.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Featured Machinery Section (Module A) ───────────────────────────── */}
      <section className="py-16 bg-white border-b border-[#E5EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#15803D]">AgroShare Marketplace</span>
              <h2 className="text-3xl font-black text-[#17231D] mt-1">Featured Farm Machinery</h2>
              <p className="text-sm text-[#647067]">Top-rated verified equipment ready for instant reservation.</p>
            </div>

            <div className="flex items-center gap-3">
              {onOpenListModal && (
                <button
                  onClick={onOpenListModal}
                  className="px-4 py-2 rounded-xl border border-[#15803D] text-[#15803D] text-xs font-bold hover:bg-emerald-50 transition-colors"
                >
                  + List Machinery
                </button>
              )}
              <Link
                to="/equipment"
                className="px-4 py-2 rounded-xl bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534] transition-colors flex items-center gap-1"
              >
                <span>View All ({equipment.length + 5})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onBookClick={onOpenBookModal}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─── Crop Advisor Interactive Preview (Module B) ─────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-[#166534] to-[#15803D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-black uppercase tracking-widest text-[#EAB308] bg-black/20 px-3 py-1 rounded-full">
                Module B · Profit Optimizer
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Stop Selling at Raw Distress Rates. Discover Value-Addition.
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                Our calculation engine simulates processing expenses, yield loss, packaging costs, and retail prices so you know exactly whether making puree, flour, or jaggery is worth your time.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-stone-900 font-bold text-xs flex items-center justify-center">✓</div>
                  <span>100% transparent arithmetic with editable cost assumptions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-stone-900 font-bold text-xs flex items-center justify-center">✓</div>
                  <span>Works fully offline in browser with zero paid API dependencies</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#EAB308] text-stone-900 font-bold text-xs flex items-center justify-center">✓</div>
                  <span>Generates customized 4-step production roadmap for farmers</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/advisor"
                  className="px-6 py-3.5 rounded-xl bg-white text-[#15803D] hover:bg-emerald-50 font-bold text-sm shadow-xl inline-flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-[#15803D]" />
                  <span>Launch Crop Profit Advisor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Demonstration Calculator Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 text-[#17231D] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h4 className="font-bold text-base text-[#17231D]">Live Comparison Demonstration</h4>
                <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-full">
                  Sugarcane 50 qtl
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">Scenario A: Raw Cane</span>
                  <div className="text-xl font-black text-gray-800">₹7,500</div>
                  <p className="text-[10px] text-gray-500">Mandi Raw Net Profit</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Scenario B: Jaggery</span>
                  <div className="text-xl font-black text-[#15803D]">₹32,375</div>
                  <p className="text-[10px] text-emerald-700">Processed Net Profit</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Net Profit Gain</span>
                  <span className="text-2xl font-black text-amber-800">+₹24,875</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-md shadow-xs">
                    +332% Profit
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                *Based on standard 11.5% jaggery recovery ratio and ₹85/kg chemical-free wholesale rate.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Featured AgroMarket Products (Module C) ─────────────────────────── */}
      <section className="py-16 bg-[#F7F9F5] border-b border-[#E5EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#15803D]">AgroMarket Direct</span>
              <h2 className="text-3xl font-black text-[#17231D] mt-1">Farm Fresh & Value-Added Goods</h2>
              <p className="text-sm text-[#647067]">Support smallholder farmers directly with zero commission middlemen.</p>
            </div>

            <Link
              to="/marketplace"
              className="px-4 py-2 rounded-xl bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534] transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─── Final Hackathon Call To Action ──────────────────────────────────── */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto shadow-md">
            <Tractor className="w-8 h-8 text-[#15803D]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#17231D] tracking-tight">
            Ready to Experience Farm2Value?
          </h2>

          <p className="text-base text-[#647067] max-w-xl mx-auto leading-relaxed">
            Test the equipment sharing workflow, run the crop profit advisor, and browse farm products in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/equipment"
              className="px-6 py-3.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Tractor className="w-4 h-4 text-[#EAB308]" />
              <span>Explore Equipment Marketplace</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[#F7F9F5] border border-[#E5EAE5] text-[#17231D] hover:bg-gray-100 font-bold text-sm transition-all"
            >
              Open Farmer Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
