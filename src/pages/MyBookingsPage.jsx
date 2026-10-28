import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarCheck, 
  Tractor, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  XCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useBookingStore } from "../store/useBookingStore";
import { formatINR, formatDateReadable } from "../utils/formatters";
import toast from "react-hot-toast";

export default function MyBookingsPage() {
  const bookings = useBookingStore((state) => state.bookings);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const [activeTab, setActiveTab] = useState("all");

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleCancel = (bookingId) => {
    if (window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      cancelBooking(bookingId);
      toast.success(`Booking ${bookingId} has been cancelled.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Rental Tracker</span>
            </div>
            <h1 className="text-3xl font-black text-[#17231D] tracking-tight">
              My Machinery Bookings
            </h1>
            <p className="text-sm text-[#647067] mt-1">
              Review and manage your equipment reservations and past farm leases.
            </p>
          </div>

          <Link
            to="/equipment"
            className="px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Tractor className="w-4 h-4 text-[#EAB308]" />
            <span>Book More Equipment</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#E5EAE5] pb-3 overflow-x-auto">
          {["all", "confirmed", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#15803D] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-[#E5EAE5] hover:bg-gray-50"
              }`}
            >
              {tab === "all" ? "All Bookings" : tab} ({
                tab === "all" 
                  ? bookings.length 
                  : bookings.filter(b => b.status.toLowerCase() === tab).length
              })
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isConfirmed = b.status === "Confirmed";
              const isCompleted = b.status === "Completed";
              const isCancelled = b.status === "Cancelled";

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-[#E5EAE5] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EAE5]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={b.imageUrl}
                          alt={b.equipmentName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md">
                            {b.id}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Booked on {formatDateReadable(b.bookedAt)}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#17231D] mt-0.5">
                          {b.equipmentName}
                        </h3>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="self-start sm:self-auto">
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold block">Rental Period:</span>
                      <span className="font-bold text-[#17231D] mt-0.5 block">
                        {b.startDate} to {b.endDate}
                      </span>
                      <span className="text-[11px] text-gray-500">({b.totalDays} Days)</span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block">Total Estimated Cost:</span>
                      <span className="font-black text-base text-[#15803D] mt-0.5 block">
                        {formatINR(b.totalCost)}
                      </span>
                      <span className="text-[11px] text-gray-500">@{formatINR(b.dailyRate)}/day</span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block">Owner / Host:</span>
                      <span className="font-bold text-[#17231D] mt-0.5 block">
                        {b.ownerName}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#15803D]" /> {b.location}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block">Renter Name:</span>
                      <span className="font-bold text-[#17231D] mt-0.5 block">
                        {b.renterName}
                      </span>
                      <span className="text-[11px] text-gray-500">{b.renterPhone}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[#E5EAE5] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${b.ownerPhone || "9822014321"}`}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Call Owner</span>
                      </a>
                      <a
                        href={`https://wa.me/919822014321?text=Hello%20${encodeURIComponent(b.ownerName)},%20inquiring%20about%20booking%20${b.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-[#15803D] hover:bg-emerald-100 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE5] max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#17231D]">No Bookings Found</h3>
            <p className="text-xs text-[#647067]">
              You don't have any {activeTab !== "all" ? activeTab : ""} equipment bookings yet. Rent farm machinery to save thousands this season.
            </p>
            <Link
              to="/equipment"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534]"
            >
              Browse Available Equipment
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
