import React, { useState } from "react";
import { X, PlusCircle, Image, Sparkles } from "lucide-react";
import { useEquipmentStore } from "../store/useEquipmentStore";
import useAuthStore from "../store/useAuthStore";
import { db } from "../firebase";
import { ref, set as setDb } from "firebase/database";
import { EQUIPMENT_CATEGORIES } from "../data/equipment";
import toast from "react-hot-toast";

const IMAGE_PRESETS = [
  { label: "Red Tractor", url: "https://images.unsplash.com/photo-1780332514648-516e9dad94c6?auto=format&fit=crop&w=800&q=80" },
  { label: "Green Tractor", url: "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=800&q=80" },
  { label: "Harvester", url: "https://images.unsplash.com/photo-1716445867588-105a60770e1d?auto=format&fit=crop&w=800&q=80" },
  { label: "Rotavator", url: "https://images.unsplash.com/photo-1774351923106-efc3173ec4ad?auto=format&fit=crop&w=800&q=80" },
  { label: "Boom Sprayer", url: "https://images.unsplash.com/photo-1755931359594-852c73c6609c?auto=format&fit=crop&w=800&q=80" },
  { label: "Seed Drill", url: "https://images.unsplash.com/photo-1787048607799-a205a6749a50?auto=format&fit=crop&w=800&q=80" },
  { label: "MB Plough", url: "https://images.unsplash.com/photo-1660391029076-00aebf4ffd96?auto=format&fit=crop&w=800&q=80" },
];

export default function ListEquipmentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, authUser } = useAuthStore();
  const addEquipment = useEquipmentStore((state) => state.addEquipment);

  const [form, setForm] = useState({
    name: "",
    category: "Tractors",
    pricePerDay: "",
    ownerName: user?.name || (authUser?.email ? authUser.email.split("@")[0] : "Farmer Demo Host"),
    phone: user?.phone || "+91 98220 54321",
    village: user?.village || "Baramati",
    district: user?.district || "Pune",
    description: "",
    imageUrl: IMAGE_PRESETS[0].url,
    power: "45 HP"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.pricePerDay) {
      toast.error("Please fill in equipment name and daily rental rate.");
      return;
    }

    const newEquipmentItem = {
      name: form.name.trim(),
      category: form.category,
      pricePerDay: Number(form.pricePerDay),
      ownerName: form.ownerName.trim(),
      ownerUid: authUser?.uid || null,
      phone: form.phone.trim(),
      village: form.village.trim(),
      district: form.district.trim(),
      description: form.description.trim() || "Clean, fully functional agricultural machinery ready for immediate seasonal lease.",
      imageUrl: form.imageUrl || IMAGE_PRESETS[0].url,
      power: form.power || "Standard HP",
      state: "Maharashtra"
    };

    addEquipment(newEquipmentItem);

    // Persist to Firebase Realtime Database
    const eqId = `eq-${Date.now()}`;
    setDb(ref(db, `equipment/${eqId}`), { id: eqId, ...newEquipmentItem })
      .catch((err) => console.warn("Realtime DB equipment write:", err.message));

    toast.success("Machinery listed and synced to Realtime DB! 🎉");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5EAE5] shadow-2xl p-6 sm:p-8 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-[#17231D] hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Equipment Owner Hub
          </span>
          <h3 className="text-2xl font-black text-[#17231D] mt-1">
            List Your Machinery
          </h3>
          <p className="text-xs text-[#647067]">
            Earn extra income from idle tractors, rotavators, and implements.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Equipment Name & Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Swaraj 744 FE Tractor (48 HP)"
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
                {EQUIPMENT_CATEGORIES.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Rental Price per Day (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Village / Taluka
              </label>
              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleChange}
                placeholder="e.g. Baramati"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Pune"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Owner Contact Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98220 00000"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
              />
            </div>
          </div>

          {/* Quick Photo Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#17231D]">
                Select Machinery Photo
              </label>
              <span className="text-[11px] text-gray-500">Quick Presets</span>
            </div>
            <div className="flex gap-2 mb-2">
              {IMAGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: p.url })}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                    form.imageUrl === p.url
                      ? "border-[#15803D] bg-emerald-50 text-[#15803D] font-bold"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Or enter custom image URL"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5EAE5] text-gray-700 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Short Description / Usage Terms
            </label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Equipped with power steering, operator available on demand."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
            />
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
              <PlusCircle className="w-4 h-4" />
              <span>Publish Machinery</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
