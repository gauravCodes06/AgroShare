import { create } from "zustand";
import { INITIAL_EQUIPMENT } from "../data/equipment";

const STORAGE_KEY = "f2v_equipment";

function fixEquipmentImages(items) {
  const initialMap = new Map(INITIAL_EQUIPMENT.map((eq) => [eq.id, eq.imageUrl]));
  return items.map((item) => {
    // If it's a seed item, always use the fresh verified image
    if (initialMap.has(item.id)) {
      return { ...item, imageUrl: initialMap.get(item.id) };
    }
    // Clean up any user-created items that used old placeholder URLs
    let img = item.imageUrl || "";
    if (img.includes("1595246140625")) {
      // Replaced cardboard boxes with Solis blue tractor
      img = "https://images.unsplash.com/photo-1614811840666-3ceed1eb392b?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1589923188900")) {
      // Replaced garden person with green tractor
      img = "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1592982537447")) {
      // Replaced green crop field with red/green tractor depending on name
      img = (item.name || "").toLowerCase().includes("deere") || (item.name || "").toLowerCase().includes("deer")
        ? "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1780332514648-516e9dad94c6?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1500382017468")) {
      // Replaced empty sunset field with MB plough
      img = "https://images.unsplash.com/photo-1660391029076-00aebf4ffd96?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1543257580")) {
      // Replaced wheat grain closeup with combine harvester
      img = "https://images.unsplash.com/photo-1716445867588-105a60770e1d?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1586771107445")) {
      // Replaced sprout closeup with boom sprayer
      img = "https://images.unsplash.com/photo-1755931359594-852c73c6609c?auto=format&fit=crop&w=800&q=80";
    } else if (img.includes("1627920769842")) {
      // Replaced with tractor seed drill
      img = "https://images.unsplash.com/photo-1787048607799-a205a6749a50?auto=format&fit=crop&w=800&q=80";
    } else if ((item.name || "").toLowerCase().includes("deere") || (item.name || "").toLowerCase().includes("deer")) {
      img = "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=800&q=80";
    }
    return { ...item, imageUrl: img };
  });
}

function getStoredEquipment() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = fixEquipmentImages(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    console.error("Failed to load equipment from localStorage", e);
  }
  return INITIAL_EQUIPMENT;
}

export const useEquipmentStore = create((set, get) => ({
  equipment: getStoredEquipment(),

  addEquipment: (newEq) => {
    set((state) => {
      const updated = [
        {
          id: `eq-${Date.now()}`,
          rating: 5.0,
          reviewsCount: 1,
          status: "Available",
          includedTerms: [
            "Fuel to be provided by renter",
            "Valid driving license required",
            "Clean return expected"
          ],
          ...newEq
        },
        ...state.equipment
      ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save equipment", e);
      }
      return { equipment: updated };
    });
  },

  getEquipmentById: (id) => {
    return get().equipment.find((eq) => eq.id === id);
  }
}));
