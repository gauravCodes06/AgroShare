import { create } from "zustand";
import { INITIAL_PRODUCTS } from "../data/products";

const STORAGE_KEY = "f2v_products";

function getStoredProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load products from localStorage", e);
  }
  return INITIAL_PRODUCTS;
}

export const useProductStore = create((set, get) => ({
  products: getStoredProducts(),

  addProduct: (newProd) => {
    set((state) => {
      const updated = [
        {
          id: `prod-${Date.now()}`,
          rating: 5.0,
          reviewsCount: 1,
          badge: "New Farmer Listing",
          ...newProd
        },
        ...state.products
      ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save products", e);
      }
      return { products: updated };
    });
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  }
}));
