/**
 * AI Value Engine — Farm2Value
 * Powered by Groq AI
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdLocationOn, MdMic, MdMicOff, MdArrowForward, MdArrowBack,
    MdTrendingUp, MdStore, MdCheckCircle, MdSearch, MdBolt,
    MdPalette, MdPerson, MdStar, MdLock, MdSend, MdPlayCircleFilled,
} from "react-icons/md";
import {
    FaBrain, FaLeaf, FaShoppingCart, FaTruck, FaRupeeSign,
    FaChartBar, FaClipboardList, FaBoxOpen, FaFlask, FaTree,
    FaSeedling, FaSprayCan, FaAppleAlt, FaCarrot, FaRobot,
} from "react-icons/fa";
import { GiFlowerPot, GiGrainBundle, GiPlantRoots, GiChiliPepper } from "react-icons/gi";
import { getUserLocation, reverseGeocode } from "../utils/geo";
import useAuthStore from "../store/useAuthStore";
import useAiTrackerStore from "../store/useAiTrackerStore";
import toast from "react-hot-toast";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY || "";

/* ══════════════════════════════════════════════════════════════
   CROP DATA
══════════════════════════════════════════════════════════════ */
const POPULAR_CROPS = [
    { name: "Wheat", emoji: "🌾", demand: "High", trend: "+8%" },
    { name: "Tomato", emoji: "🍅", demand: "High", trend: "+22%" },
    { name: "Potato", emoji: "🥔", demand: "High", trend: "+12%" },
    { name: "Onion", emoji: "🧅", demand: "High", trend: "+18%" },
    { name: "Soybean", emoji: "🫘", demand: "High", trend: "+5%" },
    { name: "Sugarcane", emoji: "🎋", demand: "Medium", trend: "+3%" },
    { name: "Turmeric", emoji: "🟡", demand: "High", trend: "+30%" },
    { name: "Marigold", emoji: "🌼", demand: "High", trend: "+15%" },
];

const CROP_CATEGORIES = {
    All: [
        { name: "Wheat", emoji: "🌾" },
        { name: "Rice", emoji: "🍚" },
        { name: "Maize", emoji: "🌽" },
        { name: "Sorghum", emoji: "🌾" },
        { name: "Bajra", emoji: "🌾" },
        { name: "Barley", emoji: "🌾" },
        { name: "Sugarcane", emoji: "🎋" },
        { name: "Cotton", emoji: "☁️" },
        { name: "Soybean", emoji: "🫘" },
        { name: "Tomato", emoji: "🍅" },
        { name: "Onion", emoji: "🧅" },
        { name: "Potato", emoji: "🥔" },
        { name: "Cauliflower", emoji: "🥦" },
        { name: "Cabbage", emoji: "🥬" },
        { name: "Capsicum", emoji: "🫑" },
        { name: "Brinjal", emoji: "🍆" },
        { name: "Spinach", emoji: "🥬" },
        { name: "Peas", emoji: "🫛" },
        { name: "Carrot", emoji: "🥕" },
        { name: "Mango", emoji: "🥭" },
        { name: "Banana", emoji: "🍌" },
        { name: "Grapes", emoji: "🍇" },
        { name: "Pomegranate", emoji: "🍎" },
        { name: "Guava", emoji: "🍐" },
        { name: "Watermelon", emoji: "🍉" },
        { name: "Orange", emoji: "🍊" },
        { name: "Turmeric", emoji: "🟡" },
        { name: "Coriander", emoji: "🌿" },
        { name: "Cumin", emoji: "🟤" },
        { name: "Chilli", emoji: "🌶️" },
        { name: "Ginger", emoji: "🫚" },
        { name: "Garlic", emoji: "🧄" },
        { name: "Chickpea", emoji: "🫘" },
        { name: "Lentil", emoji: "🫘" },
        { name: "Pigeon Pea", emoji: "🫘" },
        { name: "Mustard", emoji: "🟡" },
        { name: "Groundnut", emoji: "🥜" },
        { name: "Sesame", emoji: "⚪" },
        { name: "Sunflower", emoji: "🌻" },
        { name: "Marigold", emoji: "🌼" },
        { name: "Rose", emoji: "🌹" },
        { name: "Jasmine", emoji: "🌸" },
        { name: "Lotus", emoji: "🪷" },
    ],
    Grains: ["Wheat", "Rice", "Maize", "Sorghum", "Bajra", "Barley"],
    Vegetables: ["Tomato", "Onion", "Potato", "Cauliflower", "Cabbage", "Capsicum", "Brinjal", "Spinach", "Peas", "Carrot"],
    Fruits: ["Mango", "Banana", "Grapes", "Pomegranate", "Guava", "Watermelon", "Orange"],
    Spices: ["Turmeric", "Coriander", "Cumin", "Chilli", "Ginger", "Garlic", "Mustard"],
    Pulses: ["Soybean", "Chickpea", "Lentil", "Pigeon Pea"],
    "Cash Crops": ["Sugarcane", "Cotton"],
    "Oil Seeds": ["Groundnut", "Sesame", "Sunflower", "Mustard"],
    Flowers: ["Marigold", "Rose", "Jasmine", "Lotus", "Sunflower"],
};

const CATEGORY_ICONS = {
    All: <FaLeaf className="h-3.5 w-3.5" />,
    Grains: <GiGrainBundle className="h-3.5 w-3.5" />,
    Vegetables: <FaCarrot className="h-3.5 w-3.5" />,
    Fruits: <FaAppleAlt className="h-3.5 w-3.5" />,
    Spices: <GiChiliPepper className="h-3.5 w-3.5" />,
    Pulses: <GiPlantRoots className="h-3.5 w-3.5" />,
    "Cash Crops": <FaSeedling className="h-3.5 w-3.5" />,
    "Oil Seeds": <FaFlask className="h-3.5 w-3.5" />,
    Flowers: <GiFlowerPot className="h-3.5 w-3.5" />,
};

const getCropEmoji = (name) => CROP_CATEGORIES.All.find(c => c.name.toLowerCase() === name.toLowerCase())?.emoji || "🌱";

const getCategoryCrops = (cat) => {
    if (cat === "All") return CROP_CATEGORIES.All;
    return CROP_CATEGORIES[cat]?.map(name => ({
        name,
        emoji: getCropEmoji(name),
    })) || [];
};

/* ══════════════════════════════════════════════════════════════
   MOCK MANDI DATA
══════════════════════════════════════════════════════════════ */
async function fetchMandiData(crop, location) {
    await new Promise(r => setTimeout(r, 800));
    const base = {
        Wheat: 2580, Tomato: 1200, Potato: 900, Onion: 1400, Cotton: 6800,
        Sugarcane: 350, Rice: 2200, Maize: 1900, Soybean: 4500, Turmeric: 7200, Marigold: 3500,
    }[crop] || 2000;
    const noise = () => Math.floor((Math.random() - 0.5) * 200);
    return {
        crop,
        nearbyMandis: [
            { name: `${location?.split(",")[1]?.trim() || "Local"} Mandi`, minPrice: base - 150 + noise(), maxPrice: base + 200 + noise(), modal: base + noise(), arrivals: Math.floor(Math.random() * 300 + 50) + " Q" },
            { name: `${location?.split(",")[0]?.trim() || "District"} Mandi`, minPrice: base - 100 + noise(), maxPrice: base + 150 + noise(), modal: base + noise(), arrivals: Math.floor(Math.random() * 200 + 30) + " Q" },
            { name: "State APMC", minPrice: base - 50 + noise(), maxPrice: base + 300 + noise(), modal: base + noise(), arrivals: Math.floor(Math.random() * 500 + 100) + " Q" },
        ],
        bestMandi: `${location?.split(",")[0]?.trim() || "District"} Mandi`,
        currentPrice: base + noise(),
        unit: "₹/quintal",
        priceKg: ((base + noise()) / 100).toFixed(1),
        trend: Math.random() > 0.4 ? "up" : "down",
        trendPct: (Math.random() * 12 + 2).toFixed(1),
        updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
}

/* ══════════════════════════════════════════════════════════════
   GROQ AI — Value Engine
══════════════════════════════════════════════════════════════ */
const AI_THOUGHTS = (crop, location) => [
    `🌾 Identifying ${crop} crop characteristics and regional variety…`,
    `📍 Scanning nearby mandis around ${location || "your location"}…`,
    `📈 Analysing market demand trends for ${crop} in 2025…`,
    `🔬 Evaluating value-addition options…`,
    `💰 Comparing raw vs. processed revenue across scenarios…`,
    `⚙️ Calculating processing cost and chronological steps…`,
    `🏆 Ranking best options by profitability & ease…`,
    `📝 Preparing your interactive action plan…`,
];

async function callGroqAI(input, onThought) {
    const thoughts = AI_THOUGHTS(input.crop, input.location);
    const thoughtInterval = setInterval(() => {
        const next = thoughts.shift();
        if (next) onThought(next);
    }, 900);

    const prompt = `You are an expert agricultural value addition AI for Indian farmers.

Farmer Details:
- Crop: ${input.crop}
- Quantity: ${input.quantity} kg
- Location: ${input.location}
- Current Mandi Price: ₹${input.mandiData?.currentPrice || "unknown"}/quintal

Return ONLY valid JSON (no markdown).

{
  "cropSummary": "One line market status",
  "rawPrice": 28,
  "rawPriceUnit": "₹/kg",
  "rawTotalEarning": 28000,
  "processedProducts": [
    {
      "name": "Product Name",
      "demand": "High",
      "sellingPrice": 55,
      "processingCost": 6,
      "netProfit": 49,
      "totalEarning": 49000,
      "extraEarning": 21000,
      "profitPercent": 75,
      "processingTime": "2-3 days",
      "difficulty": "Easy",
      "requirements": "Short summary of resources",
      "requirementsList": [
        { 
          "itemName": "Specific Machine (e.g., 2HP Mini Pulverizer Machine)", 
          "estimatedPrice": "₹12,000", 
          "category": "Equipment"
        },
        { 
          "itemName": "Specific Packaging (e.g., 1kg printed Zip-lock pouches)", 
          "estimatedPrice": "₹500", 
          "category": "Packaging"
        }
      ],
      "qualityTips": "Quality assurance advice",
      "marketWhere": "Where to sell",
      "stepsInfo": [
        { "stepName": "Step 1", "action": "Clear and dry the produce under sunlight.", "reasoning": "Drying limits moisture content preventing storage rot. This scientific step is crucial because excess water quickly breeds fungi. By controlling moisture, you ensure the raw material maintains premium grade quality for milling.", "estimatedCost": 0 },
        { "stepName": "Step 2", "action": "Process or mill using local chakki/machine.", "reasoning": "Transforming the raw material directly increases the market value by over 150%. This economic upgrade bypasses middlemen processors, allowing the farmer to capture the full retail margin of the finished goods.", "estimatedCost": 500 },
        { "stepName": "Step 3", "action": "Pack in 1kg clean, branded bags.", "reasoning": "Branded retail packaging attracts direct-to-consumer sales in modern urban markets. Psychologically, consumers trust and pay a premium for sealed, clean agricultural products compared to bulk open-sack selling.", "estimatedCost": 200 }
      ]
    }
  ],
  "bestOption": "Best Product Name",
  "bestOptionReason": "Why this is best",
  "decision": "PROCESS",
  "rawAdvice": "Advice for raw."
}
Make data highly realistic for India 2025. Generate 2-3 processed product options that are highly popular, fast-selling, and in high demand in ${input.location || "India"} or the nearest major market. Ensure requirementsList includes highly detailed machine specifications and exact packaging materials. The 'reasoning' in stepsInfo MUST be highly detailed (2-3 sentences) explaining the in-depth scientific or economic logic for that specific task.`;

    const models = ["meta-llama/llama-4-scout-17b-16e-instruct", "meta-llama/llama-4-maverick-17b-128e-instruct", "llama3-70b-8192"];
    let lastErr = null;
    for (const model of models) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.3 }),
            });
            const text = JSON.parse(await res.text())?.choices?.[0]?.message?.content || "";
            const match = text.match(/\{[\s\S]*\}/);
            if (match) { clearInterval(thoughtInterval); return JSON.parse(match[0]); }
        } catch (e) { lastErr = e; }
    }
    clearInterval(thoughtInterval);
    throw lastErr || new Error("Failed to parse");
}

/* ══════════════════════════════════════════════════════════════
   GROQ AI — Step Expert Chat
══════════════════════════════════════════════════════════════ */
async function callExpertChat(crop, productName, stepAction, question) {
    const prompt = `You are a helpful AI Agricultural Expert guiding an Indian farmer.
Context:
- Crop: ${crop}
- Processing Goal: ${productName}
- Current Step: "${stepAction}"
- Farmer Question: "${question}"

Reply directly to the farmer in 2-3 short, friendly, plain English sentences. Keep it very simple and practical.`;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
            }),
        });
        return JSON.parse(await res.text())?.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
    } catch {
        return "Sorry, I am facing network issues. Please try again.";
    }
}

/* ══════════════════════════════════════════════════════════════
   GEMINI & GROQ AI: BRAND PROMPT GENERATOR 
══════════════════════════════════════════════════════════════ */
async function callGeminiImagePrompt(productName, cropName) {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("No Gemini Key");

    const prompt = `You are a world-class DALL-E prompt engineer. Write exactly ONE highly descriptive sentence describing a photorealistic, ultra-premium packaging container design for "${productName}" (made from ${cropName}). Use keywords like 'studio lighting', 'high-end', 'clean background'. DO NOT output any conversational text, ONLY the prompt itself.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    if (!res.ok) throw new Error("Gemini API Failed");
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text returned by Gemini");
    return text.trim();
}

async function callGroqImagePrompt(productName, cropName) {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY) return `Premium minimalist retail packaging for ${productName}.`;

    const prompt = `You are a world-class DALL-E prompt engineer. Write exactly ONE highly descriptive sentence describing a photorealistic, ultra-premium packaging container design for "${productName}" (made from ${cropName}). Use keywords like 'studio lighting', 'high-end', 'clean background'. DO NOT output any conversational text, ONLY the prompt itself.`;
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || `Premium minimalist retail packaging for ${productName}.`;
    } catch {
        return `Premium minimalist retail packaging for ${productName}.`;
    }
}

/* ══════════════════════════════════════════════════════════════
   AI DOCUMENT TRANSLATOR
══════════════════════════════════════════════════════════════ */
async function translateDocumentData(payload, lang) {
    if (lang === "English") return payload;
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY) return payload;

    const prompt = `Translate the string values of this JSON object into ${lang}. Output ONLY valid JSON matching the exact original structure. Do not output any conversational text or markdown.\n\n${JSON.stringify(payload)}`;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama3-70b-8192", // More robust for strictly formatted JSON translation
                messages: [
                    { role: "system", content: "You output pure JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            }),
        });
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || "";
        if (text) return JSON.parse(text);
    } catch (e) {
        console.error("Translation error", e);
    }
    return payload;
}

/* ══════════════════════════════════════════════════════════════
   BRAND PACKAGING TEMPLATES
══════════════════════════════════════════════════════════════ */
const BRAND_TEMPLATES = [
    { id: 1, bg: "bg-gradient-to-br from-green-600 to-emerald-900", text: "text-white", subText: "text-green-200", icon: "text-white/10", box: "bg-white/10 border-white/30", bar: "bg-black/20 text-green-200", font: "font-black" },
    { id: 2, bg: "bg-gradient-to-t from-gray-900 to-gray-800", text: "text-amber-400", subText: "text-gray-400", icon: "text-gray-700", box: "bg-gray-800 border-gray-700", bar: "bg-amber-500 text-gray-900", font: "font-serif font-black" },
    { id: 3, bg: "bg-gradient-to-br from-amber-100 to-orange-50", text: "text-amber-900", subText: "text-orange-600", icon: "text-amber-200", box: "bg-white border-amber-200", bar: "bg-amber-900 text-amber-50", font: "font-sans font-black" },
    { id: 4, bg: "bg-gradient-to-tr from-rose-500 to-pink-700", text: "text-white", subText: "text-rose-200", icon: "text-rose-900/20", box: "bg-white/20 border-white/40", bar: "bg-rose-900/50 text-white", font: "font-bold tracking-tight" },
    { id: 5, bg: "bg-gradient-to-br from-teal-400 to-emerald-400", text: "text-teal-950", subText: "text-teal-800", icon: "text-white/30", box: "bg-white/40 border-teal-600", bar: "bg-teal-900 text-teal-100", font: "font-extrabold" },
    { id: 6, bg: "bg-gradient-to-b from-blue-900 to-indigo-900", text: "text-blue-100", subText: "text-indigo-300", icon: "text-indigo-500/30", box: "bg-black/30 border-indigo-500/50", bar: "bg-blue-500 text-white", font: "font-bold tracking-wide" },
    { id: 7, bg: "bg-stone-100", text: "text-stone-800", subText: "text-stone-500", icon: "text-stone-200", box: "bg-white border-stone-300 shadow-sm", bar: "bg-stone-800 text-stone-100", font: "font-serif font-black tracking-tighter" },
    { id: 8, bg: "bg-gradient-to-br from-purple-800 to-violet-900", text: "text-purple-100", subText: "text-purple-300", icon: "text-purple-400/20", box: "bg-white/10 border-purple-500/30", bar: "bg-purple-500 text-white", font: "font-bold" },
    { id: 9, bg: "bg-gradient-to-tr from-red-600 to-orange-600", text: "text-white", subText: "text-red-200", icon: "text-black/10", box: "bg-black/20 border-black/10", bar: "bg-white text-red-700", font: "font-black uppercase" },
    { id: 10, bg: "bg-[#1E1E1E]", text: "text-stone-100", subText: "text-emerald-400", icon: "text-emerald-500/10", box: "bg-[#252525] border-emerald-500/50", bar: "bg-emerald-500 text-stone-900", font: "font-mono font-bold" },
    { id: 11, bg: "bg-gradient-to-b from-yellow-400 to-amber-500", text: "text-amber-950", subText: "text-amber-800", icon: "text-amber-600/20", box: "bg-white/30 border-amber-600/20", bar: "bg-amber-950 text-yellow-400", font: "font-black" },
    { id: 12, bg: "bg-gradient-to-br from-cyan-100 to-sky-200", text: "text-cyan-900", subText: "text-sky-700", icon: "text-white/60", box: "bg-white/60 border-white", bar: "bg-cyan-600 text-cyan-50", font: "font-bold" },
    { id: 13, bg: "bg-gradient-to-r from-fuchsia-600 to-pink-600", text: "text-white", subText: "text-fuchsia-200", icon: "text-white/20", box: "bg-black/20 border-white/20", bar: "bg-black/40 text-white", font: "font-black uppercase tracking-tight" },
    { id: 14, bg: "bg-gradient-to-t from-emerald-950 to-green-900", text: "text-emerald-100", subText: "text-green-400", icon: "text-emerald-800", box: "bg-black/40 border-green-500/30", bar: "bg-green-500/20 text-green-300", font: "font-bold" },
    { id: 15, bg: "bg-white", text: "text-black", subText: "text-gray-500", icon: "text-gray-100", box: "bg-gray-50 border-gray-200 shadow-inner", bar: "bg-black text-white", font: "font-bold" }
];

/* ══════════════════════════════════════════════════════════════
   INTERACTIVE TRACKER COMPONENT (STEP 4)
══════════════════════════════════════════════════════════════ */
const InteractiveTracker = ({ trackerId, onGoDashboard }) => {
    const navigate = useNavigate();
    const { tasks, completeStep, addChatMessage } = useAiTrackerStore();
    const task = tasks.find(t => t.id === trackerId);
    const [chatInputs, setChatInputs] = useState({});
    const [chatLogs, setChatLogs] = useState(task?.chatHistory || {});
    const [isThinking, setIsThinking] = useState(false);
    const [planStarted, setPlanStarted] = useState(task.currentStep > 0 || task.status === "completed");
    const [showBrandScreen, setShowBrandScreen] = useState(false);
    const [brandImageUrl, setBrandImageUrl] = useState("");
    const [imgLoaded, setImgLoaded] = useState(false);
    const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
    const [useTemplateFallback, setUseTemplateFallback] = useState(false);
    const [templateIndex, setTemplateIndex] = useState(Math.floor(Math.random() * BRAND_TEMPLATES.length));
    const [showDocumentScreen, setShowDocumentScreen] = useState(false);

    // Document Translation States
    const [docLang, setDocLang] = useState("English");
    const [isTranslatingDoc, setIsTranslatingDoc] = useState(false);
    const [tDoc, setTDoc] = useState(null);

    const initTranslations = async (lang) => {
        setDocLang(lang);
        if (lang === "English") { setTDoc(null); return; }
        setIsTranslatingDoc(true);
        const payload = {
            docTitle: "Farm2Value | Business Plan",
            subTitle: "Value Addition Strategy",
            h1: "1. Original Resources", h2: "2. Financial Overview", h3: "3. Necessary Equipment & Packing", h4: "4. Processing Action Plan", h5: "5. Retail Brand Prototype",
            crop: "Crop", originalQty: "Original Qty", targetEnd: "Target End Product", marketDemand: "Market Demand",
            rawRev: "Raw Revenue", proCost: "Processing Cost", proRev: "Processed Rev", netProfit: "Net Extra Profit",
            taskName: task.name, taskDemand: task.demand || "High", reqText: task.requirements || "",
            cropName: task.crop, organicLabel: "100% Organic", dateLabel: "Date:",
            reqList: task.requirementsList?.map(r => ({ name: r.itemName, param: r.estimatedPrice })) || [],
            steps: (task.stepsInfo || []).map(s => ({ action: s.action, reasoning: s.reasoning }))
        };
        const translated = await translateDocumentData(payload, lang);
        setTDoc(translated);
        setIsTranslatingDoc(false);
    };

    if (!task) return null;

    const steps = task.stepsInfo || [];
    const currentStep = task.currentStep;

    const handleSendChat = async (stepIndex) => {
        const msg = chatInputs[stepIndex];
        if (!msg?.trim()) return;

        setChatInputs(prev => ({ ...prev, [stepIndex]: "" }));
        addChatMessage(task.id, stepIndex, { role: "user", content: msg });
        setChatLogs(prev => ({ ...prev, [stepIndex]: [...(prev[stepIndex] || []), { role: "user", content: msg }] }));

        setIsThinking(true);
        const reply = await callExpertChat(task.crop, task.name, steps[stepIndex].action, msg);
        setIsThinking(false);
        addChatMessage(task.id, stepIndex, { role: "expert", content: reply });
        setChatLogs(prev => ({ ...prev, [stepIndex]: [...(prev[stepIndex] || []), { role: "expert", content: reply }] }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Dashboard redirect toast banner */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-blue-900 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <FaClipboardList className="text-blue-500 h-5 w-5" />
                    <div>
                        <p className="font-bold text-sm">Activity Tracked in Dashboard</p>
                        <p className="text-xs text-blue-700">You can safely leave and resume this plan later from your Dashboard.</p>
                    </div>
                </div>
                <button onClick={onGoDashboard} className="text-sm font-black bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">Go to Dashboard</button>
            </div>

            {/* Header Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-green-200 relative overflow-hidden print:hidden">
                <FaLeaf className="absolute -bottom-10 -right-10 text-white opacity-10 h-40 w-40" />
                <h2 className="text-2xl font-black mb-1">Processing: {task.name}</h2>
                <p className="text-green-100 text-sm">Target output from {task.crop} crop ({task.quantity} kg)</p>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div><p className="text-green-200 text-xs">Expected Cost</p><p className="font-bold text-sm">₹{task.processingCost * task.quantity}</p></div>
                    <div><p className="text-green-200 text-xs">Total Duration</p><p className="font-bold text-sm">{task.processingTime}</p></div>
                    <div><p className="text-green-200 text-xs">Difficulty</p><p className="font-bold text-sm">{task.difficulty}</p></div>
                    <div><p className="text-green-200 text-xs">Extra Profit</p><p className="font-bold text-sm">+₹{task.extraEarning}</p></div>
                </div>

                {task.requirementsList && task.requirementsList.length > 0 ? (
                    <div className="mt-4 bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-5 shadow-inner">
                        <p className="text-xs font-bold text-green-100 mb-4 flex items-center gap-2 uppercase tracking-wide"><FaBoxOpen /> Needed Equipment & AI Sourcing Guide</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {task.requirementsList.map((req, i) => (
                                <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/20 transition-all shadow-sm">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-base text-white leading-tight pr-2">{req.itemName}</p>
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2.5 py-1 rounded-lg text-white flex-shrink-0">{req.category}</span>
                                        </div>
                                        <p className="text-sm font-black text-green-200 mb-3 block">Est. {req.estimatedPrice}</p>
                                    </div>
                                    <a
                                        href={`https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(req.itemName)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-full bg-green-400 hover:bg-green-300 text-green-950 shadow-md px-3 py-3 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition"
                                    >
                                        <FaShoppingCart className="h-4 w-4" /> Purchase Securely
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-5 shadow-inner">
                        <p className="text-xs font-bold text-green-100 mb-4 flex items-center gap-2 uppercase tracking-wide"><FaBoxOpen /> Needed Equipment & AI Sourcing Guide</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(task.requirements?.split(/,|\/| and |;/).map(s => s.trim()).filter(s => s.length > 1) || []).map((reqName, i) => (
                                <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/20 transition-all shadow-sm">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-black text-base text-white leading-tight pr-2 capitalize">{reqName}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(reqName)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-full bg-green-400 hover:bg-green-300 text-green-950 shadow-md px-3 py-3 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition"
                                    >
                                        <FaShoppingCart className="h-4 w-4" /> Compare & Purchase
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <h3 className="font-black text-gray-800 text-lg flex items-center gap-2 print:hidden">
                    <MdTimeline /> Execution Action Plan
                </h3>

                {showDocumentScreen ? (() => {
                    // Map Active Document Variables
                    const d = tDoc || {
                        docTitle: "Farm2Value | Business Plan", subTitle: "Value Addition Strategy",
                        h1: "1. Original Resources", h2: "2. Financial Overview", h3: "3. Necessary Equipment & Packing", h4: "4. Processing Action Plan", h5: "5. Retail Brand Prototype",
                        crop: "Crop", originalQty: "Original Qty", targetEnd: "Target End Product", marketDemand: "Market Demand",
                        rawRev: "Raw Revenue", proCost: "Processing Cost", proRev: "Processed Rev", netProfit: "Net Extra Profit",
                        reqText: task.requirements || "",
                        taskName: task.name, taskDemand: task.demand || "High", cropName: task.crop, organicLabel: "100% Organic", dateLabel: "Date:",
                        reqList: task.requirementsList?.map(r => ({ name: r.itemName, param: r.estimatedPrice })) || [],
                        steps: (task.stepsInfo || []).map(s => ({ action: s.action, reasoning: s.reasoning }))
                    };

                    return (
                        <div id="pdf-document" className="bg-[#fdfbfc] rounded-3xl p-8 shadow-2xl max-w-5xl mx-auto border border-gray-200 print:shadow-none print:border-none print:p-0 print:bg-white text-left font-serif">
                            <style>{`
                                @media print {
                                    @page { margin: 0mm; size: auto; }
                                    body * { visibility: hidden; }
                                    #pdf-document, #pdf-document * { visibility: visible; }
                                    #pdf-document { position: absolute; left: 0; top: 0; width: 100%; height: auto; margin: 0; padding: 15mm; }
                                    .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                                }
                            `}</style>
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-200 print:hidden gap-4">
                                <button onClick={() => setShowDocumentScreen(false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition shadow-sm w-full sm:w-auto">← Back</button>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                    <select value={docLang} onChange={(e) => initTranslations(e.target.value)} disabled={isTranslatingDoc} className="bg-white border-2 border-violet-200 text-violet-900 font-bold rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-full sm:w-auto">
                                        <option value="English">🇬🇧 English</option>
                                        <option value="Hindi">🇮🇳 Hindi</option>
                                        <option value="Marathi">🇮🇳 Marathi</option>
                                        <option value="Gujarati">🇮🇳 Gujarati</option>
                                        <option value="Telugu">🇮🇳 Telugu</option>
                                        <option value="Tamil">🇮🇳 Tamil</option>
                                    </select>
                                    <button onClick={() => window.print()} disabled={isTranslatingDoc} className="px-8 py-3 bg-gradient-to-r from-violet-700 to-indigo-800 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition hover:scale-105 w-full sm:w-auto disabled:opacity-50">
                                        {isTranslatingDoc ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaChartBar />}
                                        {isTranslatingDoc ? 'Translating Document...' : 'Export to PDF'}
                                    </button>
                                </div>
                            </div>

                            {/* Professional Print Canvas */}
                            <div className="text-left bg-white text-gray-900 font-serif p-0 sm:p-4 print:p-0">
                                <div className="border-b-4 border-slate-900 pb-8 mb-8 flex justify-between items-end print:border-black">
                                    <div>
                                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2 print:text-black tracking-tight">{d.docTitle.split('|')[0]} <span className="font-light text-slate-400 print:text-gray-500">| {d.docTitle.split('|')[1]}</span></h1>
                                        <p className="text-xl font-bold text-slate-600 print:text-gray-600">{d.subTitle}</p>
                                    </div>
                                    <div className="text-right text-sm font-semibold text-slate-500">
                                        <p>{d.dateLabel} {new Date().toLocaleDateString()}</p>
                                        <p>{task.location || "Local"}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 print:text-black print:border-gray-300 tracking-wide uppercase">{d.h1}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-tl-3xl rounded-br-3xl border border-slate-200 print:border-gray-400">
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.crop}</p><p className="font-bold text-xl">{d.cropName}</p></div>
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.originalQty}</p><p className="font-bold text-xl">{task.quantity} kg</p></div>
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.targetEnd}</p><p className="font-black text-xl text-emerald-700 print:text-black">{d.taskName}</p></div>
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.marketDemand}</p><p className="font-bold text-xl">{d.taskDemand}</p></div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 print:text-black print:border-gray-300 tracking-wide uppercase">{d.h2}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-amber-50/50 p-6 rounded-tl-3xl rounded-br-3xl border border-amber-200/50 print:bg-white print:border-gray-400">
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.rawRev}</p><p className="font-bold text-xl text-slate-900">₹{task.rawTotalEarning || (task.rawPrice * task.quantity) || (task.quantity * 25)}</p></div>
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.proCost}</p><p className="font-bold text-xl text-red-700">-₹{task.processingCost * task.quantity}</p></div>
                                        <div><p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-1">{d.proRev}</p><p className="font-bold text-xl text-slate-900">₹{task.totalEarning || (task.sellingPrice * task.quantity) || 0}</p></div>
                                        <div className="bg-emerald-100/50 p-3 rounded-2xl border border-emerald-200 print:border-gray-400"><p className="text-emerald-800 text-[11px] font-black tracking-widest uppercase mb-1">{d.netProfit}</p><p className="font-black text-2xl text-emerald-800">+₹{task.extraEarning}</p></div>
                                    </div>
                                </div>

                                <div className="mb-8 break-inside-avoid">
                                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 print:text-black print:border-gray-300 tracking-wide uppercase">{d.h3}</h2>
                                    <div className="bg-slate-50 p-6 rounded-tl-3xl rounded-br-3xl border border-slate-200 space-y-3 print:bg-white print:border-gray-400">
                                        {d.reqList.length > 0 ? d.reqList.map((req, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:border-gray-300 print:shadow-none">
                                                <p className="font-bold text-slate-800 text-lg">{req.name}</p>
                                                <span className="text-sm font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">{req.param}</span>
                                            </div>
                                        )) : <p className="font-semibold text-lg text-slate-700">{d.reqText}</p>}
                                    </div>
                                </div>

                                <div className="mb-8 relative z-0">
                                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 print:text-black print:border-gray-300 tracking-wide uppercase">{d.h4}</h2>
                                    <div className="space-y-4">
                                        {d.steps.map((s, i) => (
                                            <div key={i} className="flex gap-6 p-6 bg-white rounded-2xl border border-slate-200 print:bg-white print:border-gray-400 break-inside-avoid shadow-sm">
                                                <div className="w-12 h-12 bg-slate-800 text-white font-black rounded-lg flex items-center justify-center shrink-0 text-xl print:bg-gray-200 print:text-black">{i + 1}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 text-xl mb-2 leading-relaxed">{s.action}</p>
                                                    <p className="text-sm text-slate-600 font-medium italic border-l-4 border-slate-300 pl-4 py-1 print:border-gray-400">"{s.reasoning}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-8 print-break-inside-avoid relative z-0">
                                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2 mb-6 print:text-black print:border-gray-300 tracking-wide uppercase">{d.h5}</h2>
                                    <div className="flex justify-center p-8 bg-slate-50 border border-slate-200 rounded-3xl print:border-0 print:p-0" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
                                        {/* SCREEN VIEW */}
                                        <div className="print:hidden">
                                            {useTemplateFallback ? (() => {
                                                const tpl = BRAND_TEMPLATES[templateIndex];
                                                return (
                                                    <div className={`w-72 h-72 ${tpl.bg} flex flex-col items-center justify-center p-6 relative rounded-3xl overflow-hidden shadow-2xl font-sans`}>
                                                        <div className="absolute top-4 right-4"><FaLeaf className={`${tpl.icon} h-12 w-12`} /></div>
                                                        <div className={`absolute bottom-0 left-0 w-full p-4 ${tpl.bar} text-center`}>
                                                            <p className="text-[10px] font-black tracking-widest uppercase opacity-90">{d.organicLabel}</p>
                                                        </div>
                                                        <div className={`border rounded-2xl p-4 mb-4 ${tpl.box} shadow-xl backdrop-blur-sm`}>
                                                            <FaBoxOpen className={`h-12 w-12 ${tpl.text} drop-shadow-sm`} />
                                                        </div>
                                                        <h3 className={`text-xl ${tpl.font} ${tpl.text} text-center leading-tight mb-2 drop-shadow-sm px-2 w-full`}>{d.taskName}</h3>
                                                        <p className={`${tpl.subText} text-sm font-bold italic text-center drop-shadow-sm pb-6`}>{d.cropName}</p>
                                                    </div>
                                                );
                                            })() : (
                                                brandImageUrl && (
                                                    <img src={brandImageUrl} className="w-72 h-72 object-cover rounded-3xl shadow-2xl border-4 border-white" alt="Brand Packaging" />
                                                )
                                            )}
                                        </div>

                                        {/* PRINT VIEW (Ultra-Clean Wireframe Box) */}
                                        <div className="hidden print:flex w-72 h-72 border-4 border-black rounded-3xl flex-col items-center justify-center p-6 relative bg-white font-sans">
                                            <FaLeaf className="absolute top-4 right-4 h-12 w-12 text-slate-300" />
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-slate-900 text-center rounded-b-[24px]">
                                                <p className="text-[10px] font-black tracking-widest uppercase opacity-90 text-white">{d.organicLabel}</p>
                                            </div>
                                            <div className="border-2 border-slate-400 rounded-2xl p-4 mb-4">
                                                <FaBoxOpen className="h-12 w-12 text-slate-900" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 text-center leading-tight mb-2 px-2 w-full">{d.taskName}</h3>
                                            <p className="text-sm font-bold italic text-slate-600 text-center pb-6">{d.cropName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })() : showBrandScreen ? (
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-xl">
                        <h2 className="text-2xl font-black text-violet-900 mb-2 mt-4">Your Premium Brand Identity</h2>
                        <p className="text-gray-600 mb-8 font-medium">We've generated a photorealistic retail packaging design for your {task.name}.</p>

                        <div className="flex flex-col items-center">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 max-w-sm w-full mx-auto aspect-square bg-gray-50 flex items-center justify-center border-4 border-white ring-1 ring-gray-100">
                                {!imgLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gray-50">
                                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                                        <p className="font-bold text-violet-800 text-sm">{isGeneratingBrand ? 'AI designing brand prompt...' : 'Rendering HD Packaging...'}</p>
                                        <p className="text-xs text-gray-500 mt-2">This may take 5-10 seconds to generate high quality graphics.</p>
                                    </div>
                                )}
                                {useTemplateFallback ? (() => {
                                    const tpl = BRAND_TEMPLATES[templateIndex];
                                    return (
                                        <div className={`w-full h-full ${tpl.bg} flex flex-col items-center justify-center p-6 relative z-20 transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
                                            <div className="absolute top-4 right-4"><FaLeaf className={`${tpl.icon} h-16 w-16`} /></div>
                                            <div className={`absolute bottom-0 left-0 w-full p-4 ${tpl.bar} border-t border-black/5 text-center z-30`}>
                                                <p className="text-[10px] font-black tracking-widest uppercase opacity-90">100% Organic Farm Product</p>
                                            </div>
                                            <div className={`border rounded-3xl p-5 mb-5 ${tpl.box} shadow-xl backdrop-blur-sm z-20`}>
                                                <FaBoxOpen className={`h-16 w-16 ${tpl.text} drop-shadow-sm`} />
                                            </div>
                                            <h3 className={`text-2xl ${tpl.font} ${tpl.text} text-center leading-tight mb-2 drop-shadow-sm px-2 w-full z-20`}>{task.name}</h3>
                                            <p className={`${tpl.subText} font-bold italic text-center drop-shadow-sm pb-8 z-20`}>Premium Quality {task.crop}</p>
                                        </div>
                                    );
                                })() : (
                                    brandImageUrl && (
                                        <img
                                            src={brandImageUrl}
                                            alt="Generated Brand"
                                            onLoad={() => setImgLoaded(true)}
                                            onError={() => {
                                                setUseTemplateFallback(true);
                                                setImgLoaded(true);
                                            }}
                                            className={`w-full h-full object-cover transition-opacity duration-700 relative z-20 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                    )
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl">
                                <button onClick={async () => {
                                    setTemplateIndex(Math.floor(Math.random() * BRAND_TEMPLATES.length));
                                    setImgLoaded(false);
                                    setUseTemplateFallback(false);
                                    setBrandImageUrl("");
                                    setIsGeneratingBrand(true);
                                    let aiPrompt = "";
                                    try {
                                        aiPrompt = await callGeminiImagePrompt(task.name, task.crop);
                                    } catch (e) {
                                        aiPrompt = await callGroqImagePrompt(task.name, task.crop);
                                    }
                                    setBrandImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=400&height=400&nologo=true`);
                                    setIsGeneratingBrand(false);
                                }} className="px-6 py-4 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200 text-sm shadow-sm flex-1">Regenerate</button>
                                <button onClick={() => setShowBrandScreen(false)} className="px-6 py-4 bg-gray-100 text-gray-800 font-black rounded-xl hover:bg-gray-200 text-sm shadow-sm flex-1">Back</button>
                                <button onClick={() => setShowDocumentScreen(true)} className="px-6 py-4 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 text-sm shadow-lg flex-1 whitespace-nowrap">Create Full Doc</button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 w-full max-w-xl mx-auto flex">
                                <button
                                    onClick={() => navigate("/agromarket", { state: { autoList: true, productData: task, brandImageUrl } })}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl font-black text-sm shadow-lg hover:shadow-green-300 transition hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    <MdStore /> Sell to Market
                                </button>
                            </div>
                        </div>
                    </div>
                ) : !planStarted ? (
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                        <div className="space-y-3">
                            {steps.map((s, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 font-black flex items-center justify-center shrink-0">{i + 1}</div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-bold">{s.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setPlanStarted(true)} className="w-full mt-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-violet-300 transition-all text-base flex justify-center items-center gap-2">
                            <FaRobot /> Implement the Steps <MdArrowForward />
                        </button>
                    </div>
                ) : (
                    <>
                        {task.status === "completed" && (
                            <div className="bg-green-50 border border-green-200 p-6 rounded-3xl text-center flex flex-col items-center gap-3 shadow-sm mb-6">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center font-black mb-1">✓</div>
                                <div>
                                    <p className="font-black text-2xl text-green-900 leading-tight">Congratulations!</p>
                                    <p className="text-green-800 font-semibold mt-2">You have completed all processing steps.</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        setShowBrandScreen(true);
                                        if (!brandImageUrl) {
                                            setTemplateIndex(Math.floor(Math.random() * BRAND_TEMPLATES.length));
                                            setImgLoaded(false);
                                            setUseTemplateFallback(false);
                                            setIsGeneratingBrand(true);
                                            let aiPrompt = "";
                                            try {
                                                aiPrompt = await callGeminiImagePrompt(task.name, task.crop);
                                            } catch (e) {
                                                aiPrompt = await callGroqImagePrompt(task.name, task.crop);
                                            }
                                            setBrandImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=400&height=400&nologo=true`);
                                            setIsGeneratingBrand(false);
                                        }
                                    }}
                                    className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-violet-200 transition-all text-sm flex justify-center items-center gap-2 w-full max-w-sm"
                                >
                                    <FaBoxOpen className="h-5 w-5" /> Generate Brand & Packaging
                                </button>
                            </div>
                        )}
                        {steps.map((s, i) => {
                            const isCompleted = i < currentStep;
                            const isActive = i === currentStep;
                            const isLocked = i > currentStep;

                            return (
                                <div key={i} className={`rounded-3xl border-2 overflow-hidden transition-all duration-300 ${isCompleted ? 'bg-green-50 border-green-200 opacity-70' : isActive ? 'bg-white border-violet-400 shadow-xl' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                    {/* Step Header */}
                                    <div className="p-5 flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black flex-shrink-0 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                                            {isCompleted ? "✓" : i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? "text-violet-600" : "text-gray-500"}`}>{s.stepName || s.day || `STEP ${i + 1}`}</p>
                                                    <p className={`font-bold leading-relaxed ${isActive ? "text-gray-900 text-base" : "text-gray-700 text-sm"}`}>{s.action}</p>
                                                </div>
                                                {s.estimatedCost > 0 && <span className="bg-red-50 text-red-600 border border-red-100 text-xs px-2 py-1 rounded-lg font-bold flex-shrink-0">est. ₹{s.estimatedCost}</span>}
                                            </div>

                                            {/* Active Step Actions & Chat */}
                                            {isActive && (
                                                <div className="mt-5 border-t border-gray-100 pt-5">
                                                    {(s.reasoning || task.bestOptionReason) && (
                                                        <div className="bg-violet-50 rounded-2xl p-4 mb-4 border border-violet-100">
                                                            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><FaBrain /> AI Reasoning</p>
                                                            <p className="text-sm font-semibold text-violet-900">{s.reasoning || task.bestOptionReason}</p>
                                                        </div>
                                                    )}

                                                    <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
                                                        <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">Do you have completed this step?</p>
                                                        <button onClick={() => completeStep(task.id, i)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-black px-6 py-2.5 rounded-xl shadow transition-all flex items-center gap-2">
                                                            Yes, Mark as Done <MdCheckCircle />
                                                        </button>
                                                    </div>

                                                    {/* Step Chat */}
                                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FaRobot /> Expert AI Assistant</p>
                                                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                                            {(chatLogs[i] || []).map((msg, idx) => (
                                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                                                        {msg.content}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {isThinking && <div className="text-xs text-gray-400 italic">AI is typing...</div>}
                                                            {!(chatLogs[i] || []).length && <p className="text-sm text-gray-400 italic text-center py-2">Got a question about this step? Just ask below.</p>}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={chatInputs[i] || ""}
                                                                onChange={e => setChatInputs(prev => ({ ...prev, [i]: e.target.value }))}
                                                                onKeyDown={e => e.key === 'Enter' && handleSendChat(i)}
                                                                placeholder="Ask AI for help with this step..."
                                                                className="flex-1 text-sm bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                                                            />
                                                            <button onClick={() => handleSendChat(i)} disabled={isThinking} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all ${isThinking ? 'bg-gray-400' : 'bg-violet-600 hover:bg-violet-700'}`}>
                                                                <MdSend className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isLocked && <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 font-semibold"><MdLock /> Locked until previous step is done</div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </motion.div>
    );
};
const MdTimeline = () => <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

/* ══════════════════════════════════════════════════════════════
   STEP BAR
══════════════════════════════════════════════════════════════ */
const STEPS = ["Crop Input", "AI Analysis", "Results", "Action"];
const StepBar = ({ current }) => (
    <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
            <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < current ? "bg-violet-600 text-white" : i === current ? "bg-violet-500 text-white ring-4 ring-violet-100" : "bg-gray-200 text-gray-400"}`}>
                        {i < current ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${i === current ? "text-violet-600" : "text-gray-400"}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${i < current ? "bg-violet-500" : "bg-gray-200"}`} />}
            </React.Fragment>
        ))}
    </div>
);

const DemandBadge = ({ demand }) => {
    const m = { High: "bg-green-100 text-green-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-red-100 text-red-700" };
    return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m[demand] || "bg-gray-100 text-gray-600"}`}>{demand === "High" ? "📈" : demand === "Medium" ? "📊" : "📉"} {demand}</span>;
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT OVERVIEW
══════════════════════════════════════════════════════════════ */
const AIValueEngine = () => {
    const navigate = useNavigate();
    const { startTask } = useAiTrackerStore();

    const [step, setStep] = useState(0);
    const [decision, setDecision] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [processMode, setProcessMode] = useState(null);
    const [activeTrackerId, setActiveTrackerId] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [mandiData, setMandiData] = useState(null);
    const [thoughts, setThoughts] = useState([]);
    const [thoughtDone, setThoughtDone] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [cropSearch, setCropSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const [form, setForm] = useState({ crop: "Wheat", quantity: "1000", location: "", lat: null, lng: null });

    /* ── Fixed Search Logic to look across ALL categories if searching ── */
    const displayCrops = cropSearch.trim()
        ? CROP_CATEGORIES.All.filter(c => c.name.toLowerCase().includes(cropSearch.toLowerCase()))
        : getCategoryCrops(activeCategory);

    const handleGPS = async () => {
        setGpsLoading(true);
        try {
            const loc = await getUserLocation();
            const address = await reverseGeocode(loc.lat, loc.lng);
            setForm(f => ({ ...f, location: address, lat: loc.lat, lng: loc.lng }));
            toast.success(`📍 ${address}`);
        } catch { toast.error("GPS failed. Type location manually."); }
        finally { setGpsLoading(false); }
    };

    const handleVoice = () => {
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Rec) { toast.error("Voice not supported."); return; }
        const r = new Rec();
        r.lang = "hi-IN";
        r.onstart = () => { setIsListening(true); toast("🎙️ Listening…"); };
        r.onend = () => setIsListening(false);
        r.onerror = () => { setIsListening(false); toast.error("Voice failed."); };
        r.onresult = (e) => {
            const t = e.results[0][0].transcript.toLowerCase();
            toast.success(`Heard: "${t}"`);
            const found = CROP_CATEGORIES.All.find(c => t.includes(c.name.toLowerCase()));
            if (found) {
                setForm(f => ({ ...f, crop: found.name }));
                setCropSearch(""); // clear search on voice match
            }
            const qty = t.match(/\d+/);
            if (qty) setForm(f => ({ ...f, quantity: qty[0] }));
        };
        r.start();
    };

    const handleSubmit = async () => {
        if (!form.location.trim()) { toast.error("Please enter your location."); return; }
        if (!form.quantity || isNaN(form.quantity) || +form.quantity <= 0) { toast.error("Please enter a valid quantity."); return; }

        setThoughts([]);
        setThoughtDone(false);
        setStep(1);

        const addThought = (t) => setThoughts(prev => [...prev, t]);

        try {
            const [mandi, result] = await Promise.all([
                fetchMandiData(form.crop, form.location),
                callGroqAI({ ...form, mandiData: null }, addThought), // We actually pass null mandi here but prompt says its known via other means
            ]);
            setMandiData(mandi);
            setAiResult(result);
            setSelectedProduct(result.processedProducts?.[0] || null);
            setThoughtDone(true);
            setTimeout(() => setStep(2), 600);
        } catch (err) {
            console.error(err);
            toast.error("AI analysis failed.");
            setStep(0);
        }
    };

    const [planThoughts, setPlanThoughts] = useState([]);

    const handleStartInteractivePlan = () => {
        setProcessMode("generating_plan");
        setPlanThoughts([]);
        const thoughts = [
            `⚙️ Creating production environment for ${selectedProduct.name}…`,
            `📦 Scheduling ${selectedProduct.processingTime} processing window…`,
            `🔧 Resolving required resources: ${selectedProduct.requirements}…`,
            `📋 Outlining ${selectedProduct.stepsInfo?.length || 3} optimal action steps…`,
            `💸 Factoring estimated budget of ₹${selectedProduct.processingCost}/kg…`,
            `✅ Plan successfully optimized and ready.`
        ];

        let localStep = 0;
        const interval = setInterval(() => {
            if (localStep < thoughts.length) {
                const currentThought = thoughts[localStep];
                setPlanThoughts(prev => [...prev, currentThought]);
                localStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    const newTask = startTask({
                        crop: form.crop,
                        quantity: form.quantity,
                        location: form.location,
                        ...selectedProduct
                    });
                    setActiveTrackerId(newTask.id);
                    setProcessMode("ai_tracker");
                }, 800);
            }
        }, 800);
    };

    const cropEmoji = getCropEmoji(form.crop);

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-16">
            <div className="hidden md:block bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                            <FaBrain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black font-display">AI Value Engine</h1>
                            <p className="text-purple-200 text-sm">Powered by Groq AI · Farm2Value</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {step !== 1 && processMode !== "ai_tracker" && <StepBar current={step} />}

                <AnimatePresence mode="wait">
                    {/* ──── STEP 0 ──── */}
                    {step === 0 && (
                        <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MdTrendingUp className="h-5 w-5 text-orange-500" />
                                    <h2 className="font-black text-gray-800 text-base">Popular Crops by Demand</h2>
                                    <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full ml-1">Trending</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                    {POPULAR_CROPS.map(c => (
                                        <button key={c.name} onClick={() => { setForm(f => ({ ...f, crop: c.name })); setCropSearch(""); }}
                                            className={`flex flex-col items-center p-3 rounded-2xl border-2 text-center transition-all ${form.crop === c.name ? "border-violet-500 bg-violet-50 shadow-md" : "border-gray-100 hover:border-violet-200"}`}>
                                            <span className="text-2xl">{c.emoji}</span>
                                            <span className={`text-[11px] font-bold mt-1 ${form.crop === c.name ? "text-violet-700" : "text-gray-700"}`}>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-black text-gray-800 text-base mb-4">Select Crop Type</h2>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Object.keys(CROP_CATEGORIES).map(cat => (
                                        <button key={cat} onClick={() => {
                                            setActiveCategory(cat);
                                            setCropSearch("");
                                            const catCrops = getCategoryCrops(cat);
                                            if (catCrops.length > 0) {
                                                setForm(f => ({ ...f, crop: catCrops[0].name }));
                                            }
                                        }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${activeCategory === cat && !cropSearch.trim() ? "border-violet-500 bg-violet-500 text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-violet-300"}`}>
                                            {CATEGORY_ICONS[cat]} {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative mb-4">
                                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" value={cropSearch} onChange={e => setCropSearch(e.target.value)} placeholder="Search or type crop name (e.g. Cotton)…"
                                        className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" />
                                    {cropSearch && !CROP_CATEGORIES.All.find(c => c.name.toLowerCase() === cropSearch.trim().toLowerCase()) && (
                                        <button onClick={() => { setForm(f => ({ ...f, crop: cropSearch })); setCropSearch(""); toast.success(`Crop set to: ${cropSearch}`); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold">Use "{cropSearch}"</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
                                    {displayCrops.map(c => (
                                        <button key={c.name} onClick={() => { setForm(f => ({ ...f, crop: c.name })); setCropSearch(""); }}
                                            className={`flex flex-col items-center p-2.5 rounded-xl border-2 text-center transition-all ${form.crop === c.name ? "border-violet-500 bg-violet-50 shadow-sm" : "border-gray-100 hover:border-violet-200"}`}>
                                            <span className="text-xl">{c.emoji}</span>
                                            <span className={`text-[10px] font-bold mt-0.5 leading-tight ${form.crop === c.name ? "text-violet-700" : "text-gray-600"}`}>{c.name}</span>
                                        </button>
                                    ))}
                                    {displayCrops.length === 0 && <div className="col-span-8 text-center text-gray-400 py-6 text-sm">No match. Click "Use {cropSearch}" to add manually.</div>}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                                <h2 className="font-black text-gray-800 text-base">Quantity & Location</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Quantity (kg) 📦</label>
                                        <div className="relative"><input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field pr-16" placeholder="1000" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">kg</span></div>
                                    </div>
                                    <div>
                                        <label className="label">Location 📍</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field flex-1" placeholder="Village, District, State…" />
                                            <button onClick={handleGPS} disabled={gpsLoading} className="px-4 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition flex items-center"><MdLocationOn className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleSubmit} className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-base rounded-2xl transition hover:shadow-xl hover:shadow-violet-200 flex items-center justify-center gap-2">
                                    <FaBrain className="h-5 w-5" /> Analyse <span key={cropSearch.trim() || form.crop}>{cropSearch.trim() ? getCropEmoji(cropSearch.trim()) : cropEmoji} {cropSearch.trim() || form.crop}</span> <MdArrowForward className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ──── STEP 1: AI LOADING ──── */}
                    {step === 1 && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center space-y-6">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 bg-violet-600 rounded-full flex items-center justify-center shadow-lg"><FaBrain className="text-white h-10 w-10" /></div>
                                <div className="absolute inset-0 border-4 border-violet-200 border-t-violet-700 rounded-full animate-spin"></div>
                            </div>
                            <div><h2 className="text-xl font-black">AI is analysing…</h2><p className="text-gray-500 text-sm mt-1">Building action plan</p></div>
                            <div className="bg-gray-900 max-w-sm mx-auto p-4 rounded-xl text-left">
                                {thoughts.slice(-2).map((t, i) => <p key={i} className="text-green-400 text-xs font-mono">› {t}</p>)}
                            </div>
                        </motion.div>
                    )}

                    {/* ──── STEP 2: SUMMARY ──── */}
                    {step === 2 && aiResult && (
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* AI Detailed Crop Summary */}
                            <div className="bg-white border-2 border-dashed border-violet-300 p-5 rounded-2xl mb-6">
                                <h3 className="text-violet-800 font-black text-sm flex items-center gap-2 mb-2"><FaBrain className="text-violet-600" /> AI Detailed Market Summary</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{aiResult.cropSummary}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="w-8 h-8 rounded-full bg-amber-400 font-bold flex items-center justify-center text-white mb-2">🟡</div>
                                        <p className="text-sm font-bold text-amber-900">Sell Raw</p>
                                        <p className="text-3xl font-black text-amber-800">₹{Number(aiResult.rawTotalEarning).toLocaleString("en-IN")}</p>
                                        <p className="text-[11px] font-bold text-amber-600/80 mt-0.5 mb-2">for {form.quantity} kg ({form.quantity / 100} Quintal)</p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-amber-200/60">
                                        <p className="text-amber-800 text-sm font-black mb-0.5">📍 Real Mandi Price: ₹{mandiData?.priceKg}/kg</p>
                                        <p className="text-amber-600 text-[11px] font-bold uppercase tracking-wider mb-2">Source: {mandiData?.bestMandi}</p>
                                        <p className="text-amber-700/90 text-xs italic">" {aiResult.rawAdvice} "</p>
                                    </div>
                                </div>
                                {selectedProduct && (
                                    <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 relative flex flex-col justify-between">
                                        <div>
                                            <div className="w-8 h-8 rounded-full bg-green-500 font-bold flex items-center justify-center text-white mb-2">🔵</div>
                                            <p className="text-sm font-bold text-green-900">End Product: {selectedProduct.name}</p>
                                            <p className="text-3xl font-black text-green-800">₹{Number(selectedProduct.totalEarning).toLocaleString("en-IN")}</p>
                                            <p className="text-[11px] font-bold text-green-600/80 mt-0.5 mb-2">for {form.quantity} kg ({form.quantity / 100} Quintal)</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-green-200/60">
                                            <p className="text-green-700 text-sm font-black mb-1">+₹{Number(selectedProduct.extraEarning).toLocaleString("en-IN")} Extra Profit</p>
                                            <p className="text-green-600/90 text-xs italic">" {aiResult.bestOptionReason} "</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-black text-gray-800 text-sm mb-3">Select a Custom Product to Process:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {aiResult.processedProducts.map((p, i) => (
                                    <div key={i} onClick={() => setSelectedProduct(p)} className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${selectedProduct?.name === p.name ? 'border-violet-500 bg-violet-50 shadow-md ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300 bg-white'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-base text-gray-900 leading-tight mr-2">{p.name}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.demand === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.demand} Demand</span>
                                        </div>
                                        <div className="flex flex-col items-start gap-0.5 mb-3">
                                            <p className="font-black text-2xl text-violet-700">₹{Number(p.totalEarning).toLocaleString("en-IN")}</p>
                                            <p className="text-[10px] font-bold text-gray-400">for {form.quantity} kg ({form.quantity / 100} Qtl)</p>
                                        </div>
                                        <p className="text-[11px] font-black text-emerald-600 mb-3 bg-emerald-50 inline-block px-2 py-0.5 rounded shadow-sm border border-emerald-100">+₹{Number(p.extraEarning).toLocaleString("en-IN")} Extra</p>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] text-gray-600 border-t border-gray-100 pt-3">
                                            <div className="flex flex-col"><span className="uppercase font-bold text-gray-400 text-[9px] tracking-wider">Cost</span><span className="font-semibold">₹{p.processingCost}/kg</span></div>
                                            <div className="flex flex-col"><span className="uppercase font-bold text-gray-400 text-[9px] tracking-wider">Time</span><span className="font-semibold">{p.processingTime}</span></div>
                                            <div className="flex flex-col"><span className="uppercase font-bold text-gray-400 text-[9px] tracking-wider">Difficulty</span><span className="font-semibold">{p.difficulty}</span></div>
                                            <div className="flex flex-col"><span className="uppercase font-bold text-gray-400 text-[9px] tracking-wider">Market</span><span className="font-semibold truncate">{p.marketWhere}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-900 rounded-2xl p-6">
                                <h3 className="text-white font-black text-lg mb-4 text-center">How to proceed?</h3>
                                <div className="flex gap-3">
                                    <button onClick={() => { setDecision("RAW"); setStep(3); }} className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm">🟡 Sell Raw Produce</button>
                                    <button onClick={() => { setDecision("PROCESS"); setStep(3); }} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl text-sm shadow-md transition hover:scale-105">🔵 Start Action Plan</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──── STEP 3: EXECUTE / ROUTING ──── */}
                    {step === 3 && decision === "RAW" && (
                        <motion.div key="rawFlow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-center space-y-4">
                            <h2 className="text-xl font-black text-amber-900">Sell via Marketplace</h2>
                            <p className="text-amber-800">List your {form.crop} directly to regional buyers.</p>
                            <button onClick={() => navigate("/equipment")} className="w-full py-4 bg-amber-500 text-white font-black rounded-xl">Go to Marketplace</button>
                        </motion.div>
                    )}

                    {step === 3 && decision === "PROCESS" && !processMode && (
                        <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div onClick={handleStartInteractivePlan} className="cursor-pointer bg-white border-2 border-green-400 p-6 rounded-3xl group hover:shadow-xl">
                                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-4"><FaBrain className="text-white h-6 w-6" /></div>
                                <h3 className="font-black text-lg text-gray-800">Proceed with AI</h3>
                                <p className="text-xs text-gray-500 mt-2 bg-green-50 px-2 py-1 rounded inline-block font-bold">Interactive Guide + Tracking</p>
                                <p className="text-sm mt-3 text-gray-600">Get step-by-step instructions, cost trackers, and chat with AI for each specific step.</p>
                                <p className="mt-4 text-green-600 font-bold text-sm flex items-center gap-1">Start <MdArrowForward /></p>
                            </div>
                            <div onClick={() => navigate("/experts")} className="cursor-pointer bg-white border-2 border-indigo-400 p-6 rounded-3xl group hover:shadow-xl">
                                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4"><MdPerson className="text-white h-6 w-6" /></div>
                                <h3 className="font-black text-lg text-gray-800">Expert Advice — ₹199</h3>
                                <p className="text-sm mt-3 text-gray-600">Book a 30-min call with an agriculture expert to set up your processing plant safely.</p>
                                <p className="mt-4 text-indigo-600 font-bold text-sm flex items-center gap-1">Book <MdArrowForward /></p>
                            </div>
                        </motion.div>
                    )}

                    {/* ──── INTERACTIVE PLAN GENERATION LOADING ──── */}
                    {processMode === "generating_plan" && (
                        <motion.div key="gen_plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center space-y-6">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-green-600 rounded-full flex items-center justify-center shadow-lg"><FaClipboardList className="text-white h-10 w-10" /></div>
                                <div className="absolute inset-0 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-800">Generating Interactive Plan…</h2>
                                <p className="text-gray-500 text-sm mt-1">Configuring AI Expert for {selectedProduct?.name}</p>
                            </div>
                            <div className="bg-gray-900 max-w-lg mx-auto p-5 rounded-2xl text-left shadow-xl overflow-hidden border border-gray-800">
                                <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-2">AI Execution Console</span>
                                </div>
                                <div className="space-y-2.5">
                                    {planThoughts.map((t, i) => (
                                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`text-xs font-mono flex items-start gap-2 ${i === 5 && t.includes('✅') ? 'text-green-400 font-bold' : 'text-green-300/80'}`}>
                                            <span className="text-gray-500 shrink-0">[{new Date().toLocaleTimeString('en-IN', { hour12: false })}]</span> {t}
                                        </motion.p>
                                    ))}
                                    {planThoughts.length < 6 && (
                                        <p className="text-green-300/40 text-xs font-mono animate-pulse flex items-start gap-2">
                                            <span className="text-gray-500/50 shrink-0">[{new Date().toLocaleTimeString('en-IN', { hour12: false })}]</span> _
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──── INTERACTIVE PLAN TRACKER ──── */}
                    {processMode === "ai_tracker" && activeTrackerId && (
                        <InteractiveTracker trackerId={activeTrackerId} onGoDashboard={() => navigate("/dashboard")} />
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIValueEngine;
