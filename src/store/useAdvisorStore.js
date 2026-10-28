import { create } from "zustand";

const STORAGE_KEY = "f2v_saved_analyses";

const SEED_ANALYSES = [
  {
    id: "ana-101",
    date: "2026-10-25T11:20:00.000Z",
    cropName: "Sugarcane",
    productName: "Chemical-Free Solid Jaggery (Gur)",
    rawQuantity: 50,
    rawRevenue: 17000,
    rawNetProfit: 7500,
    processedRevenue: 48875,
    processedNetProfit: 32375,
    additionalProfit: 24875,
    profitUpliftPercent: 332
  },
  {
    id: "ana-102",
    date: "2026-10-22T09:15:00.000Z",
    cropName: "Tomato",
    productName: "Concentrated Tomato Puree (24° Brix)",
    rawQuantity: 20,
    rawRevenue: 28000,
    rawNetProfit: 12000,
    processedRevenue: 66500,
    processedNetProfit: 35100,
    additionalProfit: 23100,
    profitUpliftPercent: 192
  }
];

function getStoredAnalyses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load saved analyses", e);
  }
  return SEED_ANALYSES;
}

export const useAdvisorStore = create((set, get) => ({
  savedAnalyses: getStoredAnalyses(),

  saveAnalysis: (analysis) => {
    set((state) => {
      const entry = {
        id: `ana-${Date.now()}`,
        date: new Date().toISOString(),
        ...analysis
      };
      const updated = [entry, ...state.savedAnalyses];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save analysis", e);
      }
      return { savedAnalyses: updated };
    });
  }
}));
