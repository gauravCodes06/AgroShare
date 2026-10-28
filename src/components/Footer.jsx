import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Heart, ShieldCheck, Tractor, TrendingUp, Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#17231D] text-white pt-14 pb-20 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15803D] flex items-center justify-center text-white shadow-md">
                <Leaf className="w-5 h-5 text-[#EAB308]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Farm<span className="text-[#22C55E]">2</span>Value
                </span>
                <p className="text-xs text-gray-400 font-medium">Grow More. Earn More.</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm max-w-md leading-relaxed">
              Empowering Indian farmers by sharing farm machinery to slash capital expenses, 
              connecting harvest directly to consumers, and discovering profitable crop value-addition opportunities through transparent calculations.
            </p>

            <div className="p-3.5 rounded-xl bg-gray-800/60 border border-gray-700/60 text-xs text-gray-300 max-w-md flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0" />
              <span>
                <strong>Core Philosophy:</strong> Farmers should not need to own every machine or sell every crop raw to grow their income.
              </span>
            </div>
          </div>

          {/* Quick Platform Modules */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EAB308] mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300 font-medium">
              <li>
                <Link to="/equipment" className="hover:text-white flex items-center gap-2 transition-colors">
                  <Tractor className="w-4 h-4 text-[#22C55E]" />
                  <span>AgroShare Equipment</span>
                </Link>
              </li>
              <li>
                <Link to="/advisor" className="hover:text-white flex items-center gap-2 transition-colors">
                  <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                  <span>AI Crop Profit Advisor</span>
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white flex items-center gap-2 transition-colors">
                  <Store className="w-4 h-4 text-[#22C55E]" />
                  <span>AgroMarket Direct</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                  <span>Farmer Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
                  <span>Booking Tracker</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon Project Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EAB308] mb-4">
              Hackathon MVP Notice
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Built for high-impact agricultural problem solving. All machinery listings, bookings, and product orders run in client-side demonstration mode with persistent browser storage.
            </p>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-2">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>for Indian Smallholder Farmers</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© 2026 Farm2Value Platform. Built for Agricultural Hackathon 2026.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-medium">● Local Demo Mode Active</span>
            <Link to="/equipment" className="hover:underline">Explore Machinery</Link>
            <Link to="/advisor" className="hover:underline">Run Crop Profit</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
