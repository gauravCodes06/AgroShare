import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import { MdArrowForward, MdVerified, MdSchedule, MdLock } from "react-icons/md";
import { GiFarmer } from "react-icons/gi";
import toast from "react-hot-toast";
import equipmentImg from "../assets/farmer rental equipment .png";
import valueImg from "../assets/value processing.png";

/* ─── Greeting ───────────────────────────────────────────────────────────── */
function getGreeting(name) {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return `${g}, ${name} 👋`;
}

/* ─── Module Definitions ─────────────────────────────────────────────────── */
/**
 * status: "live"    → clickable, routes to the page
 * status: "soon"    → shows "Coming Soon" badge, toast on click
 */
const FEATURED = [
    {
        id: "equipment",
        status: "live",                       // ✅ IMPLEMENTED
        emoji: "🚜",
        title: "Equipment Rental",
        subtitle: "Marketplace",
        tag: "Live",
        tagBg: "bg-emerald-100 text-emerald-700",
        desc: "Rent or lend tractors, harvesters, and tools. OLX-style listings filtered by GPS location — contact owners directly with no middlemen.",
        bullets: [
            "Find equipment near your village",
            "List your own gear & earn extra income",
            "Filter by type & location (GPS)",
            "Direct call / chat with owner",
        ],
        cta: "Browse Equipment",
        route: "/equipment",
        image: equipmentImg,
        accent: "from-emerald-600 to-green-700",
        ctaClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    },
    {
        id: "ai-engine",
        status: "live",                       // ✅ IMPLEMENTED
        emoji: "🧠",
        title: "AI Value Engine",
        subtitle: "Crop Intelligence",
        tag: "New",
        tagBg: "bg-violet-100 text-violet-700",
        desc: "Enter your crop & quantity — AI recommends whether to sell raw or process for higher profit, with step-by-step production workflows and market demand insights.",
        bullets: [
            "Sell raw vs. process recommendation",
            "Profit estimation & P&L dashboard",
            "Step-by-step production workflow",
            "Daily expense tracker",
        ],
        cta: "Analyse My Crop",
        route: "/ai-recommendations",
        image: valueImg,
        accent: "from-violet-600 to-purple-700",
        ctaClass: "bg-violet-600 hover:bg-violet-700 shadow-violet-200",
    },
];

const STANDARD = [
    {
        id: "agromarket",
        status: "live",
        emoji: "🛒",
        title: "AgroMarket Platform",
        subtitle: "Direct-to-Consumer Sales",
        tag: "New",
        tagBg: "bg-emerald-100 text-emerald-700",
        desc: "Upload your raw or processed value-added products to the nation-wide AgroMarket. Sell directly to consumers and businesses securely.",
        cta: "Go to AgroMarket",
        route: "/agromarket",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        accent: "from-blue-500 to-cyan-600",
    },
    {
        id: "mandi",
        status: "live",                       // ✅ IMPLEMENTED
        emoji: "📊",
        title: "Mandi Prices",
        subtitle: "Market Intelligence",
        tag: "Live",
        tagBg: "bg-amber-100 text-amber-700",
        desc: "Live mandi prices, crop demand trends, and regional comparisons to help you decide the best time and place to sell.",
        cta: "View Live Prices",
        route: "/mandi-prices",
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80",
        accent: "from-amber-500 to-orange-600",
    },
    {
        id: "agro-exchange",
        status: "live",                       // ✅ IMPLEMENTED
        emoji: "🌿",
        title: "Agro Exchange",
        subtitle: "Pesticide & Input Trading",
        tag: "Live",
        tagBg: "bg-green-100 text-green-700",
        desc: "Exchange pesticides, seeds, fertilizers and farm inputs with other farmers in your area at fair prices.",
        cta: "Go to Exchange",
        route: "/pesticide-exchange",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
        accent: "from-green-500 to-teal-600",
    },
    {
        id: "expert",
        status: "live",
        emoji: "👨‍🏫",
        title: "Expert Advice",
        subtitle: "Book 1-on-1 Consultation",
        tag: "Live",
        tagBg: "bg-indigo-100 text-indigo-700",
        desc: "Book a session with certified agricultural experts for crop diseases, processing strategies, and yield improvement guidance.",
        cta: "Find Experts",
        route: "/experts",
        image: "https://images.unsplash.com/photo-1560415755-bd80d06eda60?auto=format&fit=crop&w=600&q=80",
        accent: "from-indigo-500 to-blue-600",
    },
    {
        id: "labour-market",
        status: "live",
        emoji: "👷",
        title: "Hire Labour",
        subtitle: "Farm Worker Marketplace",
        tag: "Live",
        tagBg: "bg-orange-100 text-orange-700",
        desc: "Find skilled farm labourers for harvesting, sowing, irrigation, and more. Browse by work type & daily rate, or post a job requirement.",
        cta: "Find Labour",
        route: "/labour-market",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
        accent: "from-orange-500 to-amber-500",
        ctaClass: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    },
];

/* ─── Animation helper ───────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: "easeOut" } },
});

/* ─── Coming Soon overlay ────────────────────────────────────────────────── */
const ComingSoonBadge = () => (
    <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur rounded-2xl px-5 py-3 flex items-center gap-2 shadow-xl border border-gray-200">
            <MdLock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 font-bold text-sm">Coming Soon</span>
        </div>
    </div>
);

/* ─── Featured Card ──────────────────────────────────────────────────────── */
const FeaturedCard = ({ mod, index }) => {
    const navigate = useNavigate();
    const isLive = mod.status === "live";

    const handleClick = () => {
        if (isLive) {
            navigate(mod.route);
        } else {
            toast("🔒 AI Value Engine is coming soon! Stay tuned.", { icon: "🧠", duration: 3000 });
        }
    };

    return (
        <motion.div
            {...fadeUp(0.1 + index * 0.15)}
            whileHover={{ y: isLive ? -6 : -2 }}
            onClick={handleClick}
            className={`group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col ${isLive ? "cursor-pointer" : "cursor-default"}`}
        >
            {/* Coming Soon overlay */}
            {!isLive && <ComingSoonBadge />}

            {/* Image section */}
            <div className="relative h-28 sm:h-44 md:h-56 overflow-hidden flex-shrink-0">
                <img
                    src={mod.image}
                    alt={mod.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isLive ? "group-hover:scale-105" : ""}`}
                    loading="lazy"
                />
                {/* Subtle bottom dark fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top-left: status badge | Top-right: emoji */}
                <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex items-start justify-between">
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-sm shadow-sm ${isLive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-orange-100/90 text-orange-700 border border-orange-200"
                        }`}>
                        {isLive ? `✓ ${mod.tag}` : `⏳ ${mod.tag}`}
                    </span>
                    <span className="text-xl sm:text-3xl drop-shadow-lg">{mod.emoji}</span>
                </div>

                {/* Bottom: subtitle + title text */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-5">
                    <p className="text-white/80 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5">{mod.subtitle}</p>
                    <h3 className="text-sm sm:text-xl font-black text-white drop-shadow leading-snug">{mod.title}</h3>
                </div>
            </div>

            {/* Content section */}
            <div className="p-3 sm:p-6 flex flex-col flex-1 space-y-2 sm:space-y-4">
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{mod.desc}</p>

                <ul className="hidden md:block space-y-2 flex-1">
                    {mod.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${mod.accent} flex-shrink-0 flex items-center justify-center ${!isLive ? "opacity-40" : ""}`}>
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={!isLive ? "text-gray-400" : ""}>{b}</span>
                        </li>
                    ))}
                </ul>

                <motion.button
                    whileTap={{ scale: isLive ? 0.97 : 1 }}
                    className={`w-full py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all ${mod.ctaClass}`}
                    disabled={!isLive}
                >
                    {isLive ? (
                        <>{mod.cta} <MdArrowForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" /></>
                    ) : (
                        <><MdLock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {mod.cta}</>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
};

/* ─── Standard Card ──────────────────────────────────────────────────────── */
const StandardCard = ({ mod, index }) => {
    const navigate = useNavigate();
    const isLive = mod.status === "live";

    const handleClick = () => {
        if (isLive) {
            navigate(mod.route);
        } else {
            toast(`🔒 ${mod.title} is coming soon!`, { icon: mod.emoji, duration: 3000 });
        }
    };

    return (
        <motion.div
            {...fadeUp(0.35 + index * 0.12)}
            whileHover={{ y: isLive ? -5 : -2 }}
            onClick={handleClick}
            className={`group relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col ${isLive ? "cursor-pointer" : "cursor-default"}`}
        >
            {/* Coming Soon overlay for standard cards */}
            {!isLive && (
                <div className="absolute inset-0 bg-gray-100/30 rounded-2xl z-10 pointer-events-none flex items-start justify-end p-2 sm:p-3">
                    <span className="bg-orange-50 border border-orange-200 text-orange-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MdLock className="h-3 w-3" /> Soon
                    </span>
                </div>
            )}

            {/* Image strip */}
            <div className="relative h-24 sm:h-36 md:h-40 overflow-hidden flex-shrink-0">
                <img
                    src={mod.image}
                    alt={mod.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isLive ? "group-hover:scale-105" : "grayscale-[15%]"}`}
                    loading="lazy"
                />
                {/* Bottom dark fade only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Top badge */}
                <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow ${isLive
                    ? "bg-emerald-500/90 text-white"
                    : "bg-orange-100/90 text-orange-700 border border-orange-200"
                    }`}>
                    {isLive ? `✓ ${mod.tag}` : `⏳ ${mod.tag}`}
                </span>

                {/* Bottom title + emoji */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3.5 flex items-end justify-between">
                    <div className="min-w-0 pr-1">
                        <p className="text-white/70 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-0 truncate">{mod.subtitle}</p>
                        <h3 className="text-xs sm:text-base font-black text-white drop-shadow leading-tight truncate">{mod.title}</h3>
                    </div>
                    <span className="text-lg sm:text-2xl drop-shadow flex-shrink-0">{mod.emoji}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5 flex flex-col flex-1 gap-2">
                <p className={`text-xs leading-relaxed flex-1 line-clamp-2 sm:line-clamp-none ${isLive ? "text-gray-600" : "text-gray-400"}`}>{mod.desc}</p>
                <button
                    disabled={!isLive}
                    className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${isLive
                        ? `text-white bg-gradient-to-r ${mod.accent} shadow-sm hover:shadow-md`
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                        }`}
                >
                    {isLive
                        ? <>{mod.cta} <MdArrowForward className="h-3.5 w-3.5" /></>
                        : <><MdLock className="h-3.5 w-3.5" /> Coming Soon</>
                    }
                </button>
            </div>
        </motion.div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const FarmerHome = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const firstName = user?.name?.split(" ")[0] || "Farmer";
    const isVerified = ["verified", "partial"].includes(user?.verificationStatus);

    // Redirect non-farmers to their dedicated dashboards
    if (user?.role === "expert") return <Navigate to="/expert-dashboard" replace />;
    if (user?.role === "user") return <Navigate to="/user-dashboard" replace />;

    const liveCount = [...FEATURED, ...STANDARD].filter(m => m.status === "live").length;
    const soonCount = [...FEATURED, ...STANDARD].filter(m => m.status === "soon").length;

    return (
        <div className="min-h-screen bg-gray-50 pt-16">

            {/* ══════════════════════════════════════
                HERO HEADER
            ══════════════════════════════════════ */}
            <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600">
                {/* pattern */}
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-10 md:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

                        {/* Greeting */}
                        <motion.div {...fadeUp(0)}>
                            <p className="text-green-200/80 text-xs font-semibold tracking-widest uppercase mb-2">
                                {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black text-white font-display">
                                {getGreeting(firstName)}
                            </h1>
                            <p className="text-green-100/80 text-base mt-1.5 flex items-center gap-3 flex-wrap">
                                Select a module to get started 🌱
                                <span className="text-xs bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                                    {liveCount} Live · {soonCount} Coming Soon
                                </span>
                            </p>
                        </motion.div>

                        {/* Farmer Info Card */}
                        <motion.div
                            {...fadeUp(0.15)}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 self-start sm:self-auto"
                        >
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <GiFarmer className="text-white h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">{user?.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-green-200 text-xs capitalize px-2 py-0.5 bg-white/10 rounded-full">{user?.role}</span>
                                    {isVerified ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-200 font-semibold">
                                            <MdVerified className="h-3.5 w-3.5" /> Verified
                                        </span>
                                    ) : user?.verificationStatus === "pending_admin" ? (
                                        <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
                                            <MdSchedule className="h-3.5 w-3.5" /> Pending
                                        </span>
                                    ) : null}
                                </div>
                                {user?.village && (
                                    <p className="text-green-300/70 text-xs mt-1">📍 {user.village}{user?.state ? `, ${user.state}` : ""}</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick stats */}
                    <motion.div {...fadeUp(0.25)} className="flex flex-wrap gap-3 mt-8">
                        {[
                            { v: "18,000+", l: "Verified Farmers", e: "🌾" },
                            { v: "2,400+", l: "Equipment Listed", e: "🚜" },
                            { v: "4.8 ★", l: "Average Rating", e: "⭐" },
                            { v: "320+", l: "Villages Covered", e: "📍" },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-white">
                                <span className="text-sm">{s.e}</span>
                                <span className="font-black text-sm">{s.v}</span>
                                <span className="text-white/60 text-xs">{s.l}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                MODULE GRID
            ══════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-10">

                {/* ── Featured row label ── */}
                <motion.div {...fadeUp(0.05)} className="flex items-center gap-4">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">⭐ Featured Modules</span>
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-green-600 text-xs font-bold">Start Here</span>
                </motion.div>

                {/* ── 2 FEATURED CARDS IN 2-COLUMN GRID ON MOBILE ── */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-7">
                    {FEATURED.map((mod, i) => <FeaturedCard key={mod.id} mod={mod} index={i} />)}
                </div>

                {/* ── 8 STANDARD CARDS IN 2-COLUMN GRID ON MOBILE, 4-COLUMN ON DESKTOP ── */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {STANDARD.map((mod, i) => <StandardCard key={mod.id} mod={mod} index={i} />)}
                </div>

                {/* ── Dashboard CTA strip ── */}
                <motion.div
                    {...fadeUp(0.5)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-green-200"
                >
                    <div className="text-center md:text-left">
                        <p className="text-white font-black text-xl">View your activity & reports</p>
                        <p className="text-green-100 text-sm mt-1">
                            Your Dashboard shows bookings, orders, verification status and AI reports.
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/dashboard")}
                        className="flex-shrink-0 bg-white text-green-700 font-black px-7 py-3.5 rounded-2xl hover:bg-green-50 transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        Go to Dashboard <MdArrowForward className="h-5 w-5" />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default FarmerHome;
