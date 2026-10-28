import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
    MdPhone, MdMic, MdStop, MdEdit, MdDelete, MdClose
} from "react-icons/md";
import { FaHardHat } from "react-icons/fa";
import { format } from "date-fns";

// ─── Constants ─────────────────────────────────────────────────────────────────
const WORK_CATEGORIES = [
    "Crop Harvesting", "Crop Sowing / Planting", "Irrigation & Watering",
    "Land Preparation / Ploughing", "Weeding & Crop Care", "Pesticide / Fertilizer Application",
    "Fruit Picking", "Vegetable Picking", "Post-Harvest Processing",
    "Equipment Operation", "Livestock Care", "General Farm Labour", "Other"
];

const SKILL_TAGS = [
    "Tractor Driving", "Irrigation", "Harvesting", "Planting", "Weeding",
    "Spraying", "Animal Care", "Fruit Picking", "Packing", "General Labour"
];

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

// ─── Work Category Mapper ──────────────────────────────────────────────────────
function matchWorkCategory(rawTitle) {
    if (!rawTitle) return WORK_CATEGORIES[0];
    const lower = rawTitle.toLowerCase();
    const exactOrPartial = WORK_CATEGORIES.find(c =>
        c.toLowerCase() === lower || c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())
    );
    if (exactOrPartial) return exactOrPartial;

    // Multilingual & keyword fallback mapping
    if (lower.includes("harvest") || lower.includes("कटाई") || lower.includes("कापणी")) return "Crop Harvesting";
    if (lower.includes("sow") || lower.includes("plant") || lower.includes("बुआई") || lower.includes("पेरणी") || lower.includes("रोप")) return "Crop Sowing / Planting";
    if (lower.includes("water") || lower.includes("irrigat") || lower.includes("सिंचाई") || lower.includes("पाणी")) return "Irrigation & Watering";
    if (lower.includes("plough") || lower.includes("land") || lower.includes("जुताई") || lower.includes("नांगरणी") || lower.includes("खेत")) return "Land Preparation / Ploughing";
    if (lower.includes("weed") || lower.includes("निंदाई") || lower.includes("खुरपणी") || lower.includes("कचरा")) return "Weeding & Crop Care";
    if (lower.includes("spray") || lower.includes("pesticide") || lower.includes("fertilizer") || lower.includes("छिड़काव") || lower.includes("फवारणी") || lower.includes("खाद")) return "Pesticide / Fertilizer Application";
    if (lower.includes("fruit") || lower.includes("फल")) return "Fruit Picking";
    if (lower.includes("veg") || lower.includes("सब्जी") || lower.includes("भाजी")) return "Vegetable Picking";
    if (lower.includes("tractor") || lower.includes("machine") || lower.includes("drive") || lower.includes("चालक") || lower.includes("ड्राइवर")) return "Equipment Operation";
    if (lower.includes("animal") || lower.includes("livestock") || lower.includes("पशु") || lower.includes("गाय") || lower.includes("भैंस")) return "Livestock Care";
    return "General Farm Labour";
}

// ─── Voice Agent Hook ─────────────────────────────────────────────────────────
function useVoiceAgent({ onResult }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
            const recorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setIsProcessing(true);
                try {
                    const blob = new Blob(audioChunksRef.current, { type: mimeType });
                    const formData = new FormData();
                    formData.append("file", blob, mimeType === "audio/webm" ? "audio.webm" : "audio.mp4");
                    formData.append("model", "whisper-large-v3");
                    formData.append("response_format", "json");

                    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
                        body: formData,
                    });
                    const whisperData = await whisperRes.json();
                    const spokenText = whisperData.text || "";
                    setTranscript(spokenText);

                    if (!spokenText.trim()) {
                        toast.error("No speech detected. Please try again.");
                        return;
                    }

                    // Try models in fallback order
                    const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"];
                    let chatData = null;

                    for (const model of modelsToTry) {
                        try {
                            const chatRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${GROQ_API_KEY}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    model: model,
                                    messages: [
                                        {
                                            role: "system",
                                            content: `You extract structured data from a farm labourer's spoken description about seeking farm work.
The user may speak in ANY language (Hindi, Marathi, Punjabi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, English, Hinglish, etc.).
Translate the user's details into English if spoken in another language, and extract these fields:
{
  "jobTitle": "specific work role (from: Crop Harvesting, Crop Sowing / Planting, Irrigation & Watering, Land Preparation / Ploughing, Weeding & Crop Care, Pesticide / Fertilizer Application, Fruit Picking, Vegetable Picking, Post-Harvest Processing, Equipment Operation, Livestock Care, General Farm Labour)",
  "description": "detailed description of work they want in English",
  "dailyRate": number or null,
  "duration": "availability duration like 7 days, 1 month, etc.",
  "skills": ["array of skills in English e.g. Tractor Driving, Harvesting, Irrigation, Weeding, Spraying"],
  "location": "preferred location if mentioned",
  "availability": "when they are available e.g. Immediately, From Monday"
}
Return ONLY valid JSON (no markdown formatting, no explanation).`
                                        },
                                        { role: "user", content: spokenText }
                                    ],
                                    temperature: 0.1,
                                    max_tokens: 400,
                                }),
                            });
                            if (chatRes.ok) {
                                chatData = await chatRes.json();
                                break;
                            }
                        } catch (e) {
                            console.warn(`Groq model ${model} failed:`, e);
                        }
                    }

                    const raw = chatData?.choices?.[0]?.message?.content || "{}";
                    let parsed = {};
                    try {
                        const match = raw.match(/\{[\s\S]*\}/);
                        parsed = match ? JSON.parse(match[0]) : {};
                    } catch { parsed = {}; }

                    onResult({ transcript: spokenText, fields: parsed });
                    toast.success("Voice understood! Form filled automatically. 🎙️");
                } catch (err) {
                    console.error("Voice agent error:", err);
                    toast.error("Voice processing failed. Please type manually.");
                } finally {
                    setIsProcessing(false);
                }
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            toast("🎙️ Listening… speak your job details, then press Stop.", { duration: 4000 });
        } catch {
            toast.error("Microphone access denied. Please allow microphone permissions.");
        }
    }, [onResult]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    return { isRecording, isProcessing, transcript, startRecording, stopRecording, setTranscript };
}

// ─── Animated Stat Card ────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
    <motion.div whileHover={{ y: -4 }} className={`rounded-2xl p-5 flex flex-col gap-2 ${color}`}>
        <div className="text-2xl">{icon}</div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs font-semibold opacity-70">{label}</p>
    </motion.div>
);

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "overview",   label: "Overview",    icon: "📊" },
    { id: "profile",    label: "My Profile",  icon: "👤" },
    { id: "seek-job",   label: "Seek Jobs",   icon: "🔍" },
    { id: "job-offers", label: "Job Offers",  icon: "📋" },
    { id: "notifs",     label: "Notifications", icon: "🔔" },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const LabourDashboard = () => {
    const { user, authUser } = useAuthStore();
    const [tab, setTab] = useState("overview");

    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState({
        workCategory: WORK_CATEGORIES[0], bio: "", dailyRate: "",
        skills: [], experience: "", preferredLocation: "", isAvailable: true,
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    const [mySeekPosts, setMySeekPosts] = useState([]);
    const [seekForm, setSeekForm] = useState({
        jobTitle: "", description: "", dailyRate: "", duration: "",
        skills: [], preferredLocation: "", availability: "", urgency: "normal",
    });
    const [postingSeek, setPostingSeek] = useState(false);

    const [farmerJobs, setFarmerJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.read).length;

    const [voiceTranscript, setVoiceTranscript] = useState("");

    // ── Firebase listeners ──────────────────────────────────────────────────
    useEffect(() => {
        if (!authUser) return;

        const pUnsub = onValue(ref(db, `labourProfiles/${authUser.uid}`), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setProfile(data);
                setProfileForm(prev => ({ ...prev, ...data }));
            } else {
                setEditingProfile(true);
            }
        });

        const sUnsub = onValue(ref(db, "labourSeekJobs"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setMySeekPosts(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(p => p.labourId === authUser.uid)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            } else setMySeekPosts([]);
        });

        const fUnsub = onValue(ref(db, "farmerJobPostings"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setFarmerJobs(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(j => j.status !== "closed")
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            } else setFarmerJobs([]);
        });

        const aUnsub = onValue(ref(db, "jobApplications"), snap => {
            if (snap.exists()) {
                const data = snap.val();
                setMyApplications(
                    Object.keys(data).map(k => ({ id: k, ...data[k] }))
                        .filter(a => a.labourId === authUser.uid)
                );
            } else setMyApplications([]);
        });

        const nUnsub = onValue(ref(db, `notifications/${authUser.uid}`), snap => {
            if (snap.exists()) {
                const items = Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] }));
                setNotifications(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } else setNotifications([]);
        });

        return () => { pUnsub(); sUnsub(); fUnsub(); aUnsub(); nUnsub(); };
    }, [authUser]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileForm.workCategory || !profileForm.dailyRate) {
            toast.error("Please fill work category and daily rate.");
            return;
        }
        setSavingProfile(true);
        try {
            await set(ref(db, `labourProfiles/${authUser.uid}`), {
                ...profileForm,
                name: user?.name, phone: user?.phone,
                village: user?.village, state: user?.state,
                labourId: authUser.uid, rating: profile?.rating || null,
                updatedAt: new Date().toISOString(),
            });
            setEditingProfile(false);
            toast.success("Profile saved! Farmers can now find you. 👷");
        } catch { toast.error("Could not save profile. Try again."); }
        finally { setSavingProfile(false); }
    };

    const toggleSkill = (skill, setter) => {
        setter(prev => {
            const skills = prev.skills || [];
            return {
                ...prev,
                skills: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill],
            };
        });
    };

    const handleVoiceResult = useCallback(({ transcript, fields }) => {
        setVoiceTranscript(transcript);
        const mappedRole = matchWorkCategory(fields.jobTitle || fields.workCategory);
        setSeekForm(prev => ({
            ...prev,
            jobTitle:          mappedRole               || prev.jobTitle,
            description:       fields.description       || prev.description,
            dailyRate:         fields.dailyRate != null  ? String(fields.dailyRate) : prev.dailyRate,
            duration:          fields.duration          || prev.duration,
            skills:            fields.skills?.length    ? fields.skills : prev.skills,
            preferredLocation: fields.location          || prev.preferredLocation,
            availability:      fields.availability      || prev.availability,
        }));
    }, []);

    const voiceAgent = useVoiceAgent({ onResult: handleVoiceResult });

    const handlePostSeekJob = async (e) => {
        e.preventDefault();
        if (!seekForm.jobTitle || !seekForm.dailyRate) {
            toast.error("Please fill job title and expected daily rate.");
            return;
        }
        setPostingSeek(true);
        try {
            await push(ref(db, "labourSeekJobs"), {
                ...seekForm,
                labourId: authUser.uid, labourName: user?.name,
                labourPhone: user?.phone, labourVillage: user?.village,
                workCategory: profile?.workCategory || seekForm.jobTitle,
                status: "open", createdAt: new Date().toISOString(),
            });
            toast.success("Seek post published! Farmers will see your request. 🌾");
            setSeekForm({ jobTitle: "", description: "", dailyRate: "", duration: "", skills: [], preferredLocation: "", availability: "", urgency: "normal" });
            setVoiceTranscript("");
        } catch { toast.error("Could not post. Try again."); }
        finally { setPostingSeek(false); }
    };

    const handleApply = async (job) => {
        if (myApplications.some(a => a.jobId === job.id)) { toast("Already applied to this job."); return; }
        try {
            await push(ref(db, "jobApplications"), {
                jobId: job.id, farmerId: job.farmerId,
                labourId: authUser.uid, labourName: user?.name,
                labourPhone: user?.phone, labourVillage: user?.village,
                workCategory: profile?.workCategory || "General Labour",
                dailyRate: profile?.dailyRate || seekForm.dailyRate || "",
                status: "pending", appliedAt: new Date().toISOString(),
            });
            await push(ref(db, `notifications/${job.farmerId}`), {
                type: "labour_application",
                message: `${user?.name} applied for your job: "${job.title}" 👷`,
                createdAt: new Date().toISOString(), read: false,
            });
            toast.success("Application sent to farmer! 🙌");
        } catch { toast.error("Could not apply. Try again."); }
    };

    const handleAcceptHireOffer = async (job) => {
        try {
            await set(ref(db, `farmerJobPostings/${job.id}/status`), "accepted");
            await set(ref(db, `farmerJobPostings/${job.id}/assignedLabourStatus`), "accepted");
            await push(ref(db, `notifications/${job.farmerId}`), {
                type: "hire_accepted",
                message: `🎉 Labourer ${user?.name || "Labourer"} ACCEPTED your hire offer for "${job.title}"!`,
                createdAt: new Date().toISOString(),
                read: false,
            });
            toast.success("Hire offer accepted! 🎉 Farmer notified.");
        } catch {
            toast.error("Could not accept hire offer.");
        }
    };

    const handleDeclineHireOffer = async (job) => {
        try {
            await set(ref(db, `farmerJobPostings/${job.id}/status`), "declined");
            await set(ref(db, `farmerJobPostings/${job.id}/assignedLabourStatus`), "declined");
            await push(ref(db, `notifications/${job.farmerId}`), {
                type: "hire_declined",
                message: `❌ Labourer ${user?.name || "Labourer"} declined your hire offer for "${job.title}".`,
                createdAt: new Date().toISOString(),
                read: false,
            });
            toast.success("Hire offer declined.");
        } catch {
            toast.error("Could not decline hire offer.");
        }
    };

    const markAllRead = async () => {
        for (const n of notifications.filter(n => !n.read)) {
            await set(ref(db, `notifications/${authUser.uid}/${n.id}/read`), true);
        }
    };

    const completedJobs  = myApplications.filter(a => a.status === "accepted").length;
    const pendingApps    = myApplications.filter(a => a.status === "pending").length;

    return (
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
            {/* ── Hero ── */}
            <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="text-orange-200/80 text-xs font-semibold tracking-widest uppercase mb-2">Labour Dashboard</p>
                            <h1 className="text-3xl md:text-4xl font-black text-white font-display">
                                Welcome, {user?.name?.split(" ")[0]}! 👷
                            </h1>
                            <p className="text-orange-100/80 text-base mt-1.5">Manage your work profile, seek jobs &amp; get hired by farmers</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.15 } }}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4"
                        >
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaHardHat className="text-white h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">{user?.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-orange-200 text-xs capitalize px-2 py-0.5 bg-white/10 rounded-full">
                                        {profile?.workCategory || "Farm Labour"}
                                    </span>
                                    {profile?.isAvailable !== false ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-200 font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Available
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-300 font-semibold">Unavailable</span>
                                    )}
                                </div>
                                {profile?.dailyRate && <p className="text-orange-300/80 text-xs mt-1">₹{profile.dailyRate}/day</p>}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-20 md:py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── Sidebar ── */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg">👷</div>
                            <p className="font-bold text-gray-900">{user?.name}</p>
                            <p className="text-sm text-gray-500">{profile?.workCategory || "Farm Labour"}</p>
                            {profile?.dailyRate && <p className="text-orange-600 font-bold text-sm mt-1">₹{profile.dailyRate}/day</p>}
                            <div className="mt-3 flex justify-center">
                                {profile?.isAvailable !== false
                                    ? <span className="badge bg-green-100 text-green-800">✓ Available</span>
                                    : <span className="badge bg-red-100 text-red-800">× Unavailable</span>
                                }
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-all duration-200 ${tab === t.id ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <span className="text-xl">{t.icon}</span>
                                    <span className="truncate">{t.label}</span>
                                    {t.id === "notifs" && unreadCount > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
                                    )}
                                    {t.id === "job-offers" && farmerJobs.length > 0 && (
                                        <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-1.5 rounded-full">{farmerJobs.length}</span>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Mobile & Tablet Nav Strip */}
                        <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-2 overflow-x-auto scrollbar-none flex gap-2">
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${tab === t.id ? "bg-orange-500 text-white shadow-sm" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                                >
                                    <span className="text-base">{t.icon}</span>
                                    <span>{t.label}</span>
                                    {t.id === "notifs" && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                    {t.id === "job-offers" && farmerJobs.length > 0 && (
                                        <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{farmerJobs.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* ── Main ── */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* ─ OVERVIEW ─ */}
                                {tab === "overview" && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-black text-gray-900 font-display">Your Activity 📊</h2>

                                        {!profile && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">👷</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-orange-900">Complete Your Work Profile</p>
                                                    <p className="text-orange-700 text-sm">Set your work category, daily rate &amp; skills so farmers can hire you.</p>
                                                </div>
                                                <button onClick={() => setTab("profile")}
                                                    className="flex-shrink-0 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition">
                                                    Set Up Now →
                                                </button>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <StatCard icon="📋" label="My Seek Posts"   value={mySeekPosts.length}  color="bg-blue-50 text-blue-700" />
                                            <StatCard icon="⏳" label="Pending Apps"    value={pendingApps}         color="bg-yellow-50 text-yellow-700" />
                                            <StatCard icon="✅" label="Jobs Accepted"   value={completedJobs}       color="bg-green-50 text-green-700" />
                                            <StatCard icon="💼" label="Farmer Offers"   value={farmerJobs.length}   color="bg-purple-50 text-purple-700" />
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900">Recent Farmer Job Offers</h3>
                                                <button onClick={() => setTab("job-offers")} className="text-orange-600 text-sm font-semibold hover:underline">View all →</button>
                                            </div>
                                            {farmerJobs.slice(0, 3).length === 0 ? (
                                                <p className="text-gray-400 text-sm py-4 text-center">No job offers yet. Check back soon!</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {farmerJobs.slice(0, 3).map(job => (
                                                        <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900">{job.title}</p>
                                                                <p className="text-xs text-gray-400">📍 {job.location} · ₹{job.wagePerDay}/day · {job.duration}</p>
                                                            </div>
                                                            <button onClick={() => setTab("job-offers")}
                                                                className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold hover:bg-orange-200 transition">
                                                                View
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900">My Applications & Hire Status</h3>
                                                <button onClick={() => setTab("job-offers")} className="text-orange-600 text-sm font-semibold hover:underline">View Job Offers →</button>
                                            </div>
                                            {myApplications.length === 0 ? (
                                                <p className="text-gray-400 text-sm py-4 text-center">No applications submitted yet. Browse job offers to apply.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {myApplications.map(app => (
                                                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900">{app.workCategory}</p>
                                                                <p className="text-xs text-gray-500">₹{app.dailyRate}/day · Applied on {app.appliedAt ? format(new Date(app.appliedAt), "MMM dd") : "recently"}</p>
                                                            </div>
                                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === "accepted" ? "bg-green-100 text-green-700" : app.status === "rejected" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                                                                {app.status === "accepted" ? "✅ Accepted" : app.status === "rejected" ? "❌ Declined" : "⏳ Pending"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900">My Active Seek Posts</h3>
                                                <button onClick={() => setTab("seek-job")} className="text-orange-600 text-sm font-semibold hover:underline">+ Add New</button>
                                            </div>
                                            {mySeekPosts.slice(0, 2).length === 0 ? (
                                                <p className="text-gray-400 text-sm py-4 text-center">Post your job seeking request for farmers to see.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {mySeekPosts.slice(0, 2).map(post => (
                                                        <div key={post.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900">{post.jobTitle}</p>
                                                                <p className="text-xs text-gray-500">₹{post.dailyRate}/day · {post.duration}</p>
                                                            </div>
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ─ MY PROFILE ─ */}
                                {tab === "profile" && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {profile ? "My Work Profile" : "Create Your Work Profile"} 👷
                                            </h2>
                                            {profile && !editingProfile && (
                                                <button onClick={() => setEditingProfile(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition">
                                                    <MdEdit className="h-4 w-4" /> Edit
                                                </button>
                                            )}
                                        </div>

                                        {profile && !editingProfile ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {[
                                                        { label: "Work Category", value: profile.workCategory, color: "bg-orange-50 border-orange-100 text-orange-500" },
                                                        { label: "Daily Rate",    value: `₹${profile.dailyRate} / day`, color: "bg-green-50 border-green-100 text-green-500" },
                                                        { label: "Experience",    value: profile.experience || "Not specified", color: "bg-blue-50 border-blue-100 text-blue-500" },
                                                        { label: "Location",      value: profile.preferredLocation || user?.village || "Not specified", color: "bg-purple-50 border-purple-100 text-purple-500" },
                                                    ].map(({ label, value, color }) => (
                                                        <div key={label} className={`rounded-2xl p-5 border ${color.split(" ").slice(0,2).join(" ")}`}>
                                                            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${color.split(" ")[2]}`}>{label}</p>
                                                            <p className="font-black text-gray-900 text-lg">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {profile.bio && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">About Me</p>
                                                        <p className="text-gray-700 bg-gray-50 rounded-xl p-4 text-sm leading-relaxed">{profile.bio}</p>
                                                    </div>
                                                )}
                                                {profile.skills?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">Skills</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {profile.skills.map(s => (
                                                                <span key={s} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className={`w-3 h-3 rounded-full ${profile.isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                                                    <p className="font-semibold text-gray-700">
                                                        {profile.isAvailable ? "Currently Available for Work" : "Not Available Right Now"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                                {!profile && (
                                                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                                                        <p className="text-orange-800 text-sm font-bold">
                                                            👷 Set up your profile so farmers can find and hire you!
                                                        </p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="label">Work Category *</label>
                                                    <select required value={profileForm.workCategory}
                                                        onChange={e => setProfileForm(p => ({ ...p, workCategory: e.target.value }))}
                                                        className="input-field">
                                                        {WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="label">Expected Daily Rate (₹) *</label>
                                                    <input required type="number" min="0" placeholder="e.g. 500"
                                                        value={profileForm.dailyRate}
                                                        onChange={e => setProfileForm(p => ({ ...p, dailyRate: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div>
                                                    <label className="label">About Yourself</label>
                                                    <textarea rows={3}
                                                        placeholder="Describe your experience, what farm tasks you do, etc."
                                                        value={profileForm.bio}
                                                        onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div>
                                                    <label className="label">Years of Experience</label>
                                                    <input type="text" placeholder="e.g. 5 years in harvesting &amp; planting"
                                                        value={profileForm.experience}
                                                        onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div>
                                                    <label className="label">Skills (select all that apply)</label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {SKILL_TAGS.map(skill => (
                                                            <button key={skill} type="button"
                                                                onClick={() => toggleSkill(skill, setProfileForm)}
                                                                className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${(profileForm.skills || []).includes(skill) ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                                                                {skill}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="label">Preferred Work Location</label>
                                                    <input type="text" placeholder={user?.village || "e.g. Pune, Maharashtra"}
                                                        value={profileForm.preferredLocation}
                                                        onChange={e => setProfileForm(p => ({ ...p, preferredLocation: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">Available for Work</p>
                                                        <p className="text-xs text-gray-500">Farmers see you as available to hire</p>
                                                    </div>
                                                    <button type="button"
                                                        onClick={() => setProfileForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
                                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${profileForm.isAvailable ? "bg-green-500" : "bg-gray-300"}`}>
                                                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${profileForm.isAvailable ? "translate-x-7" : ""}`} />
                                                    </button>
                                                </div>

                                                <div className="flex gap-3">
                                                    {editingProfile && profile && (
                                                        <button type="button" onClick={() => setEditingProfile(false)}
                                                            className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-gray-200 hover:border-orange-400 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-all">
                                                            <MdClose className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={savingProfile}
                                                        className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg ${savingProfile ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5"}`}>
                                                        {savingProfile ? "Saving…" : profile ? "Update Profile 👷" : "Create Profile & Go Live 🚀"}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* ─ SEEK JOBS ─ */}
                                {tab === "seek-job" && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900">Post Seek Job Request 🔍</h2>
                                                <p className="text-gray-500 text-sm mt-1">Tell farmers what work you want, your daily rate &amp; details. They will contact you!</p>
                                            </div>

                                            {/* ── Voice Agent ── */}
                                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-6">
                                                <p className="font-bold text-orange-900 flex items-center gap-2 mb-1">
                                                    🎙️ Voice Agent — Fill Form by Speaking
                                                </p>
                                                <p className="text-orange-700 text-xs mb-4">
                                                    Press Start, speak your job details, then Stop. AI (Groq) will understand and fill the form for you.
                                                </p>

                                                <div className="flex items-center gap-3 flex-wrap mb-3">
                                                    {!voiceAgent.isRecording ? (
                                                        <motion.button key="start-btn" whileTap={{ scale: 0.95 }}
                                                            onClick={voiceAgent.startRecording}
                                                            disabled={voiceAgent.isProcessing}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${voiceAgent.isProcessing ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5"}`}>
                                                            <MdMic className="h-5 w-5" />
                                                            <span>{voiceAgent.isProcessing ? "Processing…" : "Start Recording"}</span>
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button key="stop-btn" whileTap={{ scale: 0.95 }} onClick={voiceAgent.stopRecording}
                                                            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition">
                                                            <MdStop className="h-5 w-5" /> <span>Stop Recording</span>
                                                        </motion.button>
                                                    )}

                                                    <AnimatePresence mode="wait">
                                                        {voiceAgent.isRecording && (
                                                            <motion.div key="recording-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                                className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                                <span>Listening…</span>
                                                            </motion.div>
                                                        )}
                                                        {voiceAgent.isProcessing && (
                                                            <motion.div key="processing-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                                className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                                </svg>
                                                                <span>AI understanding your speech…</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {voiceTranscript && (
                                                        <motion.div key="transcript-box" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                            className="bg-white rounded-xl p-3 border border-orange-200 mb-3">
                                                            <p className="text-xs text-orange-500 font-bold mb-1">You said:</p>
                                                            <p className="text-gray-700 text-sm italic">"{voiceTranscript}"</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <p className="text-xs text-orange-600">
                                                    <strong>Example:</strong> "I want harvesting work for 7 days, I expect ₹600 per day, I can work in Pune area, I know tractor driving and crop harvesting"
                                                </p>
                                            </div>

                                            {/* ── Seek Job Form ── */}
                                            <form onSubmit={handlePostSeekJob} className="space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Job Title / Work Type *</label>
                                                        <select required value={seekForm.jobTitle}
                                                            onChange={e => setSeekForm(p => ({ ...p, jobTitle: e.target.value }))}
                                                            className="input-field">
                                                            <option value="">Select work type</option>
                                                            {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="label">Expected Daily Rate (₹) *</label>
                                                        <input required type="number" min="0" placeholder="e.g. 500"
                                                            value={seekForm.dailyRate}
                                                            onChange={e => setSeekForm(p => ({ ...p, dailyRate: e.target.value }))}
                                                            className="input-field" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="label">Detailed Description *</label>
                                                    <textarea required rows={4}
                                                        placeholder="Describe what work you want — e.g. 'I can harvest wheat and operate tractor. Available from Monday for 10 days. Experienced with Mahindra 575.'"
                                                        value={seekForm.description}
                                                        onChange={e => setSeekForm(p => ({ ...p, description: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Availability Duration</label>
                                                        <input type="text" placeholder="e.g. 7 days, 1 month, Ongoing"
                                                            value={seekForm.duration}
                                                            onChange={e => setSeekForm(p => ({ ...p, duration: e.target.value }))}
                                                            className="input-field" />
                                                    </div>
                                                    <div>
                                                        <label className="label">When Available</label>
                                                        <input type="text" placeholder="e.g. From Monday, From June 15th"
                                                            value={seekForm.availability}
                                                            onChange={e => setSeekForm(p => ({ ...p, availability: e.target.value }))}
                                                            className="input-field" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="label">Preferred Work Location</label>
                                                    <input type="text" placeholder={user?.village || "e.g. Shirur, Pune — leave blank for anywhere"}
                                                        value={seekForm.preferredLocation}
                                                        onChange={e => setSeekForm(p => ({ ...p, preferredLocation: e.target.value }))}
                                                        className="input-field" />
                                                </div>

                                                <div>
                                                    <label className="label">Relevant Skills</label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {SKILL_TAGS.map(skill => (
                                                            <button key={skill} type="button"
                                                                onClick={() => toggleSkill(skill, setSeekForm)}
                                                                className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${(seekForm.skills || []).includes(skill) ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
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
                                                                onClick={() => setSeekForm(p => ({ ...p, urgency: opt.v }))}
                                                                className={`p-3 rounded-xl border-2 text-center transition-all ${seekForm.urgency === opt.v ? "border-orange-500 bg-orange-50 text-orange-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                                                <div className="font-bold text-sm">{opt.l}</div>
                                                                <div className="text-xs text-gray-400 mt-0.5">{opt.d}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={postingSeek}
                                                    className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${postingSeek ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5"}`}>
                                                    {postingSeek ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                            </svg>
                                                            Publishing…
                                                        </span>
                                                    ) : "Post Seek Job Request 🔍"}
                                                </motion.button>
                                            </form>
                                        </div>

                                        {mySeekPosts.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                                <h3 className="font-bold text-gray-900 mb-4">My Active Posts ({mySeekPosts.length})</h3>
                                                <div className="space-y-4">
                                                    {mySeekPosts.map(post => (
                                                        <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                            className="border border-orange-100 bg-orange-50 rounded-2xl p-5">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900">{post.jobTitle}</h4>
                                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                                        ₹{post.dailyRate}/day · {post.duration} · {post.urgency === "urgent" ? "🔴 Urgent" : post.urgency === "soon" ? "🟡 Soon" : "🟢 Normal"}
                                                                    </p>
                                                                </div>
                                                                <button onClick={async () => { if (confirm("Delete this post?")) await remove(ref(db, `labourSeekJobs/${post.id}`)); }}
                                                                    className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition">
                                                                    <MdDelete className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            {post.description && <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>}
                                                            {post.skills?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-3">
                                                                    {post.skills.map(s => <span key={s} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─ JOB OFFERS ─ */}
                                {tab === "job-offers" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">Farmer Job Offers 📋</h2>
                                            <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-xs font-bold">{farmerJobs.length} Available</span>
                                        </div>

                                        {farmerJobs.length === 0 ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                                <span className="text-6xl block mb-4">📭</span>
                                                <p className="text-gray-500 font-semibold text-lg">No job offers yet</p>
                                                <p className="text-gray-400 text-sm mt-1">Post your Seek Job request so farmers can find you!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {farmerJobs.map(job => {
                                                    const alreadyApplied = myApplications.some(a => a.jobId === job.id);
                                                    const myApp = myApplications.find(a => a.jobId === job.id);
                                                    return (
                                                        <motion.div key={job.id}
                                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-orange-200 transition-all">
                                                            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-amber-400" />
                                                            <div className="p-5">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                                                                        <p className="text-sm text-gray-500 mt-0.5">by {job.farmerName} · 📍 {job.location}</p>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <span className="font-black text-green-700 text-base">₹{job.wagePerDay}/day</span>
                                                                        {job.urgency === "urgent" && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">🔴 Urgent</span>}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-gray-50 rounded-xl p-3">
                                                                    {[
                                                                        { l: "Work Type", v: job.workCategory },
                                                                        { l: "Duration",  v: job.duration },
                                                                        { l: "Workers Needed", v: job.workersNeeded || 1 },
                                                                        { l: "Posted", v: job.createdAt ? format(new Date(job.createdAt), "MMM dd") : "—" },
                                                                    ].map(({ l, v }) => (
                                                                        <div key={l}>
                                                                            <p className="text-xs text-gray-400 font-medium">{l}</p>
                                                                            <p className="font-semibold text-gray-800 text-sm mt-0.5">{v}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {job.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{job.description}</p>}

                                                                {job.skillsRequired?.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                                        {job.skillsRequired.map(s => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    {job.assignedLabourId === authUser.uid ? (
                                                                        job.status === "accepted" || job.assignedLabourStatus === "accepted" ? (
                                                                            <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-green-50 text-green-700 border border-green-200">
                                                                                ✅ Direct Hire Offer Accepted
                                                                            </span>
                                                                        ) : job.status === "declined" || job.assignedLabourStatus === "declined" ? (
                                                                            <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-red-50 text-red-600 border border-red-200">
                                                                                ❌ Hire Offer Declined
                                                                            </span>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <button onClick={() => handleAcceptHireOffer(job)}
                                                                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition shadow">
                                                                                    <MdCheckCircle className="h-4 w-4" /> Accept Hire Offer
                                                                                </button>
                                                                                <button onClick={() => handleDeclineHireOffer(job)}
                                                                                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 font-bold text-sm rounded-xl hover:bg-red-200 transition">
                                                                                    <MdCancel className="h-4 w-4" /> Decline
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    ) : alreadyApplied ? (
                                                                        <span className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl ${myApp?.status === "accepted" ? "bg-green-50 text-green-700 border border-green-200" : myApp?.status === "rejected" ? "bg-red-50 text-red-600 border border-red-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                                                                            {myApp?.status === "accepted" ? "✅ Accepted" : myApp?.status === "rejected" ? "❌ Rejected" : "⏳ Applied — Pending"}
                                                                        </span>
                                                                    ) : (
                                                                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleApply(job)}
                                                                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-md shadow-orange-200">
                                                                            Apply for This Job 👷
                                                                        </motion.button>
                                                                    )}
                                                                    {job.farmerPhone && (
                                                                        <a href={`tel:${job.farmerPhone}`}
                                                                            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-green-400 hover:text-green-700 transition">
                                                                            <MdPhone className="h-4 w-4" /> Contact
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─ NOTIFICATIONS ─ */}
                                {tab === "notifs" && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllRead} className="text-sm text-orange-600 font-semibold hover:underline">Mark all as read</button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-16">
                                                <span className="text-5xl block mb-3">🔔</span>
                                                <p className="text-gray-400">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {notifications.map(n => (
                                                    <div key={n.id} className={`flex gap-3 p-4 rounded-xl border transition-all ${n.read ? "bg-gray-50 border-gray-100" : "bg-orange-50 border-orange-200"}`}>
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${n.type?.includes("accept") ? "bg-green-100" : n.type?.includes("reject") ? "bg-red-100" : "bg-orange-100"}`}>
                                                            {n.type?.includes("accept") ? "✅" : n.type?.includes("reject") ? "❌" : "📢"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm leading-relaxed ${n.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>{n.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{n.createdAt ? format(new Date(n.createdAt), "MMM dd · HH:mm") : ""}</p>
                                                        </div>
                                                        {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default LabourDashboard;
