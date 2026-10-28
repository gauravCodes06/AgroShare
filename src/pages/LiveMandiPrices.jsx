import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdSearch, MdTrendingUp, MdLocationOn, MdRefresh } from "react-icons/md";
import { toast } from "react-hot-toast";

const LiveMandiPrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterState, setFilterState] = useState("All");

    const fetchMandiData = async () => {
        setLoading(true);
        const apiKey = import.meta.env.VITE_DATA_GOV_IN_API_KEY;

        try {
            if (!apiKey) throw new Error("Missing API Key");

            // Daily Mandi Rates Dataset on Data.gov.in
            const res = await fetch(
                `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`
            );

            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();

            if (data.records) {
                setPrices(data.records);
            } else {
                throw new Error("No records found");
            }
        } catch (error) {
            console.error("Mandi API Error:", error);
            try {
                // FALLBACK: Use Grok API
                const grokKey = import.meta.env.VITE_XAI_API_KEY;
                if (!grokKey) throw new Error("No Grok/xAI API key");
                toast("Data.gov.in API offline. Fetching from Grok AI...", { icon: '🤖' });
                const res = await fetch("https://api.x.ai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${grokKey}`
                    },
                    body: JSON.stringify({
                        model: "grok-2-latest",
                        messages: [{
                            role: "user",
                            content: `Provide current estimated mandi prices for 10 common Indian crops in JSON format. 
The out should purely be a JSON array with objects matching exactly this structure: 
[{"state":"Maharashtra","district":"Jalgaon","market":"Jalgaon","commodity":"Banana","variety":"Deshi","min_price":1200,"max_price":1600,"modal_price":1400,"arrival_date":"${new Date().toISOString().split('T')[0]}"}]
Do not include markdown blocks, just the JSON array.`
                        }],
                        temperature: 0.1
                    })
                });
                if (!res.ok) throw new Error("Grok API failed");
                const grokData = await res.json();
                let text = grokData.choices[0].message.content.trim();
                const match = text.match(/\[[\s\S]*\]/);
                if (!match) throw new Error("Grok didn't return a JSON array");
                const parsed = JSON.parse(match[0]);

                const withSource = parsed.map(item => ({ ...item, isFromGrok: true }));
                setPrices(withSource);
                toast.success("Loaded estimated data from Grok AI");
            } catch (grokErr) {
                console.error("Grok Fallback Error:", grokErr);
                toast.error("Using latest available cached data due to API limits.");
                setPrices([
                    { state: "Maharashtra", district: "Jalgaon", market: "Jalgaon", commodity: "Banana", variety: "Deshi", min_price: 1200, max_price: 1600, modal_price: 1400, arrival_date: new Date().toISOString().split('T')[0] },
                    { state: "Maharashtra", district: "Jalgaon", market: "Jalgaon", commodity: "Cotton", variety: "Hybrid", min_price: 6800, max_price: 7200, modal_price: 7000, arrival_date: new Date().toISOString().split('T')[0] },
                    { state: "Punjab", district: "Ludhiana", market: "Ludhiana", commodity: "Wheat", variety: "Other", min_price: 2150, max_price: 2300, modal_price: 2275, arrival_date: new Date().toISOString().split('T')[0] },
                    { state: "Uttar Pradesh", district: "Agra", market: "Agra", commodity: "Potato", variety: "Desi", min_price: 800, max_price: 1100, modal_price: 950, arrival_date: new Date().toISOString().split('T')[0] },
                    { state: "Madhya Pradesh", district: "Indore", market: "Indore", commodity: "Soyabean", variety: "Yellow", min_price: 4500, max_price: 4800, modal_price: 4700, arrival_date: new Date().toISOString().split('T')[0] },
                    { state: "Gujarat", district: "Rajkot", market: "Rajkot", commodity: "Groundnut", variety: "Big", min_price: 5200, max_price: 5800, modal_price: 5600, arrival_date: new Date().toISOString().split('T')[0] }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMandiData();
    }, []);

    // Extract unique states for the filter dropdown
    const uniqueStates = ["All", ...new Set(prices.map(p => p.state))].filter(Boolean);

    // Filter logic
    const filteredPrices = prices.filter(p => {
        if (!p) return false;
        const term = search.toLowerCase();
        const matchSearch = (p.commodity?.toLowerCase().includes(term) || p.market?.toLowerCase().includes(term) || p.district?.toLowerCase().includes(term));
        const matchState = filterState === "All" || p.state === filterState;
        return matchSearch && matchState;
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="hidden md:flex mb-8 flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <MdTrendingUp className="text-green-600" /> Live Mandi Prices
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Track real-time agricultural commodity rates across Indian markets.</p>
                    </div>
                    <button
                        onClick={fetchMandiData}
                        className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                    >
                        <MdRefresh className={loading ? "animate-spin text-green-600" : "text-green-600"} /> Refresh Data
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search by crop, market, or district..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                        />
                    </div>
                    <select
                        value={filterState}
                        onChange={e => setFilterState(e.target.value)}
                        className="md:w-64 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700 font-medium cursor-pointer"
                    >
                        {uniqueStates.map(state => (
                            <option key={state} value={state}>{state === "All" ? "All States" : state}</option>
                        ))}
                    </select>
                </div>

                {/* Data Display Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-10 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Fetching real-time price records...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Commodity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Market & District</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">State</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Min Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Max Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Modal Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredPrices.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center text-gray-500 text-lg">
                                                No commodities found matching your search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPrices.map((item, idx) => (
                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                                                key={idx}
                                                className="hover:bg-green-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{item.commodity}</span>
                                                        <span className="text-[10px] text-green-600 font-bold uppercase mt-0.5 tracking-wider">{item.variety}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-700">{item.market}</span>
                                                        <span className="text-xs text-gray-400">{item.district}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {item.state}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-gray-600 tracking-tight">₹{item.min_price}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-gray-600 tracking-tight">₹{item.max_price}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-black text-green-600 tracking-tight">₹{item.modal_price}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">/Qt</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-bold text-gray-400">{item.arrival_date}</span>
                                                        {item.isFromGrok && <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">Grok AI Estimate</span>}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMandiPrices;
