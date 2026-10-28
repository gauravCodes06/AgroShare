import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { MdVerified, MdStar, MdAccessTime, MdPhone, MdClose } from 'react-icons/md';

export default function ExpertDirectory() {
    const { user, authUser } = useAuthStore();
    const [experts, setExperts] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [bookingNote, setBookingNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsub = onValue(usersRef, (snap) => {
            if (snap.exists()) {
                const allUsers = Object.entries(snap.val()).map(([uid, data]) => ({ uid, ...data }));
                const verifiedExperts = allUsers.filter(u => u.role === 'expert' && u.verificationStatus === 'verified');
                setExperts(verifiedExperts);
            }
        });
        return () => unsub();
    }, []);

    const handleBookSession = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login to book a session');

        setLoading(true);
        try {
            const bookingRef = push(ref(db, `expertBookings/${selectedExpert.uid}`));
            await set(bookingRef, {
                farmerId: authUser.uid,
                farmerName: user.name,
                farmerPhone: user.phone,
                note: bookingNote,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            toast.success(`Booking request sent to ${selectedExpert.name}!`);
            setSelectedExpert(null);
            setBookingNote('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-3">Expert Consultation 👨‍🏫</h1>
                    <p className="text-gray-500 font-medium">Book 1-on-1 sessions with verified agricultural experts.</p>
                </div>

                {experts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                        <span className="text-6xl block mb-4">🌱</span>
                        <h3 className="text-xl font-black text-gray-800 mb-2">No Experts Available</h3>
                        <p className="text-gray-500 text-sm">Our platform is constantly growing. Check back soon for new verified agricultural experts.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experts.map(expert => (
                            <motion.div key={expert.uid} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative">
                                        👨‍🏫
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            <MdVerified className="text-blue-500 w-5 h-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg leading-tight">{expert.name}</h3>
                                        <p className="text-indigo-600 font-bold text-sm">{expert.specialty || 'General Agriculture'}</p>
                                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 mt-1 bg-yellow-50 px-2 py-0.5 rounded w-max">
                                            <MdStar /> 4.8 (12 reviews)
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-5 line-clamp-2">
                                    {expert.bio || `Certified expert from ${expert.state || 'India'} specializing in modern farming.`}
                                </p>
                                <button onClick={() => setSelectedExpert(expert)} className="w-full py-3 rounded-2xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-600 hover:text-white transition">
                                    Book Session
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedExpert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedExpert(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10">
                            <div className="bg-indigo-600 p-6 text-white text-center relative">
                                <button onClick={() => setSelectedExpert(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                                    <MdClose />
                                </button>
                                <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center text-4xl mb-3 shadow-lg">👨‍🏫</div>
                                <h2 className="text-2xl font-black">{selectedExpert.name}</h2>
                                <p className="text-indigo-200 font-medium">{selectedExpert.specialty || 'General Agriculture'}</p>
                            </div>
                            <form onSubmit={handleBookSession} className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                        <MdAccessTime className="text-indigo-400 w-6 h-6" />
                                        <div>
                                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Consultation Type</p>
                                            <p className="text-sm font-bold text-indigo-900">Phone Call / Chat Session</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">What do you need help with?</label>
                                        <textarea required value={bookingNote} onChange={e => setBookingNote(e.target.value)} rows="3"
                                            placeholder="E.g. My tomatoes have black spots, need advice..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-medium" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className={`w-full py-4 rounded-2xl font-black text-white transition ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30'}`}>
                                    {loading ? 'Sending Request...' : 'Confirm Request'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
