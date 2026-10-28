import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { ref as dbRef, push, set } from "firebase/database";
import useAuthStore from "../store/useAuthStore";
import { compressAndUpload } from "../services/cloudinary";
import { getUserLocation, reverseGeocode } from "../utils/geo";
import { suggestPrice } from "../utils/priceSuggestion";
import toast from "react-hot-toast";
import {
    MdAddCircle, MdLocationOn, MdStar, MdVerified,
    MdFlashOn, MdSecurity, MdClose, MdBarChart,
    MdQrCode2, MdStorefront, MdArrowForward, MdAutoGraph,
} from "react-icons/md";
import {
    FaTractor, FaSeedling, FaBrain, FaQrcode,
    FaShoppingCart, FaChartLine, FaLeaf,
} from "react-icons/fa";
import { GiFarmer, GiWheat } from "react-icons/gi";

/* ─── Animated section wrapper ────────────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ─── Static data ──────────────────────────────────────────────────────────── */
const STATS = [
    { icon: <GiFarmer />, value: "18,000+", label: "Verified Farmers" },
    { icon: <FaTractor />, value: "2,400+", label: "Equipment Listed" },
    { icon: <MdStar />, value: "4.8 ★", label: "Average Rating" },
    { icon: <MdLocationOn />, value: "320+", label: "Villages Covered" },
];

const FEATURES = [
    {
        num: "01",
        emoji: "🧠",
        icon: <FaBrain className="h-8 w-8" />,
        title: "AI Value Addition Engine",
        tag: "Core Feature",
        tagColor: "bg-purple-100 text-purple-700",
        gradient: "from-purple-600 to-violet-700",
        shadow: "shadow-purple-200",
        desc: "Input your crop type & quantity — our AI decides whether to sell raw or process it for higher profit, and shows step-by-step production workflows.",
        bullets: [
            "Sell raw vs. process recommendation",
            "Profit estimation & market demand",
            "Daily expense & portfolio tracker",
            "Step-by-step production workflow",
        ],
        link: "/ai-recommendations",
        linkLabel: "Try AI Engine →",
    },
    {
        num: "02",
        emoji: "🛒",
        icon: <FaShoppingCart className="h-8 w-8" />,
        title: "E-Commerce Seller Module",
        tag: "Sell Direct",
        tagColor: "bg-blue-100 text-blue-700",
        gradient: "from-blue-600 to-cyan-700",
        shadow: "shadow-blue-200",
        desc: "Farmers sell raw or processed products directly to buyers — with smart price suggestions, inventory tracking, and real-time order management.",
        bullets: [
            "Upload products with photos & pricing",
            "Smart AI price suggestions",
            "Real-time order & inventory tracking",
            "Direct farmer-to-buyer channel",
        ],
        link: "/agromarket",
        linkLabel: "Browse AgroMarket →",
    },
    {
        num: "03",
        emoji: "🚜",
        icon: <FaTractor className="h-8 w-8" />,
        title: "Equipment Rental Marketplace",
        tag: "Peer-to-Peer",
        tagColor: "bg-green-100 text-green-700",
        gradient: "from-green-600 to-emerald-700",
        shadow: "shadow-green-200",
        desc: "OLX-style listing to rent or lend tractors, harvesters, and tools. Filter by location, contact the owner via call or chat — no middlemen.",
        bullets: [
            "List & rent farm equipment nearby",
            "GPS-based location filter",
            "Direct contact (call / chat)",
            "Verified owner ratings",
        ],
        link: "/equipment",
        linkLabel: "Explore Equipment →",
    },
    {
        num: "04",
        emoji: "📊",
        icon: <FaChartLine className="h-8 w-8" />,
        title: "Market Intelligence Dashboard",
        tag: "Live Data",
        tagColor: "bg-amber-100 text-amber-700",
        gradient: "from-amber-600 to-orange-700",
        shadow: "shadow-amber-200",
        desc: "Live mandi prices, demand trends, and crop-wise market insights — all in one place. Make smarter selling decisions, every single day.",
        bullets: [
            "Live mandi price feed",
            "Crop demand trends",
            "Best time to sell insights",
            "Regional market comparisons",
        ],
        link: "/mandi-prices",
        linkLabel: "View Mandi Prices →",
    },
    {
        num: "05",
        emoji: "🌐",
        icon: <FaQrcode className="h-8 w-8" />,
        title: "Product Traceability System",
        tag: "Farm to Market",
        tagColor: "bg-teal-100 text-teal-700",
        gradient: "from-teal-600 to-green-700",
        shadow: "shadow-teal-200",
        desc: "Every product gets a unique QR code linked to the farmer, land data, and full production history. Customers scan to see the complete farm-to-market journey.",
        bullets: [
            "Unique QR per product batch",
            "Linked to farmer + land + production",
            "Customer-facing transparency page",
            "Builds brand trust for premium pricing",
        ],
        link: "/auth?signup=1",
        linkLabel: "Get Started →",
    },
];

const HOW_IT_WORKS = [
    { icon: "1️⃣", title: "Register & Verify", desc: "Sign up as a verified farmer with your Kisan Card or 7/12 Utara — our AI verifies your identity in seconds." },
    { icon: "2️⃣", title: "Enter Your Crop Data", desc: "Tell the AI your crop type, quantity, and land details. Get instant recommendations on what to sell and how to process." },
    { icon: "3️⃣", title: "List & Sell", desc: "Upload products directly to buyers or list your equipment for rent. Set your price, track orders, and earn more." },
    { icon: "4️⃣", title: "Track & Grow", desc: "Monitor profits, track market prices, and build a loyal buyer base with product traceability QR codes." },
];

const EQUIPMENT_TYPE_LIST = ["Tractor", "Harvester", "Sprayer", "Rotavator", "Plough", "Tools"];

/* ─── Add Equipment Modal (kept intact) ───────────────────────────────────── */
const AddEquipmentModal = ({ open, onClose, authUser, user }) => {
    const [form, setForm] = useState({ name: "", type: "Tractor", price: "", salePrice: "", location: "", description: "", listingType: "rent" });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleGPS = async () => {
        try {
            const loc = await getUserLocation();
            const address = await reverseGeocode(loc.lat, loc.lng);
            setForm(f => ({ ...f, location: address, lat: loc.lat, lng: loc.lng }));
            toast.success(`📍 Location: ${address}`);
        } catch { toast.error("Could not get GPS location"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.location) { toast.error("Fill all required fields"); return; }
        setUploading(true);
        try {
            let imageUrl = "";
            if (imageFile) imageUrl = await compressAndUpload(imageFile);
            const newRef = push(ref(db, "equipment"));
            await set(newRef, {
                name: form.name, type: form.type,
                listingType: form.listingType,
                price: form.price ? Number(form.price) : 0,
                salePrice: form.salePrice ? Number(form.salePrice) : null,
                location: form.lat ? { address: form.location, lat: form.lat, lng: form.lng } : form.location,
                description: form.description,
                ownerId: authUser.uid,
                ownerName: user?.name,
                imageUrl, status: "approved", rating: null,
                createdAt: new Date().toISOString(),
            });
            toast.success("Equipment listed! 🎉");
            setForm({ name: "", type: "Tractor", price: "", salePrice: "", location: "", description: "", listingType: "rent" });
            setImageFile(null); setImagePreview(null);
            onClose();
        } catch (err) { toast.error(`Upload failed: ${err.message}`); }
        finally { setUploading(false); }
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 pt-6 pb-4 flex items-center justify-between rounded-t-3xl">
                    <h2 className="text-xl font-black text-gray-900">List Your Equipment 🌾</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                        <MdClose className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Equipment Name *</label>
                            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Mahindra 575 DI" />
                        </div>
                        <div>
                            <label className="label">Type *</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                                {EQUIPMENT_TYPE_LIST.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Rental Price / hr (₹) *</label>
                        <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="e.g. 250" />
                    </div>
                    <div>
                        <label className="label flex justify-between">
                            <span>Location *</span>
                            <button type="button" onClick={handleGPS} className="text-green-600 text-xs font-bold hover:underline flex items-center gap-1">
                                <MdLocationOn className="h-3 w-3" /> Use GPS
                            </button>
                        </label>
                        <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field" placeholder="e.g. Shirur, Pune" />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Condition, accessories, etc." />
                    </div>
                    <button type="submit" disabled={uploading} className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg ${uploading ? "bg-green-300 text-white cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}>
                        {uploading ? "Uploading..." : "List Equipment 🌾"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const HomePage = () => {
    const { user, authUser } = useAuthStore();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="overflow-x-hidden">

            {/* ══════════════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <img
                    src="/src/assets/TRACTORS.jpg"
                    alt="Farm background"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-green-950/70 to-black/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-green-400/40 rounded-full"
                        style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
                        animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                ))}

                <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 text-center py-24">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-500/40 px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
                    >
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        India's AI-Powered Agri Platform 🇮🇳
                    </motion.div>

                    {/* Main heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] font-display mb-6 drop-shadow-lg"
                    >
                        Farm<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">2</span>Value
                        <br />
                        <span className="text-3xl sm:text-4xl md:text-5xl text-gray-200 font-bold">
                            Grow More. Earn More.
                        </span>
                    </motion.h1>

                    {/* Sub-heading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto"
                    >
                        AI-powered platform for Indian farmers — from crop value analysis and
                        equipment rentals to direct selling and product traceability.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
                    >
                        <Link
                            to="/auth?signup=1"
                            className="group px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-green-900/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <GiFarmer className="h-5 w-5" />
                            Start as Farmer 🌱
                        </Link>
                        <Link
                            to="/auth"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold text-lg rounded-2xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Sign In <MdArrowForward className="h-5 w-5" />
                        </Link>
                    </motion.div>

                    {/* Feature mini-pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.85 }}
                        className="flex flex-wrap items-center justify-center gap-3"
                    >
                        {[
                            { emoji: "🧠", text: "AI Value Engine" },
                            { emoji: "🛒", text: "E-Commerce" },
                            { emoji: "🚜", text: "Equipment Rental" },
                            { emoji: "📊", text: "Mandi Prices" },
                            { emoji: "🌐", text: "QR Traceability" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/20 transition-colors cursor-default"
                            >
                                <span>{item.emoji}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs flex flex-col items-center gap-1"
                >
                    <span className="tracking-widest uppercase text-[10px]">Scroll</span>
                    <div className="w-px h-8 bg-white/30" />
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════════════ */}
            <section className="relative -mt-16 z-10 pb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-white rounded-2xl p-6 text-center shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="text-2xl text-green-600 mb-2 flex justify-center">{s.icon}</div>
                                    <p className="text-2xl font-black text-gray-900 font-display">{s.value}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FEATURES SECTION — 5 Key Features
            ══════════════════════════════════════════════════ */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                            Platform Features
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 font-display leading-tight">
                            Everything a Farmer Needs
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                                In One Platform
                            </span>
                        </h2>
                        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
                            From AI-powered crop analysis to direct market access — Farm2Value is built for rural India.
                        </p>
                    </FadeIn>

                    <div className="space-y-10">
                        {FEATURES.map((f, i) => (
                            <FadeIn key={i} delay={0.1}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className={`bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col lg:flex-row ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
                                >
                                    {/* Color panel */}
                                    <div className={`lg:w-2/5 bg-gradient-to-br ${f.gradient} p-10 flex flex-col justify-between relative overflow-hidden`}>
                                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                                        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/5 rounded-full" />

                                        <div className="relative">
                                            <div className="text-6xl font-black text-white/20 font-display mb-4">{f.num}</div>
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white mb-4">
                                                {f.icon}
                                            </div>
                                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 bg-white/20 text-white`}>
                                                {f.tag}
                                            </span>
                                            <h3 className="text-2xl font-black text-white leading-tight">{f.title}</h3>
                                        </div>

                                        <div className="relative mt-6 text-5xl opacity-80">{f.emoji}</div>
                                    </div>

                                    {/* Text panel */}
                                    <div className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-center space-y-5">
                                        <p className="text-gray-600 text-base leading-relaxed">{f.desc}</p>

                                        <ul className="space-y-2.5">
                                            {f.bullets.map((b, bi) => (
                                                <li key={bi} className="flex items-start gap-3 text-sm text-gray-700">
                                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${f.gradient} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            to={user ? f.link : "/auth?signup=1"}
                                            className={`inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-gradient-to-r ${f.gradient} text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all`}
                                        >
                                            {f.linkLabel} <MdArrowForward className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════════ */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                            How It Works
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 font-display">
                            Start in 4 Simple Steps
                        </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HOW_IT_WORKS.map((step, i) => (
                            <FadeIn key={i} delay={i * 0.12}>
                                <div className="relative">
                                    {/* Connector line */}
                                    {i < HOW_IT_WORKS.length - 1 && (
                                        <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-transparent z-0" />
                                    )}
                                    <motion.div
                                        whileHover={{ y: -6 }}
                                        className="relative z-10 bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all h-full"
                                    >
                                        <div className="text-4xl mb-4">{step.icon}</div>
                                        <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                    </motion.div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                TRUST PILLARS
            ══════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="max-w-6xl mx-auto relative">
                    <FadeIn className="text-center mb-14">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-display">
                            Why Trust Farm2Value?
                        </h2>
                        <p className="text-green-300 mt-3 text-lg">Built with Indian farmers at heart</p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🛡️", title: "AI-Verified Farmers Only", desc: "Every farmer is verified via Kisan Card or 7/12 Utara using AI vision. No fake listings, no fraud." },
                            { icon: "🔒", title: "Secure & Transparent", desc: "All transactions are logged. Product traceability via QR gives buyers full supply-chain visibility." },
                            { icon: "📶", title: "Works on 2G Networks", desc: "Optimized for rural India — lightweight, fast, and works even with slow internet connections." },
                        ].map((p, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-7 text-center hover:bg-white/15 transition-all">
                                    <div className="text-5xl mb-4">{p.icon}</div>
                                    <h3 className="font-bold text-white text-lg mb-2">{p.title}</h3>
                                    <p className="text-green-200 text-sm leading-relaxed">{p.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FINAL CTA
            ══════════════════════════════════════════════════ */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-bold px-5 py-2 rounded-full mb-6">
                            <GiWheat className="h-4 w-4" /> Join the Movement
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 font-display mb-4 leading-tight">
                            Ready to Maximize
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                                Your Farm's Value?
                            </span>
                        </h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
                            Join 18,000+ Indian farmers already using Farm2Value to earn more, waste less, and grow smarter.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Link
                                to="/auth?signup=1"
                                className="group bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-200 hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                <GiFarmer className="h-5 w-5" />
                                Register Free — It's Easy!
                            </Link>
                            <Link
                                to="/auth"
                                className="border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 px-10 py-4 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all"
                            >
                                Sign In →
                            </Link>
                        </div>
                        <p className="text-gray-400 text-xs mt-6">
                            Free to join · Verified farmers only · Secure & trusted
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Add Equipment Modal */}
            <AddEquipmentModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                authUser={authUser}
                user={user}
            />
        </div>
    );
};

export default HomePage;
