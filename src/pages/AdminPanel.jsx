import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, remove, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
    MdPeople, MdBookOnline, MdTrendingUp,
    MdDelete, MdCheckCircle, MdBlock, MdDashboard,
    MdVerified, MdHourglassEmpty, MdClose, MdOpenInNew,
} from "react-icons/md";
import { FaTractor, FaShieldAlt, FaClock } from "react-icons/fa";

const TABS = ["dashboard", "verifications", "equipment", "bookings", "users"];

const AdminPanel = () => {
    const [tab, setTab] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [requests, setRequests] = useState([]); // pending verification requests
    const [selectedRequest, setSelectedRequest] = useState(null); // for modal

    useEffect(() => {
        const subs = [
            onValue(ref(db, "users"), (s) => setUsers(s.exists() ? Object.keys(s.val()).map((k) => ({ id: k, ...s.val()[k] })) : [])),
            onValue(ref(db, "equipment"), (s) => setEquipment(s.exists() ? Object.keys(s.val()).map((k) => ({ id: k, ...s.val()[k] })) : [])),
            onValue(ref(db, "bookings"), (s) => setBookings(s.exists() ? Object.keys(s.val()).map((k) => ({ id: k, ...s.val()[k] })) : [])),
            onValue(ref(db, "verificationRequests"), (s) =>
                setRequests(s.exists() ? Object.keys(s.val()).map((k) => ({ id: k, ...s.val()[k] })) : [])
            ),
        ];
        return () => subs.forEach((u) => u());
    }, []);

    // ── Equipment actions ──
    const approveEquipment = async (id) => { await set(ref(db, `equipment/${id}/status`), "approved"); toast.success("Equipment approved ✓"); };
    const rejectEquipment = async (id) => { await set(ref(db, `equipment/${id}/status`), "rejected"); toast.error("Equipment rejected"); };
    const deleteEquipment = async (id) => { if (!confirm("Delete this equipment?")) return; await remove(ref(db, `equipment/${id}`)); toast.success("Deleted"); };
    const updateBookingStatus = async (id, status) => { await set(ref(db, `bookings/${id}/status`), status); toast.success(`Booking ${status}`); };

    // ── Farmer verification actions ──
    const approveVerification = async (req) => {
        // Activate the user account
        await set(ref(db, `users/${req.uid}/verificationStatus`), "verified");
        await set(ref(db, `users/${req.uid}/verifiedBy`), "admin");
        await set(ref(db, `users/${req.uid}/verifiedAt`), new Date().toISOString());
        // Update the request status
        await set(ref(db, `verificationRequests/${req.uid}/status`), "approved");
        await set(ref(db, `verificationRequests/${req.uid}/reviewedAt`), new Date().toISOString());
        toast.success(`${req.name}'s account has been activated ✓`, { icon: "🎉" });
        setSelectedRequest(null);
    };

    const rejectVerification = async (req) => {
        await set(ref(db, `users/${req.uid}/verificationStatus`), "rejected");
        await set(ref(db, `verificationRequests/${req.uid}/status`), "rejected");
        await set(ref(db, `verificationRequests/${req.uid}/reviewedAt`), new Date().toISOString());
        toast.error(`${req.name}'s verification rejected`);
        setSelectedRequest(null);
    };

    const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + (b.totalPrice || 0), 0);
    const pendingVerifications = requests.filter((r) => r.status === "pending");

    const STATS = [
        { label: "Total Users", value: users.length, icon: <MdPeople />, color: "from-blue-500 to-blue-600" },
        { label: "Equipment", value: equipment.length, icon: <FaTractor />, color: "from-green-500 to-green-600" },
        { label: "Bookings", value: bookings.length, icon: <MdBookOnline />, color: "from-purple-500 to-purple-600" },
        { label: "Pending IDs", value: pendingVerifications.length, icon: <FaClock />, color: "from-amber-500 to-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <MdDashboard className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 font-display">Admin Panel</h1>
                        <p className="text-sm text-gray-500">Full system control</p>
                    </div>
                </div>

                {/* Tab nav */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm flex-wrap">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`relative px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${tab === t ? "bg-green-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t}
                            {t === "verifications" && pendingVerifications.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-black">
                                    {pendingVerifications.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ─── DASHBOARD TAB ─── */}
                {tab === "dashboard" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {STATS.map((s, i) => (
                                <motion.div key={i} whileHover={{ y: -5 }}
                                    className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 text-white shadow-lg`}>
                                    <div className="text-4xl mb-3 opacity-90">{s.icon}</div>
                                    <p className="text-3xl font-black">{s.value}</p>
                                    <p className="text-sm font-medium opacity-80 mt-1">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pending verifications quick view */}
                        {pendingVerifications.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                        <MdHourglassEmpty className="h-5 w-5" />
                                        {pendingVerifications.length} Farmer{pendingVerifications.length > 1 ? "s" : ""} Awaiting Verification
                                    </h3>
                                    <button onClick={() => setTab("verifications")}
                                        className="text-xs text-amber-700 font-bold underline hover:text-amber-900 flex items-center gap-1">
                                        Review All <MdOpenInNew className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {pendingVerifications.slice(0, 3).map((r) => (
                                        <div key={r.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                                                <p className="text-xs text-gray-400">{r.village} · {r.submittedAt ? format(new Date(r.submittedAt), "MMM dd, hh:mm a") : "—"}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => approveVerification(r)}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-1">
                                                    <MdCheckCircle className="h-4 w-4" /> Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending equipment */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">⏳ Pending Equipment Approval</h3>
                            {equipment.filter((e) => e.status === "pending").length === 0 ? (
                                <p className="text-gray-400 text-sm py-4 text-center">All equipment reviewed 🎉</p>
                            ) : (
                                <div className="space-y-3">
                                    {equipment.filter((e) => e.status === "pending").map((eq) => (
                                        <div key={eq.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{eq.name}</p>
                                                <p className="text-sm text-gray-500">{eq.type} · {eq.ownerName} · ₹{eq.price}/hr</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => approveEquipment(eq.id)} className="btn-primary text-sm py-1.5 px-3">Approve</button>
                                                <button onClick={() => rejectEquipment(eq.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── VERIFICATIONS TAB ─── */}
                {tab === "verifications" && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <FaShieldAlt className="text-green-600 h-5 w-5" />
                            <h2 className="font-black text-gray-900 text-lg">Farmer Identity Verification Requests</h2>
                        </div>

                        {requests.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                <MdVerified className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                <p className="font-bold text-gray-700">No verification requests</p>
                                <p className="text-gray-400 text-sm mt-1">All farmers are verified or no pending submissions.</p>
                            </div>
                        )}

                        {requests.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {requests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        whileHover={{ y: -3 }}
                                        className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 ${req.status === "pending" ? "border-amber-200" :
                                                req.status === "approved" ? "border-green-200" : "border-red-200"
                                            }`}
                                    >
                                        {/* Status badge */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
                                                    {req.name?.charAt(0)?.toUpperCase() || "F"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{req.name}</p>
                                                    <p className="text-xs text-gray-400">{req.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${req.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                    req.status === "approved" ? "bg-green-100 text-green-700" :
                                                        "bg-red-100 text-red-700"
                                                }`}>
                                                {req.status === "pending" ? "⏳ Pending" : req.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-gray-400">Phone</p>
                                                <p className="font-semibold text-gray-700">{req.phone}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-gray-400">Village</p>
                                                <p className="font-semibold text-gray-700">{req.village || "—"}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-gray-400">State</p>
                                                <p className="font-semibold text-gray-700">{req.state || "—"}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-gray-400">Submitted</p>
                                                <p className="font-semibold text-gray-700">
                                                    {req.submittedAt ? format(new Date(req.submittedAt), "MMM dd, hh:mm a") : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Document thumbnail */}
                                        {req.docThumbnail && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-500">Submitted Document</p>
                                                <div
                                                    className="relative cursor-pointer group"
                                                    onClick={() => setSelectedRequest(req)}
                                                >
                                                    <img
                                                        src={req.docThumbnail}
                                                        alt="ID Document"
                                                        className="w-full h-32 object-cover rounded-xl border border-gray-200 group-hover:opacity-90 transition"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 rounded-xl">
                                                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                                                            Click to view full size
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI error note */}
                                        {req.aiError && (
                                            <p className="text-xs text-gray-400 italic">
                                                AI error: {req.aiError.slice(0, 80)}…
                                            </p>
                                        )}

                                        {/* Action buttons */}
                                        {req.status === "pending" && (
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => approveVerification(req)}
                                                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow"
                                                >
                                                    <MdCheckCircle className="h-4 w-4" /> Approve & Activate
                                                </button>
                                                <button
                                                    onClick={() => rejectVerification(req)}
                                                    className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center gap-2 transition"
                                                >
                                                    <MdClose className="h-4 w-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== "pending" && (
                                            <p className="text-xs text-center text-gray-400">
                                                Reviewed {req.reviewedAt ? format(new Date(req.reviewedAt), "MMM dd, hh:mm a") : ""}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── EQUIPMENT TAB ─── */}
                {tab === "equipment" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">All Equipment ({equipment.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Name", "Type", "Owner", "Price/hr", "Location", "Status", "Actions"].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {equipment.map((eq) => (
                                        <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {eq.imageUrl && <img src={eq.imageUrl} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <p className="font-semibold text-gray-900 text-sm">{eq.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{eq.type}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{eq.ownerName || "—"}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-green-700">₹{eq.price}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500 max-w-[120px] truncate">{eq.location?.address || eq.location}</td>
                                            <td className="px-5 py-4">
                                                <span className={`badge ${eq.status === "approved" ? "badge-green" : eq.status === "rejected" ? "badge-red" : "badge-yellow"}`}>
                                                    {eq.status || "pending"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    {eq.status !== "approved" && (
                                                        <button onClick={() => approveEquipment(eq.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="Approve">
                                                            <MdCheckCircle className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => deleteEquipment(eq.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Delete">
                                                        <MdDelete className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── BOOKINGS TAB ─── */}
                {tab === "bookings" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">All Bookings ({bookings.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Equipment", "User", "Date", "Duration", "Amount", "Status", "Actions"].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900">{b.equipmentName}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{b.userId?.slice(0, 8)}...</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{b.startTime ? format(new Date(b.startTime), "MMM dd") : b.date}</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{b.duration}h</td>
                                            <td className="px-5 py-4 text-sm font-bold text-green-700">₹{b.totalPrice}</td>
                                            <td className="px-5 py-4">
                                                <span className={`badge ${b.status === "confirmed" ? "badge-green" : b.status === "cancelled" ? "badge-red" : "badge-yellow"}`}>{b.status}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {b.status === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateBookingStatus(b.id, "confirmed")} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition">Confirm</button>
                                                        <button onClick={() => updateBookingStatus(b.id, "cancelled")} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition">Cancel</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── USERS TAB ─── */}
                {tab === "users" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {users.map((u) => (
                            <motion.div key={u.id} whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">👤</div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-gray-900 truncate">{u.name}</p>
                                    <p className="text-sm text-gray-400 truncate mt-0.5">{u.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">{u.village}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <span className={`badge ${u.role === "admin" ? "badge-red" : u.role === "owner" ? "badge-blue" : "badge-green"}`}>{u.role}</span>
                                        {u.verificationStatus && (
                                            <span className={`badge ${u.verificationStatus === "verified" ? "badge-green" :
                                                    u.verificationStatus === "pending_admin" ? "badge-yellow" :
                                                        u.verificationStatus === "rejected" ? "badge-red" : "badge-yellow"
                                                }`}>
                                                {u.verificationStatus === "verified" ? "✓ verified" :
                                                    u.verificationStatus === "pending_admin" ? "⏳ pending" :
                                                        u.verificationStatus === "rejected" ? "✗ rejected" : u.verificationStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Document Full-Size Modal ─── */}
            <AnimatePresence>
                {selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setSelectedRequest(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">{selectedRequest.name}</h3>
                                    <p className="text-sm text-gray-400">{selectedRequest.email} · {selectedRequest.village}</p>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
                                    <MdClose className="h-5 w-5" />
                                </button>
                            </div>

                            {selectedRequest.docThumbnail && (
                                <img
                                    src={selectedRequest.docThumbnail}
                                    alt="ID Document full view"
                                    className="w-full rounded-2xl border border-gray-200 object-contain max-h-80"
                                />
                            )}

                            {selectedRequest.status === "pending" && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => approveVerification(selectedRequest)}
                                        className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
                                    >
                                        <MdCheckCircle className="h-5 w-5" /> Approve & Activate Account
                                    </button>
                                    <button
                                        onClick={() => rejectVerification(selectedRequest)}
                                        className="flex-1 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <MdClose className="h-5 w-5" /> Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
