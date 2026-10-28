import { create } from "zustand";
import { doDateRangesOverlap, generateBookingReference } from "../utils/formatters";

const STORAGE_KEY = "f2v_bookings";

const SEED_BOOKINGS = [
  {
    id: "F2V-BK-10492",
    equipmentId: "eq-1",
    equipmentName: "Mahindra 575 DI Tractor (45 HP)",
    category: "Tractors",
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    ownerName: "Balasaheb Patil",
    ownerPhone: "+91 98220 14321",
    renterName: "Sanjay Deshmukh (Demo Farmer)",
    renterPhone: "+91 98811 55443",
    startDate: "2026-11-02",
    endDate: "2026-11-04",
    totalDays: 3,
    dailyRate: 1200,
    totalCost: 3600,
    status: "Confirmed",
    bookedAt: "2026-10-26T10:30:00.000Z",
    location: "Baramati, Pune"
  },
  {
    id: "F2V-BK-09281",
    equipmentId: "eq-3",
    equipmentName: "Shaktiman Regular Plus Rotavator (6 Feet)",
    category: "Rotavators",
    imageUrl: "https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80",
    ownerName: "Sambhaji Kadam",
    ownerPhone: "+91 97654 32109",
    renterName: "Sanjay Deshmukh (Demo Farmer)",
    renterPhone: "+91 98811 55443",
    startDate: "2026-10-18",
    endDate: "2026-10-19",
    totalDays: 2,
    dailyRate: 650,
    totalCost: 1300,
    status: "Completed",
    bookedAt: "2026-10-15T14:15:00.000Z",
    location: "Karad, Satara"
  }
];

function getStoredBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load bookings from localStorage", e);
  }
  return SEED_BOOKINGS;
}

export const useBookingStore = create((set, get) => ({
  bookings: getStoredBookings(),

  /**
   * Adds a new booking with conflict validation
   */
  createBooking: ({
    equipment,
    startDate,
    endDate,
    totalDays,
    totalCost,
    renterName = "Sanjay Deshmukh (Demo Farmer)",
    renterPhone = "+91 98811 55443"
  }) => {
    const currentBookings = get().bookings;

    // Check for conflicting active/confirmed bookings for the same equipment
    const conflict = currentBookings.find((b) => {
      if (b.equipmentId !== equipment.id) return false;
      if (b.status === "Cancelled") return false;
      return doDateRangesOverlap(startDate, endDate, b.startDate, b.endDate);
    });

    if (conflict) {
      return {
        success: false,
        error: `Equipment is already booked from ${conflict.startDate} to ${conflict.endDate} (Ref: ${conflict.id}). Please select alternative dates.`
      };
    }

    const newBooking = {
      id: generateBookingReference(),
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      category: equipment.category,
      imageUrl: equipment.imageUrl,
      ownerName: equipment.ownerName,
      ownerPhone: equipment.phone,
      renterName,
      renterPhone,
      startDate,
      endDate,
      totalDays,
      dailyRate: equipment.pricePerDay,
      totalCost,
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
      location: `${equipment.village}, ${equipment.district}`
    };

    const updated = [newBooking, ...currentBookings];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save bookings", e);
    }

    set({ bookings: updated });
    return { success: true, booking: newBooking };
  },

  cancelBooking: (bookingId) => {
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "Cancelled" } : b
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update booking status", e);
      }
      return { bookings: updated };
    });
  }
}));
