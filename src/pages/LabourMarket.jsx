import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
    MdPhone, MdLocationOn, MdStar, MdCheckCircle, MdCancel,
    MdDelete, MdAdd, MdSearch, MdPeople, MdWork
} from "react-icons/md";
import { FaHardHat } from "react-icons/fa";
import { format } from "date-fns";

// ─── Constants ─────────────────────────────────────────────────────────────────
const WORK_CATEGORIES = [
    "All", "Crop Harvesting", "Crop Sowing / Planting", "Irrigation & Watering",
    "Land Preparation / Ploughing", "Weeding & Crop Care", "Pesticide / Fertilizer Application",
    "Fruit Picking", "Vegetable Picking", "Post-Harvest Processing",
    "Equipment Operation", "Livestock Care", "General Farm Labour"
];

const SKILL_TAGS = [
    "Tractor Driving", "Irrigation", "Harvesting", "Planting", "Weeding",
    "Spraying", "Animal Care", "Fruit Picking", "Packing", "General Labour"
];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: "easeOut" } },
});

// ─── Labour Card ───────────────────────────────────────────────────────────────
const LabourCard = ({ labour, onContact, onHire }) => (
    <motion.div
        {...fadeUp(0)}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden"
    >
        <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 w-full" />
        <div className="p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow">
                        👷
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{labour.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MdLocationOn className="h-3 w-3" />
                            {labour.village || labour.preferredLocation || "Location not set"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {labour.isAvailable !== false ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Available
                        </span>
                    ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">Unavailable</span>
                    )}
                </div>
            </div>

            {/* Work Category & Rate */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-wide">Work Type</p>
                    <p className="font-black text-gray-900 text-sm mt-0.5 leading-tight">{labour.workCategory}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <p className="text-xs text-green-500 font-bold uppercase tracking-wide">Daily Rate</p>
                    <p className="font-black text-green-700 text-sm mt-0.5">₹{labour.dailyRate}/day</p>
                </div>
            </div>

            {/* Experience & Bio */}
            {labour.experience && (
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <MdWork className="h-3.5 w-3.5 text-gray-400" />
                    {labour.experience}
                </p>
            )}
            {labour.bio && (
                <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">{labour.bio}</p>
            )}

            {/* Skills */}
            {labour.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {labour.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                    {labour.skills.length > 4 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">+{labour.skills.length - 4}</span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onHire(labour)}
                    disabled={labour.isAvailable === false}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-md ${labour.isAvailable !== false
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <FaHardHat className="h-3.5 w-3.5" />
                    {labour.isAvailable !== false ? "Hire Now" : "Unavailable"}
                </motion.button>
                {labour.phone && (
                    <a
                        href={`tel:${labour.phone}`}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-green-400 hover:text-green-700 transition flex items-center gap-1"
                    >
                        <MdPhone className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    </motion.div>
);

// ─── Seek Post Card ─────────────────────────────────────────────────────────────
const SeekPostCard = ({ post, onContact, onHire }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-orange-200 transition-all"
    >
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        <div className="p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">👷</div>
                    <div>
                        <p className="font-bold text-gray-900">{post.labourName}</p>
                        <p className="text-xs text-gray-400">📍 {post.labourVillage || "Location N/A"}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-green-700 text-sm">₹{post.dailyRate}/day</span>
                    {post.urgency === "urgent" && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">🔴 Urgent</span>}
                    {post.urgency === "soon" && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">🟡 Soon</span>}
                </div>
            </div>

            <h4 className="font-bold text-gray-900 mb-1">{post.jobTitle}</h4>
            {post.description && <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">{post.description}</p>}

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                {post.duration && <span className="flex items-center gap-1">⏱ {post.duration}</span>}
                {post.availability && <span className="flex items-center gap-1">📅 {post.availability}</span>}
            </div>

            {post.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {post.skills.map(s => (
                        <span key={s} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium border border-orange-100">{s}</span>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onHire({ labourId: post.labourId, name: post.labourName, phone: post.labourPhone, village: post.labourVillage, workCategory: post.workCategory || post.jobTitle, dailyRate: post.dailyRate })}
                    className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition shadow-md shadow-orange-200"
                >
                    Hire This Labour 👷
                </motion.button>
                {post.labourPhone && (
                    <a href={`tel:${post.labourPhone}`}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-green-400 hover:text-green-700 transition flex items-center">
                        <MdPhone className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    </motion.div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
    { id: "browse",    label: "Browse Labourers", icon: "👷" },
    { id: "seek-posts", label: "Labour Requests",  icon: "📋" },
    { id: "post-job",  label: "Post a Job",       icon: "➕" },
    { id: "my-jobs",   label: "My Posted Jobs",   icon: "📁" },
];

const LabourMarket = () => {
    const { user, authUser } = useAuthStore();
    const [tab, setTab] = useState("browse");
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    // Data
    const [labourers, setLabourers] = useState([]);
    const [seekPosts, setSeekPosts] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);

    // Job form
    const [jobForm, setJobForm] = useState({
        title: "", workCategory: WORK_CATEGORIES[1], description: "",
        wagePerDay: "", duration: "", workersNeeded: "1",
        location: "", skillsRequired: [], urgency: "normal",
    });
    const [postingJob, setPostingJob] = useState(false);

    // Hire confirmation modal state
    const [hireTarget, setHireTarget] = useState(null);
    const [hireMessage, setHireMessage] = useState("");

    // ── Firebase listeners ──────────────────────────────────────────────────
    useEffect(() => {
        if (!authUser) return;

        // All labour profiles
        const lUnsub = onValue(ref(db, "labourProfiles"), snap => {
            if (snap.exists()) {
                setLabourers(Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })));
            } else setLabourers([]);
        });

        // Labour seek posts
        const sUnsub = onValue(ref(db, "labourSeekJobs"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setSeekPosts(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(p => p.status !== "closed")
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            } else setSeekPosts([]);
        });

        // My job postings
        const jUnsub = onValue(ref(db, "farmerJobPostings"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setMyJobs(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(j => j.farmerId === authUser.uid)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            } else setMyJobs([]);
        });

        // Applications to my jobs
        const aUnsub = onValue(ref(db, "jobApplications"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setJobApplications(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(a => a.farmerId === authUser.uid)
                );
            } else setJobApplications([]);
        });

        return () => { lUnsub(); sUnsub(); jUnsub(); aUnsub(); };
    }, [authUser]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleHireLabour = async () => {
        if (!hireTarget) return;
        try {
            // Create a direct hire job posting
            const jobRef = push(ref(db, "farmerJobPostings"));
            await set(jobRef, {
                title: `Direct Hire — ${hireTarget.workCategory}`,
                workCategory: hireTarget.workCategory,
                description: hireMessage || `Direct hire request from ${user?.name}`,
                wagePerDay: hireTarget.dailyRate || "",
                duration: "As agreed",
                workersNeeded: 1,
                location: user?.village || "",
                skillsRequired: [],
                farmerId: authUser.uid,
                farmerName: user?.name,
                farmerPhone: user?.phone,
                assignedLabourId: hireTarget.labourId || hireTarget.id,
                assignedLabourName: hireTarget.name,
                urgency: "soon",
                status: "open",
                createdAt: new Date().toISOString(),
            });

            // Notify the labour
            await push(ref(db, `notifications/${hireTarget.labourId || hireTarget.id}`), {
                type: "hire_offer",
                message: `Farmer ${user?.name} wants to hire you for ${hireTarget.workCategory}! Check Job Offers in your dashboard.`,
                createdAt: new Date().toISOString(),
                read: false,
            });

            toast.success("Hire request sent to labour! They will be notified. 🤝");
            setHireTarget(null);
            setHireMessage("");
        } catch { toast.error("Could not send hire request."); }
    };

    const handleAppStatus = async (appId, status, app) => {
        try {
            await set(ref(db, `jobApplications/${appId}/status`), status);
            await push(ref(db, `notifications/${app.labourId}`), {
                type: status === "accepted" ? "application_accepted" : "application_rejected",
                message: status === "accepted"
                    ? `✅ Your application for "${app.workCategory || 'Farm Job'}" was ACCEPTED by Farmer ${user?.name}!`
                    : `❌ Your application for "${app.workCategory || 'Farm Job'}" was declined by Farmer ${user?.name}.`,
                createdAt: new Date().toISOString(),
                read: false,
            });
            toast.success(`Application marked as ${status}!`);
        } catch {
            toast.error("Could not update status.");
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        if (!jobForm.title || !jobForm.wagePerDay) {
            toast.error("Please fill job title and wage.");
            return;
        }
        setPostingJob(true);
        try {
            await push(ref(db, "farmerJobPostings"), {
                ...jobForm,
                farmerId: authUser.uid, farmerName: user?.name,
                farmerPhone: user?.phone, farmerVillage: user?.village,
                status: "open", createdAt: new Date().toISOString(),
            });
            toast.success("Job posted! Labourers can now apply. 🌾");
            setJobForm({
                title: "", workCategory: WORK_CATEGORIES[1], description: "",
                wagePerDay: "", duration: "", workersNeeded: "1",
                location: "", skillsRequired: [], urgency: "normal",
            });
            setTab("my-jobs");
        } catch { toast.error("Could not post job. Try again."); }
        finally { setPostingJob(false); }
    };

    const handleApplicationAction = async (appId, labourId, status, jobTitle) => {
        await set(ref(db, `jobApplications/${appId}/status`), status);
        await push(ref(db, `notifications/${labourId}`), {
            type: status === "accepted" ? "application_accepted" : "application_rejected",
            message: status === "accepted"
                ? `Great news! Your application for "${jobTitle}" has been accepted by ${user?.name}. 🎉`
                : `Your application for "${jobTitle}" was not accepted this time. Keep applying!`,
            createdAt: new Date().toISOString(), read: false,
        });
        toast.success(status === "accepted" ? "Labour application accepted! ✅" : "Application declined.");
    };

    const toggleSkillRequired = (skill) => {
        setJobForm(prev => {
            const skills = prev.skillsRequired || [];
            return {
                ...prev,
                skillsRequired: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill],
            };
        });
    };

    // Filter labourers
    const filteredLabourers = labourers.filter(l => {
        const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase())
            || l.workCategory?.toLowerCase().includes(search.toLowerCase())
            || l.preferredLocation?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === "All" || l.workCategory === filterCategory;
        return matchSearch && matchCategory;
    });

    const filteredSeekPosts = seekPosts.filter(p => {
        const matchSearch = !search || p.labourName?.toLowerCase().includes(search.toLowerCase())
            || p.jobTitle?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === "All" || p.workCategory === filterCategory || p.jobTitle === filterCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* ── Hero ── */}
            <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-amber-700 via-orange-600 to-orange-500">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-10">
                    <motion.div {...fadeUp(0)}>
                        <p className="text-orange-200/80 text-xs font-semibold tracking-widest uppercase mb-2">Labour Market</p>
                        <h1 className="text-3xl md:text-4xl font-black text-white font-display">
                            Hire Farm Labour 👷
                        </h1>
                        <p className="text-orange-100/80 text-base mt-1.5">
                            Browse skilled labourers, view their daily rates & roles, or post a job requirement
                        </p>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-3 mt-6">
                        {[
                            { v: `${labourers.filter(l => l.isAvailable !== false).length}`, l: "Available Now", e: "👷" },
                            { v: `${seekPosts.length}`, l: "Job Requests", e: "📋" },
                            { v: `${myJobs.length}`, l: "My Posted Jobs", e: "📁" },
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 md:py-8">
                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-1.5 overflow-x-auto scrollbar-none flex gap-1.5">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${tab === t.id ? "bg-orange-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 bg-gray-50/50"}`}
                        >
                            <span>{t.icon}</span> <span>{t.label}</span>
                            {t.id === "my-jobs" && myJobs.length > 0 && (
                                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${tab === t.id ? "bg-white text-orange-600" : "bg-orange-500 text-white"}`}>{myJobs.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + Filter Bar (for browse tabs) */}
                {(tab === "browse" || tab === "seek-posts") && (
                    <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder={tab === "browse" ? "Search by name, work type, location…" : "Search labour requests…"}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="input-field sm:w-64"
                        >
                            {WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                        {/* ─ BROWSE LABOURERS ─ */}
                        {tab === "browse" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-500 font-semibold">
                                        {filteredLabourers.length} labourers found
                                        {filterCategory !== "All" && ` in "${filterCategory}"`}
                                    </p>
                                </div>

                                {filteredLabourers.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                        <span className="text-6xl block mb-4">👷</span>
                                        <p className="text-gray-500 font-semibold text-lg">No labourers found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try a different search or category filter.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {filteredLabourers.map(labour => (
                                            <LabourCard
                                                key={labour.id}
                                                labour={labour}
                                                onHire={setHireTarget}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─ SEEK POSTS (Labour Job Requests) ─ */}
                        {tab === "seek-posts" && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-500 font-semibold">{filteredSeekPosts.length} labour requests</p>
                                </div>

                                {filteredSeekPosts.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                        <span className="text-6xl block mb-4">📋</span>
                                        <p className="text-gray-500 font-semibold text-lg">No labour requests yet</p>
                                        <p className="text-gray-400 text-sm mt-1">Labourers posting job requests will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {filteredSeekPosts.map(post => (
                                            <SeekPostCard key={post.id} post={post} onHire={setHireTarget} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─ POST JOB ─ */}
                        {tab === "post-job" && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Post a Labour Job 🌾</h2>
                                <p className="text-gray-500 text-sm mb-6">Describe what work you need. Labourers will see this and can apply.</p>

                                <form onSubmit={handlePostJob} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Job Title *</label>
                                            <input required placeholder="e.g. Need harvesting workers for wheat" type="text"
                                                value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
                                                className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label">Work Category *</label>
                                            <select value={jobForm.workCategory} onChange={e => setJobForm(p => ({ ...p, workCategory: e.target.value }))} className="input-field">
                                                {WORK_CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Detailed Description *</label>
                                        <textarea required rows={4}
                                            placeholder="Describe the work in detail — crops, area size, what tools are needed, working conditions, etc."
                                            value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                                            className="input-field" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Wage per Day (₹) *</label>
                                            <input required type="number" min="0" placeholder="e.g. 500"
                                                value={jobForm.wagePerDay} onChange={e => setJobForm(p => ({ ...p, wagePerDay: e.target.value }))}
                                                className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label">Duration</label>
                                            <input type="text" placeholder="e.g. 5 days, 1 month"
                                                value={jobForm.duration} onChange={e => setJobForm(p => ({ ...p, duration: e.target.value }))}
                                                className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label">Workers Needed</label>
                                            <input type="number" min="1" max="100" placeholder="1"
                                                value={jobForm.workersNeeded} onChange={e => setJobForm(p => ({ ...p, workersNeeded: e.target.value }))}
                                                className="input-field" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Location</label>
                                        <input type="text" placeholder={user?.village || "e.g. Shirur, Pune"}
                                            value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))}
                                            className="input-field" />
                                    </div>

                                    <div>
                                        <label className="label">Skills Required</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {SKILL_TAGS.map(skill => (
                                                <button key={skill} type="button"
                                                    onClick={() => toggleSkillRequired(skill)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${(jobForm.skillsRequired || []).includes(skill) ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Urgency</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { v: "normal", l: "Normal", d: "Within a week" },
                                                { v: "soon",   l: "Soon",   d: "2–3 days" },
                                                { v: "urgent", l: "Urgent", d: "Today / Tomorrow" },
                                            ].map(opt => (
                                                <button key={opt.v} type="button"
                                                    onClick={() => setJobForm(p => ({ ...p, urgency: opt.v }))}
                                                    className={`p-3 rounded-xl border-2 text-center transition-all ${jobForm.urgency === opt.v ? "border-orange-500 bg-orange-50 text-orange-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                                    <div className="font-bold text-sm">{opt.l}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{opt.d}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={postingJob}
                                        className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${postingJob ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5"}`}>
                                        {postingJob ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Posting…
                                            </span>
                                        ) : "Post Job — Find Labour 🌾"}
                                    </motion.button>
                                </form>
                            </div>
                        )}

                        {/* ─ MY POSTED JOBS ─ */}
                        {tab === "my-jobs" && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">My Posted Jobs ({myJobs.length})</h2>
                                    <button onClick={() => setTab("post-job")}
                                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-md">
                                        <MdAdd className="h-4 w-4" /> Post New
                                    </button>
                                </div>

                                {myJobs.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                        <span className="text-6xl block mb-4">📁</span>
                                        <p className="text-gray-500 font-semibold text-lg">No jobs posted yet</p>
                                        <button onClick={() => setTab("post-job")} className="btn-primary mt-4">Post Your First Job</button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {myJobs.map(job => {
                                            const apps = jobApplications.filter(a => a.jobId === job.id);
                                            return (
                                                <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />
                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900">{job.title}</h3>
                                                                <p className="text-sm text-gray-500 mt-0.5">
                                                                    📍 {job.location || "—"} · ₹{job.wagePerDay}/day · {job.duration || "—"} · {job.workersNeeded || 1} worker(s)
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                                    {job.status === "open" ? "✓ Open" : "Closed"}
                                                                </span>
                                                                <button onClick={async () => { if (confirm("Delete this job?")) await remove(ref(db, `farmerJobPostings/${job.id}`)); }}
                                                                    className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition">
                                                                    <MdDelete className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Applications */}
                                                        {apps.length > 0 ? (
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                                    <MdPeople className="h-4 w-4 text-orange-500" />
                                                                    {apps.length} Applicant(s)
                                                                </p>
                                                                <div className="space-y-3">
                                                                    {apps.map(app => (
                                                                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-lg">👷</div>
                                                                                <div>
                                                                                    <p className="font-bold text-sm text-gray-900">{app.labourName}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {app.workCategory} · ₹{app.dailyRate}/day
                                                                                        {app.labourVillage && ` · 📍 ${app.labourVillage}`}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {app.status === "pending" ? (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => handleAppStatus(app.id, "accepted", app)}
                                                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition">
                                                                                            <MdCheckCircle className="h-3.5 w-3.5" /> Accept
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleAppStatus(app.id, "rejected", app)}
                                                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition">
                                                                                            <MdCancel className="h-3.5 w-3.5" /> Decline
                                                                                        </button>
                                                                                        {app.labourPhone && (
                                                                                            <a href={`tel:${app.labourPhone}`}
                                                                                                className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition">
                                                                                                <MdPhone className="h-3.5 w-3.5" />
                                                                                            </a>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                                                        {app.status === "accepted" ? "✅ Accepted" : "❌ Declined"}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-xl">
                                                                No applications yet. Labourers will apply here.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Hire Confirmation Modal ── */}
            <AnimatePresence>
                {hireTarget && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                        onClick={e => e.target === e.currentTarget && setHireTarget(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">👷</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Hire {hireTarget.name}</h3>
                                    <p className="text-sm text-gray-500">{hireTarget.workCategory} · ₹{hireTarget.dailyRate}/day</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="label">Message to Labour (optional)</label>
                                <textarea rows={3} placeholder="Tell them what work you need, location, start date, etc."
                                    value={hireMessage} onChange={e => setHireMessage(e.target.value)}
                                    className="input-field" />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => { setHireTarget(null); setHireMessage(""); }}
                                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition">
                                    Cancel
                                </button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={handleHireLabour}
                                    className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                                    Send Hire Request 🤝
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabourMarket;
