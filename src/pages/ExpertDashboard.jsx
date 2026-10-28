import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdPhone, MdCheckCircle, MdSchedule, MdPerson, MdChat } from 'react-icons/md';
import { FaBrain, FaRupeeSign } from 'react-icons/fa';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SPECIALTIES = ['Soil Science', 'Crop Disease', 'Value Addition & Processing', 'Organic Farming', 'Market Linkage', 'Irrigation & Water Management'];

const StatusBadge = ({ status }) => {
    const styles = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels = { pending: '⏳ Pending', confirmed: '📅 Confirmed', completed: '✅ Completed', rejected: '❌ Rejected' };
    return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
};

export default function ExpertDashboard() {
    const { user, authUser } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
    const [activeNoteIdx, setActiveNoteIdx] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [profile, setProfile] = useState({ specialty: user?.specialty || '', bio: user?.bio || '', experience: user?.experience || '' });

    useEffect(() => {
        if (!authUser?.uid) return;
        const r = ref(db, `expertBookings/${authUser.uid}`);
        const unsub = onValue(r, (snap) => {
            if (snap.exists()) {
                const mine = Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(mine);
            } else {
                setBookings([]);
            }
        });
        return () => unsub();
    }, [authUser?.uid]);

    const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 199), 0);
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    const updateBookingStatus = async (bookingId, status) => {
        await set(ref(db, `expertBookings/${authUser.uid}/${bookingId}/status`), status);
        toast.success(`Consultation ${status}!`);
    };

    const toggleAvailability = async () => {
        const next = !isAvailable;
        setIsAvailable(next);
        await set(ref(db, `users/${authUser.uid}/isAvailable`), next);
        toast(next ? 'You are now available!' : 'You are now offline.', { icon: next ? '🟢' : '🔴' });
    };

    const handleProfileSave = async () => {
        await set(ref(db, `users/${authUser.uid}/specialty`), profile.specialty);
        await set(ref(db, `users/${authUser.uid}/bio`), profile.bio);
        await set(ref(db, `users/${authUser.uid}/experience`), profile.experience);
        toast.success('Profile updated!');
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white px-6 py-10 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">Expert Portal</p>
                        <h1 className="text-3xl md:text-4xl font-black">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-indigo-200 mt-1">{user?.specialty || 'Agricultural Expert'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-indigo-200 font-bold">Availability:</span>
                        <button onClick={toggleAvailability} className={`relative w-14 h-7 rounded-full transition-colors ${isAvailable ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                            <motion.div animate={{ x: isAvailable ? 28 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                        </button>
                        <span className={`text-sm font-black ${isAvailable ? 'text-emerald-400' : 'text-gray-400'}`}>{isAvailable ? 'Available' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Bookings', value: bookings.length, icon: <MdPerson className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600' },
                        { label: 'Pending', value: pendingCount, icon: <MdSchedule className="w-6 h-6" />, color: 'from-amber-400 to-orange-500' },
                        { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: <MdCheckCircle className="w-6 h-6" />, color: 'from-emerald-500 to-green-600' },
                        { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: <FaRupeeSign className="w-5 h-5" />, color: 'from-purple-500 to-violet-600' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-black text-gray-900 mb-4">Consultation Requests</h2>
                        {bookings.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 shadow-sm">
                                <MdChat className="w-16 h-16 mx-auto opacity-20 mb-3" />
                                <p className="font-bold">No consultation requests yet.</p>
                                <p className="text-sm mt-1">Bookings from Farmers will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking, i) => (
                                    <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="font-black text-gray-900">{booking.farmerName || booking.userName}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">📞 {booking.farmerPhone || booking.userPhone || 'Not provided'}</p>
                                            </div>
                                            <StatusBadge status={booking.status} />
                                        </div>

                                        {(booking.farmerPhone || booking.userPhone) && (
                                            <div className="flex gap-2 mb-3">
                                                <a href={`https://wa.me/91${booking.farmerPhone || booking.userPhone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center flex-1 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition">WhatsApp message</a>
                                                <a href={`tel:${booking.farmerPhone || booking.userPhone}`} className="flex items-center justify-center flex-1 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-200 transition">Call Farmer</a>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm mb-3">
                                            <span className="font-bold text-indigo-700">₹{booking.price || 199} consultation</span>
                                            <span className="text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="flex-1 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition">Accept</button>
                                                <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="flex-1 py-2 bg-red-100 text-red-700 text-xs font-black rounded-xl hover:bg-red-200 transition">Decline</button>
                                            </div>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="w-full py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition">Mark as Completed ✓</button>
                                        )}
                                        {activeNoteIdx === booking.id ? (
                                            <div className="mt-3 space-y-2">
                                                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Write consultation notes..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => { toast.success('Notes saved!'); setActiveNoteIdx(null); }} className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Save</button>
                                                    <button onClick={() => setActiveNoteIdx(null)} className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setActiveNoteIdx(booking.id); setNoteText(''); }} className="mt-2 text-xs text-gray-400 hover:text-indigo-600 font-semibold transition">+ Add Notes</button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 mb-4">Expert Profile</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Specialty</label>
                                    <select value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                        <option value="">Select specialty...</option>
                                        {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Experience</label>
                                    <input value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 10 years" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Bio</label>
                                    <textarea rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Brief professional bio..." />
                                </div>
                                <button onClick={handleProfileSave} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-md">Save Profile</button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-5">
                            <h3 className="font-black text-indigo-900 mb-3 flex items-center gap-2"><FaBrain className="text-indigo-500" /> Expert Tips</h3>
                            <ul className="space-y-2 text-xs text-indigo-700 font-semibold">
                                <li>✓ Respond to bookings within 24 hours</li>
                                <li>✓ Set yourself offline when unavailable</li>
                                <li>✓ Write detailed notes after each session</li>
                                <li>✓ Mark sessions complete to track earnings</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
