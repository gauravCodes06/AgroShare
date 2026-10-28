import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdShoppingCart, MdFavorite, MdLocationOn, MdStar, MdPerson, MdSettings, MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';

const MOCK_ORDERS = [
    { id: 'o1', product: 'Organic Wheat', farmer: 'Suresh Kumar', qty: '50 kg', total: 1400, status: 'delivered', date: '2026-04-08' },
    { id: 'o2', product: 'Turmeric Powder', farmer: 'Kisan Traders', qty: '5 kg', total: 1750, status: 'in-transit', date: '2026-04-10' },
    { id: 'o3', product: 'Fresh Strawberries', farmer: 'Priya Desai', qty: '3 kg', total: 600, status: 'processing', date: '2026-04-11' },
];

const ORDER_STATUS = {
    delivered: { label: '✅ Delivered', cls: 'bg-green-100 text-green-700' },
    'in-transit': { label: '🚚 In Transit', cls: 'bg-blue-100 text-blue-700' },
    processing: { label: '⏳ Processing', cls: 'bg-amber-100 text-amber-700' },
    cancelled: { label: '❌ Cancelled', cls: 'bg-red-100 text-red-700' },
};

export default function UserDashboard() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('orders');

    const TABS = [
        { id: 'orders', label: '📦 Orders', icon: MdShoppingCart },
        { id: 'profile', label: '👤 Profile', icon: MdPerson },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-16">
            {/* Header */}
            <div className="bg-gradient-to-br from-cyan-900 via-teal-800 to-emerald-900 text-white px-6 py-10 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest mb-1">Buyer Dashboard</p>
                    <h1 className="text-3xl md:text-4xl font-black">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-cyan-100/80 mt-1 text-base">Your personal agri-commerce hub.</p>
                    <div className="flex gap-3 mt-6">
                        <Link to="/agromarket" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-green-950 font-black px-5 py-2.5 rounded-2xl transition text-sm shadow-lg hover:-translate-y-0.5">
                            Shop AgroMarket <MdArrowForward className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: MOCK_ORDERS.length, color: 'from-cyan-500 to-teal-600', icon: '📦' },
                        { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'delivered').length, color: 'from-emerald-500 to-green-600', icon: '✅' },
                        { label: 'In Transit', value: MOCK_ORDERS.filter(o => o.status === 'in-transit').length, color: 'from-blue-500 to-indigo-600', icon: '🚚' },
                        { label: 'Total Spent', value: `₹${MOCK_ORDERS.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}`, color: 'from-purple-500 to-violet-600', icon: '💰' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1 w-fit shadow-sm">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900">Your Orders</h2>
                        {MOCK_ORDERS.map((order, i) => (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div>
                                        <p className="font-black text-gray-900 text-lg">{order.product}</p>
                                        <p className="text-gray-500 text-sm">From: <span className="font-bold text-gray-700">{order.farmer}</span></p>
                                        <p className="text-gray-400 text-xs mt-1">Qty: {order.qty} · Ordered: {new Date(order.date).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-3 sm:gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ORDER_STATUS[order.status]?.cls}`}>{ORDER_STATUS[order.status]?.label}</span>
                                        <span className="font-black text-emerald-700 text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-lg">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Profile Information</h2>
                        <div className="flex items-center gap-4 mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                                {user?.name?.[0] || '?'}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 text-lg">{user?.name}</p>
                                <p className="text-teal-600 font-bold text-sm capitalize">{user?.role}</p>
                                <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Phone', value: user?.phone || 'Not set' },
                                { label: 'Location', value: `${user?.village || ''}${user?.state ? `, ${user.state}` : ''}` || 'Not set' },
                                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-none">
                                    <span className="text-gray-500 font-semibold">{item.label}</span>
                                    <span className="font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
