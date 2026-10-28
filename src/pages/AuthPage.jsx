import React, { useState, useRef, useCallback } from "react";
import { auth, db } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTractor, FaLeaf, FaShieldAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import {
    MdEmail, MdLock, MdPerson, MdPhone, MdLocationOn,
    MdVisibility, MdVisibilityOff, MdCloudUpload, MdVerified,
    MdError, MdArrowBack, MdArrowForward, MdDocumentScanner, MdAdminPanelSettings,
} from "react-icons/md";
import { GiFarmer } from "react-icons/gi";
import toast from "react-hot-toast";
import { verifyFarmerDocument, compressThumbnail } from "../services/farmerVerificationService";

// ─── Step Indicator ─────────────────────────────────────────────────────────
const StepDot = ({ step, current, label }) => {
    const isComplete = current > step;
    const isActive = current === step;
    return (
        <div className="flex flex-col items-center gap-1">
            <motion.div
                animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isComplete ? "#16a34a" : isActive ? "#15803d" : "#d1d5db",
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            >
                {isComplete ? "✓" : step}
            </motion.div>
            <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-green-700" : isComplete ? "text-green-600" : "text-gray-400"}`}>
                {label}
            </span>
        </div>
    );
};

const StepLine = ({ active }) => (
    <div className="flex-1 h-0.5 mx-1 mt-[-1rem] sm:mt-[-1.5rem]">
        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: active ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="h-full bg-green-500 origin-left rounded"
        />
        <div className="h-full bg-gray-200 rounded -mt-0.5" style={{ zIndex: -1 }} />
    </div>
);

// ─── Document Upload Panel ───────────────────────────────────────────────────
const DocumentUploadPanel = ({ onFileSelect, file, verificationResult, isVerifying, role }) => {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFileSelect(dropped);
    }, [onFileSelect]);

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    const getVerificationColor = () => {
        if (!verificationResult) return "";
        if (verificationResult.isGenuine && verificationResult.confidence >= 60) return "border-green-400 bg-green-50";
        if (verificationResult.confidence < 60 && verificationResult.isGenuine) return "border-yellow-400 bg-yellow-50";
        return "border-red-400 bg-red-50";
    };

    const getStatusIcon = () => {
        if (isVerifying) return (
            <div className="flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm font-semibold">AI is verifying your document…</span>
            </div>
        );
        if (!verificationResult) return null;
        if (verificationResult.isGenuine && verificationResult.confidence >= 60) return (
            <div className="flex items-center gap-2 text-green-700">
                <MdVerified className="h-5 w-5" />
                <span className="text-sm font-bold">Document Verified ✓</span>
            </div>
        );
        if (verificationResult.isGenuine && verificationResult.confidence < 60) return (
            <div className="flex items-center gap-2 text-yellow-700">
                <FaShieldAlt className="h-5 w-5" />
                <span className="text-sm font-bold">Partially Verified (Low Confidence)</span>
            </div>
        );
        return (
            <div className="flex items-center gap-2 text-red-700">
                <MdError className="h-5 w-5" />
                <span className="text-sm font-bold">Verification Failed</span>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {/* Upload Zone */}
            <motion.div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                animate={{ borderColor: dragging ? "#16a34a" : file ? "#16a34a" : "#d1d5db" }}
                className={`relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${dragging ? "bg-green-50 scale-[1.01]" :
                    file ? getVerificationColor() || "bg-gray-50" : "bg-gray-50 hover:bg-green-50/50"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3 text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                                <MdCloudUpload className="h-7 w-7 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-700 text-sm">
                                    {role === "expert" ? "Upload Expert Credential" : "Upload Farmer ID Document"}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">Drag & drop or click to browse</p>
                                <p className="text-gray-400 text-xs">JPG, PNG, WebP · Max 10MB</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center mt-1">
                                {role === "expert" 
                                    ? ["Degree Certificate", "Agronomist ID", "Govt ID"].map(t => (
                                        <span key={t} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                            {t}
                                        </span>
                                    ))
                                    : ["Kisan Card", "7/12 Utara"].map(t => (
                                        <span key={t} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                            {t}
                                        </span>
                                    ))
                                }
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Document preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm truncate">{file.name}</p>
                                <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                                {getStatusIcon()}
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
                                className="text-gray-400 hover:text-red-500 text-xs font-bold p-1 transition-colors"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Verification Result Card */}
            <AnimatePresence>
                {verificationResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className={`overflow-hidden rounded-2xl border p-4 space-y-3 ${!verificationResult.isGenuine
                            ? "bg-red-50 border-red-200"
                            : verificationResult.crossVerification?.nameMatch === false
                                ? "bg-orange-50 border-orange-300"
                                : verificationResult.confidence >= 60
                                    ? "bg-green-50 border-green-200"
                                    : "bg-yellow-50 border-yellow-200"
                            }`}
                    >
                        {/* Rejection reason */}
                        {!verificationResult.isGenuine && verificationResult.rejectionReason && (
                            <div className="flex gap-2 items-start">
                                <MdError className="text-red-500 h-4 w-4 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-xs font-semibold leading-relaxed">
                                    {verificationResult.rejectionReason}
                                </p>
                            </div>
                        )}

                        {/* Confidence bar */}
                        {verificationResult.isGenuine && (
                            <>
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
                                    <span>AI Confidence</span>
                                    <span>{verificationResult.confidence}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${verificationResult.confidence}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full ${verificationResult.confidence >= 75 ? "bg-green-500" :
                                            verificationResult.confidence >= 50 ? "bg-yellow-500" : "bg-red-500"
                                            }`}
                                    />
                                </div>
                            </>
                        )}

                        {/* Doc type + provider */}
                        <div className="flex items-center gap-2 text-xs">
                            <MdDocumentScanner className="text-gray-500" />
                            <span className="text-gray-500">Detected:</span>
                            <span className="font-bold text-gray-700">{verificationResult.docType}</span>
                            <span className="ml-auto text-gray-400 capitalize">via {verificationResult.provider}</span>
                        </div>

                        {/* Cross-verification badges */}
                        {verificationResult.isGenuine && verificationResult.crossVerification && (
                            <div className="border-t border-current/10 pt-2 space-y-2">
                                <p className="text-xs font-bold text-gray-600">Cross-Verification</p>
                                <div className="flex flex-wrap gap-2">
                                    {/* Name match */}
                                    {verificationResult.crossVerification.nameMatch !== undefined && (
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${verificationResult.crossVerification.nameMatch === true ? "bg-green-100 text-green-700" :
                                            verificationResult.crossVerification.nameMatch === false ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-500"
                                            }`}>
                                            {verificationResult.crossVerification.nameMatch === true ? "✓" :
                                                verificationResult.crossVerification.nameMatch === false ? "✗" : "—"}
                                            {" "}Name
                                            {verificationResult.extractedInfo?.name && (
                                                <span className="opacity-60">({verificationResult.extractedInfo.name})</span>
                                            )}
                                        </span>
                                    )}
                                    {/* Location match */}
                                    {verificationResult.crossVerification.locationMatch !== undefined && (
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${verificationResult.crossVerification.locationMatch === true ? "bg-green-100 text-green-700" :
                                            verificationResult.crossVerification.locationMatch === false ? "bg-orange-100 text-orange-700" :
                                                "bg-gray-100 text-gray-500"
                                            }`}>
                                            {verificationResult.crossVerification.locationMatch === true ? "✓" :
                                                verificationResult.crossVerification.locationMatch === false ? "~" : "—"}
                                            {" "}Location
                                            {verificationResult.extractedInfo?.village && (
                                                <span className="opacity-60">({verificationResult.extractedInfo.village})</span>
                                            )}
                                        </span>
                                    )}
                                    {/* Phone match */}
                                    {verificationResult.crossVerification.phoneMatch !== undefined && (
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${verificationResult.crossVerification.phoneMatch === true ? "bg-green-100 text-green-700" :
                                            verificationResult.crossVerification.phoneMatch === false ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-500"
                                            }`}>
                                            {verificationResult.crossVerification.phoneMatch === true ? "✓" :
                                                verificationResult.crossVerification.phoneMatch === false ? "✗" : "—"} Phone
                                        </span>
                                    )}
                                </div>
                                {/* Land / Survey details */}
                                <div className="grid grid-cols-2 gap-1 pt-1">
                                    {verificationResult.extractedInfo?.landArea && (
                                        <div className="text-xs"><span className="text-gray-400">Land: </span><span className="font-semibold text-gray-700">{verificationResult.extractedInfo.landArea}</span></div>
                                    )}
                                    {verificationResult.extractedInfo?.surveyNo && (
                                        <div className="text-xs"><span className="text-gray-400">Survey #: </span><span className="font-semibold text-gray-700">{verificationResult.extractedInfo.surveyNo}</span></div>
                                    )}
                                    {verificationResult.extractedInfo?.issuedBy && (
                                        <div className="text-xs col-span-2"><span className="text-gray-400">Issued by: </span><span className="font-semibold text-gray-700">{verificationResult.extractedInfo.issuedBy}</span></div>
                                    )}
                                </div>
                                {/* AI cross-check summary */}
                                {verificationResult.crossVerification.summary && (
                                    <p className="text-xs text-gray-500 italic">{verificationResult.crossVerification.summary}</p>
                                )}
                            </div>
                        )}

                        {/* AI reason */}
                        <p className="text-xs text-gray-600 italic leading-relaxed border-t border-current/10 pt-2">
                            {verificationResult.reason}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main AuthPage ───────────────────────────────────────────────────────────
const AuthPage = () => {
    const location = useLocation();
    const isSignupParam = new URLSearchParams(location.search).get("signup") === "1";
    const [mode, setMode] = useState(isSignupParam ? "signup" : "login");
    const [step, setStep] = useState(0); // 0 = role pick, 1=Details, 2=Security, 3=Identity
    const [selectedRole, setSelectedRole] = useState(""); // "farmer"|"expert"|"user"
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    // ── Form Fields ──
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [village, setVillage] = useState("");
    const [state, setState] = useState("");

    // ── Document verification ──
    const [docFile, setDocFile] = useState(null);
    const [expertFile, setExpertFile] = useState(null); // expert credential
    const [verificationResult, setVerificationResult] = useState(null);
    const [verificationError, setVerificationError] = useState(null);
    // "ai" = AI verified | "manual" = AI failed, submit for admin review | null = not yet
    const [verificationMode, setVerificationMode] = useState(null);

    // ── Reset when switching modes ──
    const switchMode = (m) => {
        setMode(m);
        setStep(m === "signup" ? 0 : 1);
        setSelectedRole("");
        setDocFile(null);
        setExpertFile(null);
        setVerificationResult(null);
        setVerificationError(null);
        setVerificationMode(null);
    };

    // ─── Handle document file selection & auto-verify ──────────────
    const handleFileSelect = async (file) => {
        if (!file) {
            setDocFile(null);
            setVerificationResult(null);
            setVerificationError(null);
            setVerificationMode(null);
            return;
        }
        setDocFile(file);
        setVerificationResult(null);
        setVerificationError(null);
        setVerificationMode(null);
        setIsVerifying(true);

        try {
            // Pass current form values so AI can cross-verify name/phone/village/role
            const result = await verifyFarmerDocument(file, { name, phone, village, role: selectedRole });
            setVerificationResult(result);

            if (!result.isGenuine) {
                // Show specific rejection reason
                const msg = result.rejectionReason || "Document not accepted. Please upload a valid document.";
                toast.error(msg, { duration: 5000 });
                return;
            }

            // Check cross-verification — warn if name mismatch and do not allow registration
            const cv = result.crossVerification || {};
            if (cv.nameMatch === false) {
                toast(
                    `Name mismatch: form says "${name}" but document shows "${result.extractedInfo?.name}". Registration rejected.`,
                    { icon: "⚠️", duration: 6000 }
                );
                // Don't allow account creation on name mismatch
                setVerificationMode(null);
                setDocFile(null); // Clear the file so they have to upload a correct one
                return;
            }

            if (result.confidence >= 60) {
                setVerificationMode("ai");
                const matchNote = cv.nameMatch === true ? " Name matched ✓" : "";
                toast.success(`Document verified by AI ✓${matchNote}`, { icon: "🛡️" });
                if (!village && result.extractedInfo?.village) setVillage(result.extractedInfo.village);
                if (!state && result.extractedInfo?.state) setState(result.extractedInfo.state);
            } else {
                setVerificationMode("ai");
                toast("Document partially verified. Low clarity.", { icon: "⚠️" });
            }
        } catch (err) {
            console.error("[AuthPage] AI verification failed:", err.message);
            setVerificationError(err.message);
            setVerificationMode("manual");
            toast("AI verification unavailable. You can submit for admin review instead.", { icon: "📋", duration: 5000 });
        } finally {
            setIsVerifying(false);
        }
    };

    // ─── Friendly firebase error messages ──────────────────────────
    const friendlyError = (code) => {
        const map = {
            "auth/user-not-found": "No account found with this email. Please sign up.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/email-already-in-use": "Email already registered. Please log in.",
            "auth/weak-password": "Password must be at least 6 characters.",
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/invalid-credential": "Invalid email or password.",
            "auth/too-many-requests": "Too many failed attempts. Try again later.",
        };
        return map[code] || "Something went wrong. Please try again.";
    };

    const saveUserToDB = async (uid, data) => {
        const snap = await get(ref(db, `users/${uid}`));
        if (!snap.exists()) {
            await set(ref(db, `users/${uid}`), {
                ...data,
                createdAt: new Date().toISOString(),
            });
        }
    };

    // ─── Step navigation ───────────────────────────────────────────
    const nextStep = (e) => {
        e?.preventDefault();
        if (step === 1) {
            if (!name.trim() || !phone.trim() || !village.trim()) {
                toast.error("Please fill all fields.");
                return;
            }
            if (!/^\d{10}$/.test(phone)) {
                toast.error("Enter a valid 10-digit phone number.");
                return;
            }
        }
        if (step === 2) {
            if (!email.trim() || !password) {
                toast.error("Please enter email and password.");
                return;
            }
            if (password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => Math.max(1, s - 1));

    // ─── Final Submit ──────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back! 👋");
                navigate("/home");
                return;
            }

            // ── REGISTRATION ──
            // User (buyer) — no doc required
            if (selectedRole === "user") {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToDB(user.uid, { name, email, phone, village, state, role: "user", verificationStatus: "verified" });
                toast.success("Welcome to Farm2Value! 🛒");
                navigate("/home");
                return;
            }

            // Labour — no document verification required
            if (selectedRole === "labour") {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToDB(user.uid, {
                    name, email, phone, village, state,
                    role: "labour",
                    verificationStatus: "verified",
                });
                toast.success("Welcome Farm Worker! 👷 Set up your profile to get hired.");
                navigate("/labour-dashboard");
                return;
            }

            // Expert and Farmer — document verification required
            if (!docFile) {
                toast.error("Please upload your identity document.");
                setLoading(false);
                return;
            }

            // ── Path A: AI verified ──
            if (verificationMode === "ai" && verificationResult?.isGenuine) {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToDB(user.uid, {
                    name, email, phone, village, state,
                    role: selectedRole,
                    verificationStatus: verificationResult.confidence >= 60 ? "verified" : "partial",
                    verifiedDocType: verificationResult.docType,
                    verificationConfidence: verificationResult.confidence,
                    verificationProvider: verificationResult.provider,
                    extractedLand: verificationResult.extractedInfo?.landArea || null,
                    extractedSurveyNo: verificationResult.extractedInfo?.surveyNo || null,
                    isAvailable: selectedRole === "expert" ? false : undefined, // specific to expert
                });

                if (selectedRole === "expert") {
                    toast.success("Account verified! Welcome Expert 👨‍🏫");
                } else if (selectedRole === "labour") {
                    toast.success("Account created! Welcome Farm Worker 👷 — Set up your profile.");
                } else {
                    toast.success("Account created! Welcome to Farm2Value 🌱");
                }
                navigate(selectedRole === "labour" ? "/labour-dashboard" : "/home");
                return;
            }

            // ── Path B: Manual admin review ──
            if (verificationMode === "manual") {
                let thumbDataUrl = null;
                try { thumbDataUrl = await compressThumbnail(docFile); } catch (_) { }
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToDB(user.uid, { name, email, phone, village, state, role: selectedRole, verificationStatus: "pending_admin" });

                const dbPath = selectedRole === "expert" ? `expertVerificationRequests/${user.uid}` : `verificationRequests/${user.uid}`;

                await set(ref(db, dbPath), {
                    uid: user.uid, name, email, phone, village, state, role: selectedRole,
                    docThumbnail: thumbDataUrl,
                    submittedAt: new Date().toISOString(),
                    status: "pending",
                    aiError: verificationError || "AI unavailable",
                });
                toast.success("Registration submitted! Awaiting admin approval.", { duration: 5000 });
                navigate("/pending-approval");
                return;
            }

            toast.error("Please upload and verify your document first.");
        } catch (err) {
            toast.error(friendlyError(err.code || "unknown"));
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex pt-16">
            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                        <FaTractor className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white font-display">
                        Agro<span className="text-green-300">Share</span>
                    </span>
                </div>

                {/* Main copy */}
                <div className="relative space-y-7">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-green-300 text-xs font-bold">
                            <FaLeaf className="h-3 w-3" /> AI-Powered Farmer Verification
                        </div>
                        <h2 className="text-4xl font-black text-white font-display leading-tight">
                            Empowering Indian Farmers with{" "}
                            <span className="text-green-300">Smart Sharing</span>
                        </h2>
                        <p className="text-green-200 text-base leading-relaxed">
                            Rent tractors, harvesters, and tools from nearby farmers.
                            Increase your yield, reduce your costs.
                        </p>
                    </div>

                    {/* Feature list */}
                    {[
                        ["🛡️", "AI Document Verification", "Kisan Card & 7/12 verified via Gemini AI"],
                        ["🤝", "Trusted Farmer Network", "Only verified farmers can list equipment"],
                        ["📍", "Hyper-local Listings", "Find equipment in your village or block"],
                    ].map(([icon, title, desc]) => (
                        <div key={title} className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                                {icon}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{title}</p>
                                <p className="text-green-300/80 text-xs">{desc}</p>
                            </div>
                        </div>
                    ))}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {[["18,000+", "Farmers"], ["2,400+", "Listings"], ["4.8★", "Rating"]].map(([v, l]) => (
                            <div key={l} className="bg-white/8 backdrop-blur rounded-2xl p-3.5 border border-white/10 text-center">
                                <p className="font-black text-white text-lg">{v}</p>
                                <p className="text-green-300 text-xs">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-green-500 text-xs">
                    © 2025 Farm2Value India · Built for Bharat 🇮🇳
                </p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-gray-50 to-green-50/30 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
                            <FaTractor className="text-white h-5 w-5" />
                        </div>
                        <span className="text-xl font-black font-display">
                            Agro<span className="text-green-600">Share</span>
                        </span>
                    </div>

                    {/* Mode tabs */}
                    <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-6 shadow-sm">
                        {[["login", "Sign In"], ["signup", "Join Free"]].map(([m, label]) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${mode === m
                                    ? "bg-green-600 text-white shadow"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ─── LOGIN FORM ─── */}
                    <AnimatePresence mode="wait">
                        {mode === "login" && (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-3xl font-black text-gray-900 font-display mb-1">
                                    Welcome back 👋
                                </h1>
                                <p className="text-gray-500 text-sm mb-7">
                                    Sign in to access your Farm2Value dashboard
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            required value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email" placeholder="Email address"
                                            className="input-field pl-11"
                                        />
                                    </div>
                                    <div className="relative">
                                        <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type={showPass ? "text" : "password"}
                                            placeholder="Password"
                                            className="input-field pl-11 pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPass ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:-translate-y-0.5"
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Signing In…
                                            </span>
                                        ) : "Sign In →"}
                                    </motion.button>
                                </form>

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Don&apos;t have an account?{" "}
                                    <button onClick={() => switchMode("signup")} className="text-green-600 font-bold hover:underline">
                                        Register as Farmer
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ─── SIGNUP MULTI-STEP ─── */}
                        {mode === "signup" && (
                            <motion.div
                                key="signup-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* ── STEP 0: Role Selection ── */}
                                {step === 0 && (
                                    <div>
                                        <h1 className="text-2xl font-black text-gray-900 font-display mb-1">Join Farm2Value</h1>
                                        <p className="text-gray-500 text-sm mb-6">Select who you are to get started</p>
                                        <div className="space-y-3">
                                            {[
                                                { role: "farmer", emoji: "🌾", title: "Farmer", desc: "I grow crops and want to sell my produce", color: "border-green-500 bg-green-50" },
                                                { role: "expert", emoji: "👨‍🏫", title: "Agricultural Expert", desc: "I advise farmers and offer consultations", color: "border-indigo-500 bg-indigo-50" },
                                                { role: "user", emoji: "🛒", title: "Buyer / Consumer", desc: "I want to buy farm-fresh produce", color: "border-cyan-500 bg-cyan-50" },
                                                { role: "labour", emoji: "👷", title: "Labour / Farmhand", desc: "I provide farm work services — specify my role & daily cost", color: "border-orange-500 bg-orange-50" },
                                            ].map(({ role, emoji, title, desc, color }) => (
                                                <button key={role} type="button"
                                                    onClick={() => { setSelectedRole(role); setStep(1); }}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${selectedRole === role ? color : "border-gray-200 bg-white hover:border-gray-300"
                                                        }`}>
                                                    <span className="text-3xl flex-shrink-0">{emoji}</span>
                                                    <div>
                                                        <p className="font-black text-gray-900">{title}</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                                                    </div>
                                                    <span className="ml-auto text-gray-300 text-xl">›</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Header when past step 0 */}
                                {step > 0 && (
                                    <div>
                                        <button type="button" onClick={() => setStep(0)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-bold mb-3 transition">
                                            ‹ Change Role
                                        </button>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'labour' ? 'bg-orange-100' : selectedRole === 'expert' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                                                {selectedRole === 'labour'
                                                    ? <span className="text-xl">👷</span>
                                                    : <GiFarmer className={`h-6 w-6 ${selectedRole === 'expert' ? 'text-indigo-700' : 'text-green-700'}`} />
                                                }
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-black text-gray-900 font-display">
                                                    {selectedRole === "farmer" ? "Farmer" : selectedRole === "expert" ? "Expert" : selectedRole === "labour" ? "Labour" : "Buyer"} Registration
                                                </h1>
                                                <p className="text-gray-500 text-xs">
                                                    Step {step} of {(selectedRole === "user" || selectedRole === "labour") ? 2 : 3} — {["Personal Details", "Account Security", "Identity Verification"][step - 1]}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Step indicator */}
                                        <div className="flex items-center mb-7 mt-4">
                                            <StepDot step={1} current={step} label="Details" />
                                            <StepLine active={step >= 2} />
                                            <StepDot step={2} current={step} label="Security" />
                                            {(selectedRole !== "user" && selectedRole !== "labour") && (<><StepLine active={step >= 3} /><StepDot step={3} current={step} label={selectedRole === "expert" ? "Expertise" : "Verify ID"} /></>)}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 1: Personal Details ── */}
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.form
                                            key="step1"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={nextStep}
                                            className="space-y-4"
                                        >
                                            <div className="relative">
                                                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    required value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    type="text" placeholder="Full Name"
                                                    className="input-field pl-11"
                                                />
                                            </div>
                                            <div className="relative">
                                                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    required value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    type="tel" placeholder="10-digit Mobile Number"
                                                    maxLength={10}
                                                    className="input-field pl-11"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative">
                                                    <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                    <input
                                                        required value={village}
                                                        onChange={(e) => setVillage(e.target.value)}
                                                        type="text" placeholder="Village / City"
                                                        className="input-field pl-11"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        value={state}
                                                        onChange={(e) => setState(e.target.value)}
                                                        type="text" placeholder="State (optional)"
                                                        className="input-field pl-4"
                                                    />
                                                </div>
                                            </div>

                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                className="w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                Continue <MdArrowForward className="h-5 w-5" />
                                            </motion.button>
                                        </motion.form>
                                    )}

                                    {/* ── Step 2: Account Security ── */}
                                    {step === 2 && (
                                        <motion.form
                                            key="step2"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={(selectedRole === "user" || selectedRole === "labour") ? handleSubmit : nextStep}
                                            className="space-y-4"
                                        >
                                            <div className="relative">
                                                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    required value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    type="email" placeholder="Email address"
                                                    className="input-field pl-11"
                                                />
                                            </div>
                                            <div className="relative">
                                                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    required value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    type={showPass ? "text" : "password"}
                                                    placeholder="Create password (min 6 chars)"
                                                    className="input-field pl-11 pr-11"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPass(!showPass)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPass ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                                                </button>
                                            </div>

                                            {/* Password strength */}
                                            {password.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div
                                                                key={i}
                                                                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${password.length >= i * 3
                                                                    ? i <= 1 ? "bg-red-400"
                                                                        : i <= 2 ? "bg-yellow-400"
                                                                            : i <= 3 ? "bg-blue-400"
                                                                                : "bg-green-500"
                                                                    : "bg-gray-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        {password.length < 3 ? "Too short" :
                                                            password.length < 6 ? "Weak" :
                                                                password.length < 9 ? "Fair" :
                                                                    password.length < 12 ? "Good" : "Strong"} password
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={prevStep}
                                                    className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-gray-200 hover:border-green-400 flex items-center justify-center text-gray-500 hover:text-green-600 transition-all"
                                                >
                                                    <MdArrowBack className="h-5 w-5" />
                                                </button>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    className="flex-1 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base transition-all shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                                >
                                                    {(selectedRole === "user" || selectedRole === "labour") ? (selectedRole === "labour" ? "Create Account 👷" : "Create Account 🛒") : <>Continue <MdArrowForward className="h-5 w-5" /></>}
                                                </motion.button>
                                            </div>
                                        </motion.form>
                                    )}

                                    {/* ── Step 3: Identity Verification ── */}
                                    {step === 3 && (
                                        <motion.form
                                            key="step3"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            {/* ── Dynamic AI Doc Verification banner ── */}
                                            {selectedRole === "expert" ? (
                                                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3">
                                                    <FaShieldAlt className="text-indigo-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-indigo-800 text-xs font-bold">AI Identity Verification Required</p>
                                                        <p className="text-indigo-600 text-xs mt-0.5 leading-relaxed">
                                                            Upload proof of your expertise: <strong>Degree Certificate</strong>, <strong>Agriculture ID</strong>, or <strong>Government Issued Agronomist Certificate</strong>. Your name must strictly match what you entered.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : selectedRole === "labour" ? (
                                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
                                                    <FaShieldAlt className="text-orange-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-orange-800 text-xs font-bold">AI Identity Verification Required</p>
                                                        <p className="text-orange-700 text-xs mt-0.5 leading-relaxed">
                                                            Upload your <strong>Aadhaar Card</strong>, <strong>Labour Card</strong>, or <strong>MNREGA Job Card</strong>. Your name must strictly match what you entered.
                                                        </p>
                                                        <p className="text-orange-600 text-xs mt-1 font-medium">
                                                            👷 Your work profile & daily rate will be set up after registration.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                                                    <FaShieldAlt className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-blue-800 text-xs font-bold">AI Identity Verification Required</p>
                                                        <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
                                                            Upload your <strong>Kisan Debit/Credit Card</strong>, <strong>7/12 Utara</strong>,
                                                            or <strong>PM-Kisan document</strong>. Your name must strictly match what you entered.
                                                        </p>
                                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                                            ❌ Aadhaar Card, PAN Card, Voter ID are NOT accepted.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                                    <DocumentUploadPanel
                                                        onFileSelect={handleFileSelect}
                                                        file={docFile}
                                                        verificationResult={verificationResult}
                                                        isVerifying={isVerifying}
                                                        role={selectedRole}
                                                    />

                                                    {verificationError && (
                                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700 text-xs">
                                                            ⚠️ {verificationError}
                                                        </div>
                                                    )}

                                                    {/* Verification gate message */}
                                                    {!verificationResult && !isVerifying && docFile && (
                                                        <p className="text-xs text-gray-400 text-center animate-pulse">
                                                            Waiting for verification result…
                                                        </p>
                                                    )}
                                                    {!docFile && (
                                                        <p className="text-xs text-amber-600 font-medium text-center">
                                                            ⚠️ Document upload is required to create your account
                                                        </p>
                                                    )}

                                                    {/* ── Manual Review Banner (when AI fails) ── */}
                                                    <AnimatePresence>
                                                        {verificationMode === "manual" && docFile && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3"
                                                            >
                                                                <MdAdminPanelSettings className="text-amber-600 h-6 w-6 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-amber-800 text-xs font-bold">AI Verification Unavailable</p>
                                                                    <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                                                                        Your document will be sent to our admin for manual review.
                                                                        Your account will be <strong>activated within 24 hours</strong> once approved.
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={prevStep}
                                                            className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-gray-200 hover:border-green-400 flex items-center justify-center text-gray-500 hover:text-green-600 transition-all"
                                                        >
                                                            <MdArrowBack className="h-5 w-5" />
                                                        </button>

                                                        {/* AI-verified submit */}
                                                        {(verificationMode === "ai" || !verificationMode) && (
                                                            <motion.button
                                                                whileTap={{ scale: 0.98 }}
                                                                type="submit"
                                                                disabled={loading || isVerifying || verificationMode !== "ai"}
                                                                className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${loading || isVerifying || verificationMode !== "ai"
                                                                    ? "bg-gray-300 cursor-not-allowed"
                                                                    : "bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:-translate-y-0.5"
                                                                    }`}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                                        </svg>
                                                                        Creating Account…
                                                                    </>
                                                                ) : isVerifying ? (
                                                                    <>Verifying with AI…</>
                                                                ) : verificationMode === "ai" ? (
                                                                    <><FaCheckCircle className="h-4 w-4" /> Create Verified Account 🌱</>
                                                                ) : (
                                                                    <>Upload Document to Continue</>
                                                                )}
                                                            </motion.button>
                                                        )}

                                                        {/* Manual admin review submit */}
                                                        {verificationMode === "manual" && (
                                                            <motion.button
                                                                whileTap={{ scale: 0.98 }}
                                                                type="submit"
                                                                disabled={loading}
                                                                className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${loading
                                                                    ? "bg-amber-300 cursor-not-allowed"
                                                                    : "bg-amber-500 hover:bg-amber-600 hover:shadow-amber-200 hover:-translate-y-0.5"
                                                                    }`}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                                        </svg>
                                                                        Submitting for Review…
                                                                    </>
                                                                ) : (
                                                                    <><FaClock className="h-4 w-4" /> Submit for Admin Review</>
                                                                )}
                                                            </motion.button>
                                                        )}
                                                    </div>

                                                    <p className="text-center text-xs text-gray-400">
                                                        🔒 Your document is reviewed securely. We never share your data.
                                                    </p>
                                        </motion.form>
                                    )}

                                </AnimatePresence>

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Already have an account?{" "}
                                    <button onClick={() => switchMode("login")} className="text-green-600 font-bold hover:underline">
                                        Sign in
                                    </button>
                                </p>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>
        </div>
        </div >
    );
};

export default AuthPage;
