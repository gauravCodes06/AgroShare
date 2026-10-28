import React, { useState, useEffect, useRef } from "react";
import { MdChat, MdClose, MdMic, MdSend, MdMicOff, MdLaunch, MdCheckCircle, MdCancel, MdSearch, MdWork } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

// ─── Intent Recognition & Action Handler ──────────────────────────────────────
const ACTION_MAP = [
    {
        keywords: ["equipment", "इक्विपमेंट", "अवजार", "शेअर", "ट्रॅक्टर", "tractor", "euiplement", "equiment", "साहित्य", "भाड्याने"],
        subActions: [
            { keywords: ["add", "जोडा", "नवीन", "पोस्ट", "upload", "create"], action: "NAVIGATE_ADD_EQUIPMENT", route: "/dashboard?tab=add", label: "Add Equipment 🚜" }
        ],
        defaultAction: "NAVIGATE_EQUIPMENT", route: "/equipment", label: "Equipment Sharing 🚜",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी शेअर इक्विपमेंट डॅशबोर्ड उघडत आहे… 🚜",
            hi: "जी बिल्कुल! मैं आपके लिए उपकरण शेयरिंग डैशबोर्ड खोल रहा हूँ… 🚜",
            en: "Sure! Opening the Equipment Sharing Dashboard for you… 🚜"
        }
    },
    {
        keywords: ["labour", "labor", "मजूर", "लेबर", "कामगार", "hire", "भरती", "कामावर"],
        subActions: [
            { keywords: ["my dashboard", "माझा डॅशबोर्ड", "माझे काम", "seek"], action: "NAVIGATE_LABOUR_DASHBOARD", route: "/labour-dashboard", label: "Labour Dashboard 👷" }
        ],
        defaultAction: "NAVIGATE_HIRE_LABOUR", route: "/labour-market", label: "Hire Labour Market 👷",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी मजूर भरती (Labour Market) डॅशबोर्ड उघडत आहे… 👷",
            hi: "जी बिल्कुल! मैं आपके लिए मजदूर भर्ती डैशबोर्ड खोल रहा हूँ… 👷",
            en: "Sure! Opening the Hire Labour Market for you… 👷"
        }
    },
    {
        keywords: ["mandi", "मंडी", "बाजार", "भाव", "दर", "price", "rate", "किंमत"],
        defaultAction: "NAVIGATE_MANDI", route: "/mandi-prices", label: "Mandi Prices 📊",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी थेट बाजार भाव (Live Mandi Prices) उघडत आहे… 📊",
            hi: "जी बिल्कुल! मैं आपके लिए लाइव मंडी भाव खोल रहा हूँ… 📊",
            en: "Sure! Opening Live Mandi Prices for you… 📊"
        }
    },
    {
        keywords: ["pesticide", "exchange", "कीटकनाशक", "खत", "fertilizer", "औषध", "अ‍ॅग्रो एक्सचेंज"],
        defaultAction: "NAVIGATE_PESTICIDE", route: "/pesticide-exchange", label: "Agro Exchange 🌿",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी अ‍ॅग्रो एक्सचेंज (Pesticide & Input Exchange) उघडत आहे… 🌿",
            hi: "जी बिल्कुल! मैं आपके लिए एग्रो एक्सचेंज खोल रहा हूँ… 🌿",
            en: "Sure! Opening Agro Exchange for you… 🌿"
        }
    },
    {
        keywords: ["ai", "recommend", "सल्ला", "पिक", "crop", "value", "भविष्यवाणी"],
        defaultAction: "NAVIGATE_AI", route: "/ai-recommendations", label: "AI Recommendations 🤖",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी AI पिक मूल्य सल्लागार (AI Recommendations) उघडत आहे… 🤖",
            hi: "जी बिल्कुल! मैं आपके लिए AI फसल सिफारिश इंजन खोल रहा हूँ… 🤖",
            en: "Sure! Opening AI Crop Recommendations for you… 🤖"
        }
    },
    {
        keywords: ["market", "store", "मार्केट", "खरेदी", "दुकान", "बियाणे", "seed"],
        defaultAction: "NAVIGATE_AGROMARKET", route: "/agromarket", label: "AgroMarket 🛒",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी अ‍ॅग्रोमार्केट स्टोअर उघडत आहे… 🛒",
            hi: "जी बिल्कुल! मैं आपके लिए एग्रोमार्केट स्टोर खोल रहा हूँ… 🛒",
            en: "Sure! Opening AgroMarket Store for you… 🛒"
        }
    },
    {
        keywords: ["expert", "तज्ज्ञ", "डॉक्टर", "सल्लागार", "consult", "माहिती"],
        defaultAction: "NAVIGATE_EXPERTS", route: "/experts", label: "Expert Advice 👨‍🏫",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी कृषी तज्ज्ञ सल्ला (Expert Advice) उघडत आहे… 👨‍🏫",
            hi: "जी बिल्कुल! मैं आपके लिए कृषि विशेषज्ञ सलाह खोल रहा हूँ… 👨‍🏫",
            en: "Sure! Opening Expert Consultations for you… 👨‍🏫"
        }
    },
    {
        keywords: ["dashboard", "डॅशबोर्ड", "माझे खाते", "booking", "बुकिंग"],
        defaultAction: "NAVIGATE_DASHBOARD", route: "/dashboard", label: "Farmer Dashboard 👨‍🌾",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी शेतकरी डॅशबोर्ड उघडत आहे… 👨‍🌾",
            hi: "जी बिल्कुल! मैं आपके लिए किसान डैशबोर्ड खोल रहा हूँ… 👨‍🌾",
            en: "Sure! Opening Farmer Dashboard for you… 👨‍🌾"
        }
    },
    {
        keywords: ["login", "signin", "register", "साइन इन", "लॉगिन", "अकाउंट"],
        defaultAction: "NAVIGATE_AUTH", route: "/auth", label: "Login / Register 🔑",
        responses: {
            mr: "नक्कीच! मी तुमच्यासाठी लॉगिन पृष्ठ उघडत आहे… 🔑",
            hi: "जी बिल्कुल! मैं आपके लिए लॉगिन पेज खोल रहा हूँ… 🔑",
            en: "Sure! Opening Login / Register Page for you… 🔑"
        }
    }
];

function extractNumbers(text) {
    const matches = text.match(/\d+/g);
    return matches ? matches.map(Number) : [];
}

function detectAgentTask(userInput) {
    if (!userInput) return null;
    const lower = userInput.toLowerCase();

    for (const group of ACTION_MAP) {
        const matchesMain = group.keywords.some(k => lower.includes(k));
        if (matchesMain) {
            if (group.subActions) {
                for (const sub of group.subActions) {
                    if (sub.keywords.some(sk => lower.includes(sk))) {
                        return {
                            action: sub.action,
                            route: sub.route,
                            label: sub.label,
                            message: group.responses.mr
                        };
                    }
                }
            }
            return {
                action: group.defaultAction,
                route: group.route,
                label: group.label,
                message: group.responses.mr
            };
        }
    }
    return null;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const FarmerChatbot = () => {
    const navigate = useNavigate();
    const { user, authUser } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            sender: "ai", 
            text: "नमस्कार! मी तुमचा AI शेती सहाय्यक (AgroShare Autonomous Agent) आहे. 🌾\n\nमी तुमच्यासाठी काम करू शकतो:\n1️⃣ मजूर शोधा (उदा. '२०० पेक्षा कमी दराचे मजूर शोधा')\n2️⃣ मजूर भरती ऑफर पाठवा (Confirmation सह)\n3️⃣ जॉब पोस्ट ऑटोमेशन\n4️⃣ डॅशबोर्ड उघडा"
        }
    ]);
    const [input, setInput] = useState("");
    const [listening, setListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // ── Execute Realtime Firebase Query & Automation ──────────────────────────
    const handleAdvancedAgentQuery = async (userText) => {
        const lower = userText.toLowerCase();
        const nums = extractNumbers(userText);
        const targetPrice = nums.length > 0 ? nums[0] : null;

        // Task A: Search Labour by price / budget
        if (lower.includes("labour") || lower.includes("mAJUR") || lower.includes("मजूर") || lower.includes("लेबर") || lower.includes("कामावर")) {
            try {
                const snap = await get(ref(db, "labourProfiles"));
                let labourers = [];
                if (snap.exists()) {
                    const data = snap.val();
                    labourers = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                }

                // Filter by price limit if specified
                let matches = labourers;
                if (targetPrice) {
                    matches = labourers.filter(l => Number(l.dailyRate || 0) <= targetPrice);
                }

                if (matches.length === 0 && labourers.length > 0) {
                    // Show lowest cost available if none under exact budget
                    const sorted = [...labourers].sort((a, b) => Number(a.dailyRate || 0) - Number(b.dailyRate || 0));
                    matches = sorted.slice(0, 3);
                }

                if (matches.length === 0) {
                    return {
                        sender: "ai",
                        text: targetPrice 
                            ? `मी डेटाबेस तपासला, परंतु ₹${targetPrice}/दिवस किंवा त्यापेक्षा कमी दरामध्ये कोणताही मजूर सापडला नाही. तुम्ही 'मजूर भरती' डॅशबोर्डवर नवीन जॉब पोस्ट करू शकता.`
                            : `सध्या कोणतेही मजूर प्रोफाइल उपलब्ध नाहीत. तुम्ही मजूर भरती डॅशबोर्डवर नवीन जॉब पोस्ट करू शकता.`,
                        action: { route: "/labour-market?tab=post-job", label: "Post Job Requirements 🌾" }
                    };
                }

                return {
                    sender: "ai",
                    text: targetPrice
                        ? `मी तुमच्यासाठी ₹${targetPrice}/दिवस पेक्षा कमी दरातील मजूर शोधले आहेत (${matches.length} सापडले):`
                        : `मी तुमच्यासाठी उपलब्ध मजूर शोधले आहेत (${matches.length} सापडले):`,
                    type: "labour_results",
                    labourers: matches,
                    targetPrice
                };
            } catch (err) {
                console.error("Labour query error:", err);
            }
        }

        // Task B: Auto Job Posting
        if (lower.includes("post job") || lower.includes("जॉब पोस्ट") || lower.includes("काम पोस्ट") || lower.includes("मजूर पाहिजे")) {
            const extractedRate = targetPrice || 500;
            const draftJob = {
                title: "Farm Work Requirement",
                workCategory: lower.includes("harvest") || lower.includes("कापणी") || lower.includes("कटाई") ? "Crop Harvesting" : "General Farm Labour",
                wagePerDay: String(extractedRate),
                duration: "As required",
                workersNeeded: 1,
                description: `Auto-generated job request from AI Agent: ${userText}`
            };

            return {
                sender: "ai",
                text: "मी तुमच्या संभाषणावरून खालील जॉब पोस्ट तयार केली आहे. पोस्ट करण्यासाठी कन्फर्म करा:",
                type: "confirm_job_post",
                draftJob
            };
        }

        return null;
    };

    // ── Execute Hire Request with Confirmation ──────────────────────────────
    const handleConfirmHire = async (labourer) => {
        if (!authUser) {
            toast.error("कृपया hire request पाठवण्यासाठी लॉगिन करा.");
            navigate("/auth");
            return;
        }
        try {
            // Create job posting
            const jobRef = push(ref(db, "farmerJobPostings"));
            await set(jobRef, {
                title: `Direct Hire — ${labourer.workCategory || "Farm Labour"}`,
                workCategory: labourer.workCategory || "General Farm Labour",
                description: `Direct hire offer from farmer ${user?.name || "Farmer"} via AI Agent`,
                wagePerDay: labourer.dailyRate || "",
                duration: "As agreed",
                workersNeeded: 1,
                location: user?.village || "",
                farmerId: authUser.uid,
                farmerName: user?.name || "Farmer",
                farmerPhone: user?.phone || "",
                assignedLabourId: labourer.labourId || labourer.id,
                assignedLabourName: labourer.name,
                urgency: "soon",
                status: "open",
                createdAt: new Date().toISOString(),
            });

            // Send notification to labour
            await push(ref(db, `notifications/${labourer.labourId || labourer.id}`), {
                type: "hire_offer",
                message: `Farmer ${user?.name || "A Farmer"} wants to hire you for ₹${labourer.dailyRate}/day via AI Agent! 🤝`,
                createdAt: new Date().toISOString(),
                read: false,
            });

            toast.success(`Hire Request successfully sent to ${labourer.name}! 🤝`, { duration: 4000 });

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: `✅ यश आले! ${labourer.name} (₹${labourer.dailyRate}/दिवस) यांना Hire Request यशस्वीरीत्या पाठवली आहे. त्यांना त्यांच्या डॅशबोर्डवर नोटिफिकेशन मिळाले आहे.`,
                    action: { route: "/labour-market?tab=my-jobs", label: "View Sent Hire Requests 📋" }
                }
            ]);
        } catch (err) {
            console.error("Hire request error:", err);
            toast.error("Could not send hire request.");
        }
    };

    // ── Confirm & Post Job Automatically ──────────────────────────────────────
    const handleConfirmPostJob = async (draftJob) => {
        if (!authUser) {
            toast.error("कृपया जॉब पोस्ट करण्यासाठी लॉगिन करा.");
            navigate("/auth");
            return;
        }
        try {
            await push(ref(db, "farmerJobPostings"), {
                ...draftJob,
                farmerId: authUser.uid,
                farmerName: user?.name || "Farmer",
                farmerPhone: user?.phone || "",
                farmerVillage: user?.village || "",
                status: "open",
                createdAt: new Date().toISOString(),
            });

            toast.success("Job posted successfully via AI Agent! 🌾");

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: `✅ जॉब यशस्वीरीत्या पोस्ट झाला आहे! मजूर आता तुमच्या जॉबसाठी अर्ज करू शकतील.`,
                    action: { route: "/labour-market?tab=my-jobs", label: "Manage Posted Jobs 📁" }
                }
            ]);
        } catch (err) {
            console.error("Post job error:", err);
            toast.error("Could not post job.");
        }
    };

    const getIntelligentResponse = async (userInput) => {
        const groqApiKey = import.meta.env.VITE_GROK_API_KEY || import.meta.env.VITE_GROQ_API_KEY || GROQ_API_KEY;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { 
                            role: "system", 
                            content: `You are an AI Autonomous Agent assistant for the AgroShare farming platform in India.
You help Indian farmers with agricultural queries AND execute platform tasks for them.
Answer directly in the exact same language used by the user (Marathi, Hindi, English, etc.).
Keep answers concise, direct, helpful, and under 3 sentences. No markdown stars or formatting.`
                        },
                        { role: "user", content: userInput }
                    ],
                    temperature: 0.2,
                    max_tokens: 250,
                })
            });
            
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error("Groq AI Error:", error);
        }
        return "मी तुमच्या शेतीविषयक प्रश्नांमध्ये मदत करण्यास तयार आहे! 🌾";
    };

    const handleSend = async (overrideText = null) => {
        const textToSubmit = overrideText || input;
        if (!textToSubmit.trim()) return;

        setMessages(prev => [...prev, { sender: "user", text: textToSubmit }]);
        setInput("");
        setIsTyping(true);

        // 1. Try Advanced Realtime Data Queries & Automation
        const advancedResponse = await handleAdvancedAgentQuery(textToSubmit);
        if (advancedResponse) {
            setMessages(prev => [...prev, advancedResponse]);
            setIsTyping(false);
            return;
        }

        // 2. Check if user prompt matches a Page Navigation Agent Task
        const agentTask = detectAgentTask(textToSubmit);
        if (agentTask) {
            setTimeout(() => {
                navigate(agentTask.route);
                toast.success(`AI Agent: ${agentTask.label} opened! 🚀`, { duration: 3000 });
            }, 600);

            setMessages(prev => [
                ...prev,
                { 
                    sender: "ai", 
                    text: agentTask.message,
                    action: agentTask
                }
            ]);
            setIsTyping(false);
            return;
        }

        // 3. Fallback to Groq AI advice
        const reply = await getIntelligentResponse(textToSubmit);
        setMessages(prev => [...prev, { sender: "ai", text: reply }]);
        setIsTyping(false);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice input is not supported on this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        let lang = 'mr-IN';
        if (match && match[1]) {
            const code = match[1];
            if (code === 'hi') lang = 'hi-IN';
            else if (code === 'mr') lang = 'mr-IN';
            else if (code === 'te') lang = 'te-IN';
            else if (code === 'ta') lang = 'ta-IN';
            else if (code === 'gu') lang = 'gu-IN';
            else if (code === 'bn') lang = 'bn-IN';
            else if (code === 'en') lang = 'en-IN';
        }

        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Speech recognition error:", e);
            setListening(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-[0_10px_25px_-5px_rgba(22,163,74,0.5)] flex items-center justify-center text-white focus:outline-none"
                    >
                        <MdChat className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chatbot Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-16 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 z-[100] w-auto sm:w-[380px] h-[78vh] sm:h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-xl shadow">
                                    🤖
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight flex items-center gap-1.5 text-sm">
                                        शेतकरी एआय बोट (AI Agent)
                                    </h3>
                                    <p className="text-[10px] text-green-200 uppercase tracking-widest font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        ऑटोमेशन &amp; कृषी एजंट
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors focus:outline-none"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quick Agent Actions Bar */}
                        <div className="bg-green-50/80 border-b border-green-100 px-3 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex-shrink-0">Quick Agent:</span>
                            {[
                                { l: "इक्विपमेंट 🚜", r: "/equipment" },
                                { l: "मजूर भरती 👷", r: "/labour-market" },
                                { l: "मंडी भाव 📊", r: "/mandi-prices" },
                                { l: "अ‍ॅग्रो एक्सचेंज 🌿", r: "/pesticide-exchange" },
                            ].map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        navigate(btn.r);
                                        toast.success(`Navigating to ${btn.l}`);
                                    }}
                                    className="whitespace-nowrap px-2.5 py-1 bg-white text-green-800 rounded-lg border border-green-200 font-semibold hover:bg-green-600 hover:text-white transition-all shadow-xs shrink-0"
                                >
                                    {btn.l}
                                </button>
                            ))}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={idx} 
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm ${
                                        msg.sender === "user" 
                                            ? "bg-green-600 text-white rounded-br-none shadow-md shadow-green-600/20" 
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                                    }`}>
                                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                                        {/* Standard Action Button */}
                                        {msg.action && (
                                            <button
                                                onClick={() => navigate(msg.action.route)}
                                                className="mt-2 flex items-center gap-1.5 w-full justify-center px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition shadow-sm"
                                            >
                                                <MdLaunch className="w-4 h-4" />
                                                <span>{msg.action.label} उघडा</span>
                                            </button>
                                        )}

                                        {/* Interactive Labour Results Cards with Hire Confirmation */}
                                        {msg.type === "labour_results" && msg.labourers && (
                                            <div className="mt-3 space-y-2">
                                                {msg.labourers.map((l) => (
                                                    <div key={l.id} className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-xs">{l.name}</p>
                                                            <p className="text-[11px] text-gray-500">{l.workCategory} · ₹{l.dailyRate}/day</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setMessages(prev => [
                                                                    ...prev,
                                                                    {
                                                                        sender: "ai",
                                                                        text: `तुम्हाला नक्की ${l.name} (काम: ${l.workCategory || 'शेती काम'}, दर: ₹${l.dailyRate}/दिवस) यांना Hire Request पाठवायची आहे का?`,
                                                                        type: "confirm_hire",
                                                                        targetLabour: l
                                                                    }
                                                                ]);
                                                            }}
                                                            className="px-2.5 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition shadow-xs"
                                                        >
                                                            Hire 🤝
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Confirmation Card for Hire Request */}
                                        {msg.type === "confirm_hire" && msg.targetLabour && (
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs">
                                                <p className="font-bold text-amber-900">⚠️ कृपया खात्री करा (Confirmation Required):</p>
                                                <p className="text-amber-800">
                                                    मजूर: {msg.targetLabour.name} | दर: ₹{msg.targetLabour.dailyRate}/दिवस
                                                </p>
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleConfirmHire(msg.targetLabour)}
                                                        className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-green-700 transition"
                                                    >
                                                        <MdCheckCircle className="h-4 w-4" /> ho, nakki
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setMessages(prev => [...prev, { sender: "ai", text: "Hire request रद्द करण्यात आली आहे." }]);
                                                        }}
                                                        className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-gray-300 transition"
                                                    >
                                                        <MdCancel className="h-4 w-4" /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirmation Card for Auto Job Posting */}
                                        {msg.type === "confirm_job_post" && msg.draftJob && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-xl space-y-2 text-xs">
                                                <p className="font-bold text-green-900">📋 जॉब माहिती (Job Details):</p>
                                                <p className="text-gray-700">काम: {msg.draftJob.workCategory}</p>
                                                <p className="text-gray-700">दर: ₹{msg.draftJob.wagePerDay}/दिवस</p>
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleConfirmPostJob(msg.draftJob)}
                                                        className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-green-700 transition"
                                                    >
                                                        <MdCheckCircle className="h-4 w-4" /> ho, Post job
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setMessages(prev => [...prev, { sender: "ai", text: "जॉब पोस्ट करणे रद्द केले." }]);
                                                        }}
                                                        className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-gray-300 transition"
                                                    >
                                                        <MdCancel className="h-4 w-4" /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                            <button
                                onClick={startListening}
                                disabled={listening}
                                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                                    listening 
                                        ? "bg-red-100 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title="Speak to AI Agent"
                            >
                                {listening ? <MdMicOff className="w-5 h-5" /> : <MdMic className="w-5 h-5" />}
                            </button>
                            
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="काहीतरी टाईप करा किंवा बोला..."
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all border border-transparent focus:border-green-500"
                            />
                            
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className="w-10 h-10 flex-shrink-0 bg-green-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <MdSend className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FarmerChatbot;

