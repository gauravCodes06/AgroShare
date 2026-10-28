import React, { useState } from "react";
import { X, PlusCircle, Store } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { PRODUCT_CATEGORIES } from "../data/products";
import toast from "react-hot-toast";

export default function ListProductModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const addProduct = useProductStore((state) => state.addProduct);

  const [form, setForm] = useState({
    name: "",
    category: "Grains & Pulses",
    farmer: "Farmer Demo Seller",
    location: "Baramati, Pune",
    price: "",
    unit: "kg",
    minOrder: 1,
    stock: 100,
    organic: true,
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
  });

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Please provide product name and selling price.");
      return;
    }

    addProduct({
      name: form.name.trim(),
      category: form.category,
      farmer: form.farmer.trim(),
      location: form.location.trim(),
      price: Number(form.price),
      unit: form.unit,
      minOrder: Number(form.minOrder) || 1,
      stock: Number(form.stock) || 50,
      organic: form.organic,
      description: form.description.trim() || "Freshly harvested and naturally packed direct farm produce.",
      imageUrl: form.imageUrl || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
    });

    toast.success("Farm product listed in AgroMarket! 🌾");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5EAE5] shadow-2xl p-6 sm:p-8 my-8">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-[#17231D] hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Direct Farmer Store
          </span>
          <h3 className="text-2xl font-black text-[#17231D] mt-1">
            List Your Farm Produce
          </h3>
          <p className="text-xs text-[#647067]">
            Sell raw crops or value-added foods directly to conscious buyers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Pure Desi Cold-Pressed Sesame Oil"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] bg-white focus:ring-2 focus:ring-[#15803D] outline-none"
              >
                {PRODUCT_CATEGORIES.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 180"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                  required
                />
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="px-2 py-2 text-xs rounded-xl border border-[#E5EAE5] bg-white font-semibold"
                >
                  <option value="kg">/ kg</option>
                  <option value="litre">/ litre</option>
                  <option value="pack">/ pack</option>
                  <option value="can">/ can</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Farmer / Farm Name
              </label>
              <input
                type="text"
                name="farmer"
                value={form.farmer}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Farm Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5EAE5] text-gray-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organic"
              name="organic"
              checked={form.organic}
              onChange={handleChange}
              className="w-4 h-4 text-[#15803D] rounded border-gray-300 focus:ring-[#15803D]"
            />
            <label htmlFor="organic" className="text-xs font-bold text-[#17231D] cursor-pointer">
              Grown organically without chemical pesticides
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-[#E5EAE5] text-sm font-semibold text-[#17231D] hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>List on AgroMarket</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
