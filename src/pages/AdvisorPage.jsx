import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Sliders, 
  ArrowRight, 
  Save, 
  History, 
  Info,
  DollarSign,
  Package,
  Truck,
  RotateCcw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { CROP_PRESETS, calculateCropProfit } from "../data/cropAssumptions";
import { formatINR } from "../utils/formatters";
import { useAdvisorStore } from "../store/useAdvisorStore";
import toast from "react-hot-toast";

export default function AdvisorPage() {
  const [selectedCropId, setSelectedCropId] = useState("sugarcane");
  const currentCropPreset = CROP_PRESETS.find((c) => c.id === selectedCropId) || CROP_PRESETS[0];

  const [selectedProductId, setSelectedProductId] = useState(currentCropPreset.products[0].id);
  const currentProductPreset = currentCropPreset.products.find((p) => p.id === selectedProductId) || currentCropPreset.products[0];

  // Inputs
  const [quantity, setQuantity] = useState(currentCropPreset.defaultQuantity);
  const [rawSellingPrice, setRawSellingPrice] = useState(currentCropPreset.rawPricePerUnit);
  const [rawCostPerUnit, setRawCostPerUnit] = useState(currentCropPreset.rawCostPerUnit);

  // Editable processing overrides
  const [showAdvancedOverrides, setShowAdvancedOverrides] = useState(false);
  const [overrideYield, setOverrideYield] = useState(currentProductPreset.yieldPercent);
  const [overrideProcessedPrice, setOverrideProcessedPrice] = useState(currentProductPreset.processedSellingPrice);
  const [overrideProcessingCost, setOverrideProcessingCost] = useState(currentProductPreset.processingCostPerRawUnit);
  const [overridePackagingCost, setOverridePackagingCost] = useState(currentProductPreset.packagingCostPerProcessedUnit);
  const [overrideTransportCost, setOverrideTransportCost] = useState(currentProductPreset.transportCostPerProcessedUnit);

  const saveAnalysis = useAdvisorStore((state) => state.saveAnalysis);
  const savedAnalyses = useAdvisorStore((state) => state.savedAnalyses);

  // Handle crop switch
  const handleCropChange = (cropId) => {
    const crop = CROP_PRESETS.find((c) => c.id === cropId);
    if (!crop) return;
    setSelectedCropId(crop.id);
    setSelectedProductId(crop.products[0].id);
    setQuantity(crop.defaultQuantity);
    setRawSellingPrice(crop.rawPricePerUnit);
    setRawCostPerUnit(crop.rawCostPerUnit);

    const firstProd = crop.products[0];
    setOverrideYield(firstProd.yieldPercent);
    setOverrideProcessedPrice(firstProd.processedSellingPrice);
    setOverrideProcessingCost(firstProd.processingCostPerRawUnit);
    setOverridePackagingCost(firstProd.packagingCostPerProcessedUnit);
    setOverrideTransportCost(firstProd.transportCostPerProcessedUnit);
  };

  // Handle product transformation switch
  const handleProductChange = (productId) => {
    const prod = currentCropPreset.products.find((p) => p.id === productId);
    if (!prod) return;
    setSelectedProductId(prod.id);
    setOverrideYield(prod.yieldPercent);
    setOverrideProcessedPrice(prod.processedSellingPrice);
    setOverrideProcessingCost(prod.processingCostPerRawUnit);
    setOverridePackagingCost(prod.packagingCostPerProcessedUnit);
    setOverrideTransportCost(prod.transportCostPerProcessedUnit);
  };

  // Run calculation
  const result = useMemo(() => {
    return calculateCropProfit({
      rawQuantity: Number(quantity) || 1,
      rawPricePerUnit: Number(rawSellingPrice) || 0,
      rawCostPerUnit: Number(rawCostPerUnit) || 0,
      productPreset: currentProductPreset,
      overrideYield: Number(overrideYield),
      overrideProcessedPrice: Number(overrideProcessedPrice),
      overrideProcessingCost: Number(overrideProcessingCost),
      overridePackagingCost: Number(overridePackagingCost),
      overrideTransportCost: Number(overrideTransportCost),
    });
  }, [
    quantity,
    rawSellingPrice,
    rawCostPerUnit,
    currentProductPreset,
    overrideYield,
    overrideProcessedPrice,
    overrideProcessingCost,
    overridePackagingCost,
    overrideTransportCost,
  ]);

  // Chart data
  const chartData = [
    {
      metric: "Gross Revenue",
      "Raw Sale": result.rawRevenue,
      "Processed Sale": result.processedRevenue,
    },
    {
      metric: "Net Profit",
      "Raw Sale": Math.max(0, result.rawNetProfit),
      "Processed Sale": Math.max(0, result.processedNetProfit),
    },
  ];

  const handleSave = () => {
    saveAnalysis({
      cropName: currentCropPreset.name,
      productName: currentProductPreset.name,
      rawQuantity: result.rawQuantity,
      rawRevenue: result.rawRevenue,
      rawNetProfit: result.rawNetProfit,
      processedRevenue: result.processedRevenue,
      processedNetProfit: result.processedNetProfit,
      additionalProfit: result.additionalProfit,
      profitUpliftPercent: result.profitUpliftPercent
    });
    toast.success("Crop analysis saved to your history! 💾");
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Module B · Profit Optimizer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#17231D] tracking-tight">
              AI Crop Profit Advisor
            </h1>
            <p className="text-sm text-[#647067] mt-1">
              Compare selling raw harvest vs. processing it into high-value agricultural products.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#15803D] text-[#15803D] hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Analysis</span>
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Inputs & Assumptions */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-xs space-y-6">
            
            {/* Step 1: Crop Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                1. Select Harvested Crop
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CROP_PRESETS.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => handleCropChange(crop.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedCropId === crop.id
                        ? "border-[#15803D] bg-emerald-50/80 text-[#15803D] shadow-xs"
                        : "border-[#E5EAE5] text-[#17231D] hover:bg-[#F7F9F5]"
                    }`}
                  >
                    <span className="text-2xl block mb-0.5">{crop.icon}</span>
                    <span className="text-xs font-bold block truncate">{crop.name}</span>
                    <span className="text-[10px] text-gray-400 block">{crop.hindiName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Value-Added Target Product */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                2. Choose Value-Added Transformation
              </label>
              <div className="space-y-2">
                {currentCropPreset.products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductChange(prod.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedProductId === prod.id
                        ? "border-[#15803D] bg-emerald-50/70 text-[#17231D] shadow-xs"
                        : "border-[#E5EAE5] text-[#647067] hover:bg-[#F7F9F5]"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#17231D]">{prod.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Yield: {prod.yieldPercent}% · Est. Price: {formatINR(prod.processedSellingPrice)}/{prod.processedUnit}
                      </div>
                    </div>
                    {selectedProductId === prod.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Quantity & Raw Price */}
            <div className="pt-2 border-t border-[#E5EAE5] space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                3. Volume & Raw Market Price
              </label>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Available Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      Quintals
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    = {Number(quantity) * 100} Kilograms
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Raw Selling Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      value={rawSellingPrice}
                      onChange={(e) => setRawSellingPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      ₹/qtl
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Current mandi average
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Cost Breakdown Toggler */}
            <div className="pt-2 border-t border-[#E5EAE5]">
              <button
                type="button"
                onClick={() => setShowAdvancedOverrides(!showAdvancedOverrides)}
                className="text-xs font-bold text-[#15803D] flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvancedOverrides ? "Hide Cost Adjustments" : "Adjust Processing & Transport Costs"}</span>
              </button>

              {showAdvancedOverrides && (
                <div className="mt-4 p-4 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Expected Processed Price (₹/{currentProductPreset.processedUnit})
                    </label>
                    <input
                      type="number"
                      value={overrideProcessedPrice}
                      onChange={(e) => setOverrideProcessedPrice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Processing (₹/qtl)
                      </label>
                      <input
                        type="number"
                        value={overrideProcessingCost}
                        onChange={(e) => setOverrideProcessingCost(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Packaging (₹/unit)
                      </label>
                      <input
                        type="number"
                        value={overridePackagingCost}
                        onChange={(e) => setOverridePackagingCost(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Transport / Logistics (₹/unit)
                    </label>
                    <input
                      type="number"
                      value={overrideTransportCost}
                      onChange={(e) => setOverrideTransportCost(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>
                All estimations depend on input assumptions. Never guarantees live mandi purchase prices.
              </span>
            </div>

          </div>

          {/* Right Column (7 cols): Calculation Results, Recommendation & Action Plan */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Big Verdict Card */}
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-md space-y-4 ${
              result.isRecommended 
                ? "bg-gradient-to-br from-[#166534] to-[#15803D] text-white border-green-800" 
                : "bg-white text-[#17231D] border-[#E5EAE5]"
            }`}>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  result.isRecommended 
                    ? "bg-[#EAB308] text-stone-900" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {result.isRecommended ? "Strong Recommendation: Process" : "Recommendation: Sell Raw"}
                </span>
                <span className={`text-xs font-bold ${result.isRecommended ? "text-emerald-100" : "text-gray-500"}`}>
                  Transparent Simulation
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {result.isRecommended
                    ? `Processing yields +${formatINR(result.additionalProfit)} more net profit!`
                    : "Selling raw crop is currently more economical."}
                </h2>
                <p className={`text-sm mt-1 leading-relaxed ${result.isRecommended ? "text-emerald-100" : "text-gray-600"}`}>
                  Converting {result.rawQuantity} quintals of {currentCropPreset.name} into {result.processedYieldQty} {result.processedUnit} of {currentProductPreset.name} can increase your net income by <strong>+{result.profitUpliftPercent}%</strong>.
                </p>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-2xl border ${
                  result.isRecommended 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "bg-[#F7F9F5] border-gray-200 text-[#17231D]"
                }`}>
                  <span className="text-[11px] uppercase tracking-wider font-bold block opacity-80">
                    Scenario A: Raw Sale
                  </span>
                  <div className="text-xs mt-1">Gross Revenue: {formatINR(result.rawRevenue)}</div>
                  <div className="text-xl font-black mt-0.5">
                    {formatINR(result.rawNetProfit)}
                  </div>
                  <span className="text-[10px] opacity-75">Estimated Net Profit</span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  result.isRecommended 
                    ? "bg-white text-[#17231D] border-white shadow-md" 
                    : "bg-emerald-50 border-emerald-300 text-emerald-900"
                }`}>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#15803D] block">
                    Scenario B: Processed
                  </span>
                  <div className="text-xs mt-1 text-gray-600">Gross Revenue: {formatINR(result.processedRevenue)}</div>
                  <div className="text-xl font-black text-[#15803D] mt-0.5">
                    {formatINR(result.processedNetProfit)}
                  </div>
                  <span className="text-[10px] text-gray-500">Estimated Net Profit</span>
                </div>
              </div>

            </div>

            {/* Recharts Visual Comparison Chart */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#17231D]">
                Financial Comparison Breakdown (in ₹ INR)
              </h3>
              
              <div className="h-64 w-full min-w-0 min-h-[256px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE5" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "#647067" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#647067" }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E5EAE5", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="Raw Sale" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Processed Sale" fill="#15803D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cost summary table */}
              <div className="p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-gray-500 block">Processing:</span>
                  <span className="font-bold text-[#17231D]">{formatINR(result.totalProcessingExpense)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Packaging:</span>
                  <span className="font-bold text-[#17231D]">{formatINR(result.totalPackagingExpense)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Transport:</span>
                  <span className="font-bold text-[#17231D]">{formatINR(result.totalTransportExpense)}</span>
                </div>
              </div>
            </div>

            {/* 4-Step Action Plan */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#17231D]">
                  Recommended Execution Roadmap
                </h3>
                <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md">
                  {result.actionSteps?.length || 4} Steps
                </span>
              </div>

              <div className="space-y-3">
                {result.actionSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5]">
                    <div className="w-6 h-6 rounded-full bg-[#15803D] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#17231D]">{step.title}</h4>
                      <p className="text-xs text-[#647067] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Machinery Linkage */}
              {result.equipmentNeeded && (
                <div className="pt-3 border-t border-[#E5EAE5] flex items-center justify-between text-xs text-gray-600">
                  <span>Machinery Needed: <strong>{result.equipmentNeeded}</strong></span>
                  <a href="/equipment" className="text-[#15803D] font-bold hover:underline">
                    Rent in AgroShare →
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
