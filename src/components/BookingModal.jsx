import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  X, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  Info
} from "lucide-react";
import { formatINR, calculateDaysBetween } from "../utils/formatters";
import { useBookingStore } from "../store/useBookingStore";
import useAuthStore from "../store/useAuthStore";
import { db } from "../firebase";
import { ref, set as setDb } from "firebase/database";
import toast from "react-hot-toast";

export default function BookingModal({ equipment, isOpen, onClose, onBookingSuccess }) {
  if (!isOpen || !equipment) return null;

  const { user, authUser } = useAuthStore();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [renterName, setRenterName] = useState(user?.name || (authUser?.email ? authUser.email.split("@")[0] : "Sanjay Deshmukh (Demo Farmer)"));
  const [renterPhone, setRenterPhone] = useState(user?.phone || "9881155443");
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const createBooking = useBookingStore((state) => state.createBooking);

  const totalDays = calculateDaysBetween(startDate, endDate);
  const totalCost = totalDays * (equipment.pricePerDay || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!startDate || !endDate) {
      setErrorMessage("Please select both start and end rental dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage("End date cannot be prior to start date.");
      return;
    }

    if (totalDays <= 0) {
      setErrorMessage("Rental duration must be at least 1 day.");
      return;
    }

    if (!renterName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    // Call store booking creator (which includes conflict prevention)
    const result = createBooking({
      equipment,
      startDate,
      endDate,
      totalDays,
      totalCost,
      renterName,
      renterPhone
    });

    if (!result.success) {
      setErrorMessage(result.error);
      toast.error(result.error, { duration: 5000 });
      return;
    }

    // Persist to Firebase Realtime Database
    setDb(ref(db, `bookings/${result.booking.id}`), {
      ...result.booking,
      renterUid: authUser?.uid || null
    }).catch((err) => console.warn("Realtime DB booking write:", err.message));

    // Success!
    setBookingConfirmed(result.booking);
    toast.success(`Booking Confirmed! Ref: ${result.booking.id}`, { duration: 4000 });
    if (onBookingSuccess) onBookingSuccess(result.booking);
  };

  const handleClose = () => {
    setBookingConfirmed(null);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5EAE5] shadow-2xl p-6 sm:p-8 my-8 transition-all">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-[#17231D] hover:bg-gray-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ─── State 1: Booking Success Screen ─────────────────────────────── */}
        {bookingConfirmed ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#15803D] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full">
                Booking Confirmed
              </span>
              <h3 className="text-2xl font-black text-[#17231D]">
                Reservation Success!
              </h3>
              <p className="text-sm text-[#647067]">
                Reference ID: <strong className="text-[#17231D] font-mono">{bookingConfirmed.id}</strong>
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-[#F7F9F5] rounded-2xl border border-[#E5EAE5] p-4 text-left space-y-2 text-xs text-[#17231D]">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Equipment:</span>
                <span className="font-bold">{bookingConfirmed.equipmentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Dates:</span>
                <span className="font-semibold">{bookingConfirmed.startDate} to {bookingConfirmed.endDate} ({bookingConfirmed.totalDays} Days)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Owner:</span>
                <span className="font-semibold">{bookingConfirmed.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-extrabold text-[#15803D]">
                <span>Total Estimated Cost:</span>
                <span>{formatINR(bookingConfirmed.totalCost)}</span>
              </div>
            </div>

            {/* Direct Owner Contact Card */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>Contact Owner Directly (Demo Simulation)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Owner Phone: <strong>{bookingConfirmed.ownerPhone || "+91 98220 14321"}</strong>
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${bookingConfirmed.ownerPhone || "9822014321"}`}
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Owner
                </a>
                <a
                  href={`https://wa.me/919822014321?text=Hello%20${encodeURIComponent(bookingConfirmed.ownerName)},%20I%20have%20booked%20your%20${encodeURIComponent(bookingConfirmed.equipmentName)}%20via%20Farm2Value%20(Ref:%20${bookingConfirmed.id})`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                to="/my-bookings"
                className="flex-1 py-3 px-4 rounded-xl bg-[#15803D] text-white text-sm font-bold text-center hover:bg-[#166534] transition-all"
              >
                View My Bookings
              </Link>
              <button
                onClick={handleClose}
                className="py-3 px-4 rounded-xl border border-[#E5EAE5] text-[#17231D] text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ─── State 2: Booking Input Form ───────────────────────────────── */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                AgroShare Booking
              </span>
              <h3 className="text-xl font-black text-[#17231D] mt-1">
                Book {equipment.name}
              </h3>
              <p className="text-xs text-[#647067]">
                Owner: {equipment.ownerName} · {equipment.village}, {equipment.district}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Renter Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={renterPhone}
                  onChange={(e) => setRenterPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] outline-none"
                  required
                />
              </div>
            </div>

            {/* Cost Breakdown Calculation Box */}
            <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Daily Rental Rate:</span>
                <span className="font-bold text-[#17231D]">{formatINR(equipment.pricePerDay)} / day</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total Rental Duration:</span>
                <span className="font-bold text-[#17231D]">{totalDays} Day{totalDays > 1 ? "s" : ""}</span>
              </div>
              <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#17231D]">Estimated Total:</span>
                <span className="text-2xl font-black text-[#15803D]">{formatINR(totalCost)}</span>
              </div>
            </div>

            {/* Architecture Notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Demo Concurrency Notice:</strong> Bookings validate date overlap locally in browser memory. Production requires server-side ACID transactions.
              </span>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 py-3 px-4 rounded-xl border border-[#E5EAE5] text-sm font-semibold text-[#17231D] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={totalDays <= 0}
                className="w-2/3 py-3 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:bg-gray-300 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
