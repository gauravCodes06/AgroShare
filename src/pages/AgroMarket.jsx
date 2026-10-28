import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdStorefront, MdOutlineSearch, MdShoppingCart, MdStar,
    MdLocationOn, MdAdd, MdClose, MdArrowForward, MdVerified,
} from 'react-icons/md';
import { ref, push, set, onValue, serverTimestamp } from 'firebase/database';
import { db } from '../firebase';
import useAuthStore from '../store/useAuthStore';
import { compressAndUpload } from '../services/cloudinary';
import toast from 'react-hot-toast';

import { useLocation } from 'react-router-dom';

/* ── Tabs ── */
const TABS = ['All', 'Raw Harvest', 'Value-Added'];

export default function AgroMarket() {
    const { user, authUser } = useAuthStore();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [orderPlacing, setOrderPlacing] = useState(false);

    // Listing form
    const [listing, setListing] = useState({ name: '', type: 'Raw', price: '', unit: 'kg', description: '', quantity: '' });
    const [listingImage, setListingImage] = useState(null);
    const [listingImagePreview, setListingImagePreview] = useState(null);

    // Auto-list from Value Addition
    useEffect(() => {
        if (location.state?.autoList && user?.role === 'farmer') {
            const { productData, brandImageUrl } = location.state;
            setListing({
                name: productData.name || '',
                type: 'Processed',
                price: productData.sellingPrice || (productData.rawPrice * 2) || '',
                unit: 'kg',
                description: `Premium value-added ${productData.crop} product. ${productData.requirements || ''}`,
                quantity: productData.quantity ? `${productData.quantity}` : '',
            });
            if (brandImageUrl) {
                setListingImagePreview(brandImageUrl);
            }
            setShowListingModal(true);
            setActiveTab('Value-Added');

            // Clear history state so it doesn't pop up again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, user]);

    /* ── Load products from Firebase ── */
    useEffect(() => {
        const r = ref(db, 'agromarket/products');
        const unsub = onValue(r, (snap) => {
            if (snap.exists()) {
                const arr = Object.entries(snap.val())
                    .map(([id, v]) => ({ id, ...v }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setProducts(arr);
            } else {
                setProducts([]);
            }
        });
        return () => unsub();
    }, []);

    /* ── Filtered products ── */
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = p.name?.toLowerCase().includes(q) || p.farmerName?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
        if (activeTab === 'Raw Harvest') return p.type === 'Raw' && matchSearch;
        if (activeTab === 'Value-Added') return p.type === 'Processed' && matchSearch;
        return matchSearch;
    });

    /* ── Cart helpers ── */
    const addToCart = (product) => {
        setCart(c => {
            const ex = c.find(i => i.id === product.id);
            if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...c, { ...product, qty: 1 }];
        });
        toast.success(`${product.name} added to cart!`);
    };
    const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
    const updateQty = (id, delta) => setCart(c =>
        c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    /* ── Place order → saves to Firebase, notifies farmer ── */
    const placeOrder = async () => {
        if (!user) { toast.error('Please login to place an order'); return; }
        if (cart.length === 0) return;
        setOrderPlacing(true);
        try {
            // Group by farmer, create one order record per farmer
            const byFarmer = {};
            cart.forEach(item => {
                if (!byFarmer[item.farmerId]) byFarmer[item.farmerId] = [];
                byFarmer[item.farmerId].push(item);
            });

            for (const [farmerId, items] of Object.entries(byFarmer)) {
                const orderTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
                const orderRef = push(ref(db, `orders/${farmerId}`));
                await set(orderRef, {
                    orderId: orderRef.key,
                    buyerId: authUser?.uid,
                    buyerName: user?.name,
                    buyerPhone: user?.phone,
                    items: items.map(i => ({ productId: i.id, name: i.name, price: i.price, unit: i.unit, qty: i.qty })),
                    total: orderTotal,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                });
            }
            toast.success('🎉 Order placed! Farmer will contact you shortly.');
            setCart([]);
            setShowCart(false);
        } catch (err) {
            toast.error('Failed to place order: ' + err.message);
        } finally {
            setOrderPlacing(false);
        }
    };

    /* ── Submit product listing (farmer only) ── */
    const handleListingSubmit = async (e) => {
        e.preventDefault();
        if (user?.role !== 'farmer') { toast.error('Only farmers can list products'); return; }
        if (!listing.name || !listing.price) { toast.error('Fill all required fields'); return; }
        setUploading(true);
        try {
            let imageUrl = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
            if (listingImage) {
                imageUrl = await compressAndUpload(listingImage);
            } else if (listingImagePreview && listingImagePreview.startsWith('http')) {
                imageUrl = listingImagePreview;
            }
            const newRef = push(ref(db, 'agromarket/products'));
            await set(newRef, {
                name: listing.name,
                type: listing.type,
                price: Number(listing.price),
                unit: listing.unit,
                description: listing.description,
                quantity: listing.quantity,
                imageUrl,
                farmerId: authUser?.uid,
                farmerName: user?.name || 'Farmer',
                location: `${user?.village || 'Local'}${user?.state ? `, ${user.state}` : ''}`,
                rating: 4.5,
                createdAt: new Date().toISOString(),
            });
            toast.success('Product listed! 🎉');
            setShowListingModal(false);
            setListing({ name: '', type: 'Raw', price: '', unit: 'kg', description: '', quantity: '' });
            setListingImage(null);
            setListingImagePreview(null);
        } catch (err) {
            toast.error('Failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const isFarmer = user?.role === 'farmer';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-16">
            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white pb-6 md:pb-14 pt-4 md:pt-10 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-4 md:mb-8 gap-3">
                        <div>
                            <div className="hidden md:flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Live Marketplace</span>
                            </div>
                            <h1 className="text-xl md:text-5xl font-black tracking-tight mb-0.5 md:mb-1">AgroMarket 🌾</h1>
                            <p className="hidden md:block text-green-100/80 font-medium text-lg">Farm-fresh, direct. No middlemen.</p>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            {isFarmer && (
                                <button onClick={() => setShowListingModal(true)}
                                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-green-950 font-black px-3.5 py-2.5 rounded-xl text-xs sm:text-base sm:px-5 sm:py-3 sm:rounded-2xl transition shadow-lg shrink-0">
                                    <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" /> List Produce
                                </button>
                            )}
                            <button onClick={() => setShowCart(true)}
                                className="relative bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/20 transition shrink-0">
                                <MdShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Search */}
                    <div className="max-w-2xl relative">
                        <MdOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search crops, products, farmers..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white text-gray-900 font-medium text-xs sm:text-base rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 sm:py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-lg" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 md:-mt-5 relative z-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold whitespace-nowrap text-xs sm:text-sm transition-all shadow-sm flex-shrink-0
                            ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {tab === 'All' ? '🌟 All Products' : tab === 'Raw Harvest' ? '🌾 Raw Harvest' : '🏺 Value-Added'}
                        </button>
                    ))}
                </div>

                {/* Products grid */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">{filtered.length} Product{filtered.length !== 1 ? 's' : ''}</h2>
                    </div>

                    {/* Empty state */}
                    {products.length === 0 && (
                        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                            <MdStorefront className="w-20 h-20 mx-auto opacity-10 mb-4 text-gray-900" />
                            <h3 className="text-xl font-black text-gray-600 mb-2">Marketplace is Empty</h3>
                            <p className="text-gray-400 text-sm mb-6">No products listed yet. Be the first farmer to list your produce!</p>
                            {isFarmer && (
                                <button onClick={() => setShowListingModal(true)}
                                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition">
                                    List Your First Product
                                </button>
                            )}
                        </div>
                    )}

                    {products.length > 0 && filtered.length === 0 && (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-bold">No products match your search.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filtered.map((product) => (
                                <motion.div layout key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                                    <div className="relative h-56 overflow-hidden bg-gray-100">
                                        <img src={product.imageUrl} alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'; }} />
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-md
                                                ${product.type === 'Raw' ? 'bg-amber-100/90 text-amber-900 border border-amber-200' : 'bg-emerald-100/90 text-emerald-900 border border-emerald-200'}`}>
                                                {product.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-gray-900 text-lg leading-tight">{product.name}</h3>
                                            <div className="flex items-center gap-0.5 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold shrink-0 ml-2">
                                                <MdStar className="w-3 h-3" /> {product.rating || 4.5}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mb-2">
                                            <MdLocationOn className="w-3.5 h-3.5" />
                                            <span className="flex items-center gap-1">
                                                {product.farmerName}
                                                <MdVerified className="text-emerald-500 w-3 h-3" />
                                                {product.location && `· ${product.location}`}
                                            </span>
                                        </div>
                                        {product.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>}
                                        {product.quantity && <p className="text-xs text-gray-400 mb-2">Available: {product.quantity}</p>}
                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                                                <span className="text-xs text-gray-500 font-bold ml-1">/{product.unit}</span>
                                            </div>
                                            {/* Only non-farmers can buy */}
                                            {!isFarmer && !isAdmin && (
                                                <button onClick={() => addToCart(product)}
                                                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/30 transition hover:-translate-y-0.5">
                                                    Add to Cart
                                                </button>
                                            )}
                                            {isFarmer && product.farmerId === authUser?.uid && (
                                                <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">Your Listing</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── CART SIDEBAR ── */}
            <AnimatePresence>
                {showCart && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
                            className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col z-10">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900">Cart ({cartCount})</h2>
                                <button onClick={() => setShowCart(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><MdClose className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <MdShoppingCart className="w-16 h-16 mx-auto opacity-20 mb-3" />
                                        <p className="font-bold">Your cart is empty</p>
                                        <p className="text-sm mt-1">Add farm-fresh products to get started</p>
                                    </div>
                                ) : cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=60'; }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">₹{item.price}/{item.unit}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-100">−</button>
                                                <span className="text-sm font-black text-gray-800 w-4 text-center">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-100">+</button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-700 text-sm">₹{item.qty * item.price}</p>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition mt-1"><MdClose className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {cart.length > 0 && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                                    <div className="flex justify-between text-lg font-black text-gray-900">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">The farmer will call you on your registered number to confirm delivery.</p>
                                    <button onClick={placeOrder} disabled={orderPlacing}
                                        className={`w-full py-4 font-black rounded-2xl transition flex items-center justify-center gap-2
                                        ${orderPlacing ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                        {orderPlacing ? 'Placing Order...' : <><span>Place Order</span> <MdArrowForward className="w-5 h-5" /></>}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── LISTING MODAL (Farmer only) ── */}
            <AnimatePresence>
                {showListingModal && isFarmer && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowListingModal(false)} />
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setShowListingModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <MdClose className="w-5 h-5 text-gray-600" />
                            </button>
                            <h2 className="text-2xl font-black text-gray-900 mb-6">List Your Produce 🌾</h2>
                            <form onSubmit={handleListingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Product Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Raw', 'Processed'].map(t => (
                                            <button key={t} type="button" onClick={() => setListing(l => ({ ...l, type: t }))}
                                                className={`py-3 rounded-xl font-bold text-sm transition ${listing.type === t ? 'bg-emerald-600 text-white shadow-md' : 'border-2 border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                {t === 'Raw' ? '🌾 Raw Harvest' : '🏺 Value-Added'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Product Name *</label>
                                    <input required value={listing.name} onChange={e => setListing(l => ({ ...l, name: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                        placeholder="e.g. Organic Wheat" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Price (₹) *</label>
                                        <input required type="number" min="1" value={listing.price} onChange={e => setListing(l => ({ ...l, price: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Per Unit</label>
                                        <select value={listing.unit} onChange={e => setListing(l => ({ ...l, unit: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-200 py-4 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold">
                                            {['kg', 'Quintal', 'Liter', 'Dozen', 'Box', 'Piece'].map(u => <option key={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Quantity Available</label>
                                    <input value={listing.quantity} onChange={e => setListing(l => ({ ...l, quantity: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                        placeholder="e.g. 500 kg" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Description</label>
                                    <textarea rows={2} value={listing.description} onChange={e => setListing(l => ({ ...l, description: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold resize-none"
                                        placeholder="Quality, variety, storage details..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Product Photo</label>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => { const f = e.target.files[0]; setListingImage(f); setListingImagePreview(f ? URL.createObjectURL(f) : null); }} />
                                        {listingImagePreview
                                            ? <img src={listingImagePreview} className="h-32 object-cover rounded-xl mb-2" alt="preview" />
                                            : <><MdAdd className="w-8 h-8 text-emerald-500 mb-2" /><p className="text-sm font-bold text-gray-500">Tap to upload photo</p></>
                                        }
                                    </label>
                                </div>
                                <button type="submit" disabled={uploading}
                                    className={`w-full py-4 font-black rounded-2xl text-white transition flex items-center justify-center gap-2
                                    ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}>
                                    {uploading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : 'Publish Listing 🚀'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FAB for farmer on mobile */}
            {isFarmer && (
                <button onClick={() => setShowListingModal(true)}
                    className="sm:hidden fixed bottom-6 right-6 bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40 z-20 hover:scale-105 transition active:scale-95">
                    <MdAdd className="w-8 h-8" />
                </button>
            )}
        </div>
    );
}
