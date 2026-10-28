import { create } from "zustand";

const STORAGE_KEY = "f2v_cart";

function getStoredCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
  }
  return [];
}

export const useCartStore = create((set, get) => ({
  cart: getStoredCart(),

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
      let updated;
      if (existingIndex > -1) {
        updated = state.cart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...state.cart, { product, quantity }];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save cart", e);
      }
      return { cart: updated };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      let updated;
      if (quantity <= 0) {
        updated = state.cart.filter((item) => item.product.id !== productId);
      } else {
        updated = state.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save cart", e);
      }
      return { cart: updated };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updated = state.cart.filter((item) => item.product.id !== productId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save cart", e);
      }
      return { cart: updated };
    });
  },

  clearCart: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear cart", e);
    }
    set({ cart: [] });
  },

  getTotalCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}));
