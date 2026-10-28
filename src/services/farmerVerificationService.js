/**
 * Farmer Identity Verification Service
 * ─────────────────────────────────────
 * Priority 1 : xAI Grok Vision  (grok-2-vision-latest → grok-vision-beta)
 * Priority 2 : Groq              (llama-3.2-90b-vision-preview → llama-4 models)
 * Priority 3 : Gemini 1.5 Flash
 *
 * ACCEPTED DOCS   : Kisan Card, 7/12 Utara, Kisan Passbook, PM Kisan, Land record
 * REJECTED DOCS   : Aadhaar Card, PAN Card, Voter ID, Passport, Driving License
 *
 * Cross-verification: name / phone / village from the form are checked against
 * what is visible in the document. Mismatches lower confidence.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY || "";

// ─── Image Compression ───────────────────────────────────────────────────────

async function compressImage(file, maxPx = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg", dataUrl });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

/** Compress to tiny thumbnail for Firebase storage (~10–20 KB) */
export async function compressThumbnail(file) {
  const { dataUrl } = await compressImage(file, 200, 0.6);
  return dataUrl;
}

// ─── Cross-verification helper ────────────────────────────────────────────────

/**
 * Fuzzy name match — normalise, split into tokens, check overlap.
 * Ignores case, extra spaces, common title prefixes.
 */
function namesMatch(formName = "", docName = "") {
  if (!formName || !docName) return null; // can't compare
  const clean = (s) =>
    s.toLowerCase()
      .replace(/\b(mr|mrs|ms|dr|shri|smt|kumari|kumar)\b\.?/g, "")
      .replace(/[^a-z\u0900-\u097f ]/g, "")
      .trim();

  const a = clean(formName).split(/\s+/).filter(Boolean);
  const b = clean(docName).split(/\s+/).filter(Boolean);
  if (!a.length || !b.length) return null;

  // Count how many tokens from form name exist in doc name
  const matches = a.filter((t) => b.some((bt) => bt.includes(t) || t.includes(bt)));
  const score = matches.length / Math.max(a.length, b.length);
  return score >= 0.5; // at least half the tokens match
}

function locationsMatch(formVillage = "", docVillage = "") {
  if (!formVillage || !docVillage) return null;
  const clean = (s) => s.toLowerCase().replace(/[^a-z\u0900-\u097f]/g, "");
  const a = clean(formVillage);
  const b = clean(docVillage);
  if (!a || !b) return null;
  return b.includes(a) || a.includes(b);
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(userDetails) {
  const { name, phone, village, role } = userDetails;
  const isExpert = role === "expert";

  return `You are a strict Indian document verification AI for an agricultural platform.

USER DETAILS ENTERED IN FORM:
- Full Name  : "${name}"
- Mobile No. : "${phone}"
- Village/City: "${village}"
- Role       : "${role}"

=== TASK ===
1. Identify the document type from the image.
2. Determine if it is an ACCEPTED document for a ${isExpert ? 'agricultural expert' : 'farmer'}.
3. Extract visible information from the document.
4. Cross-verify: compare the name/phone/location from the FORM with what is visible in the document.

=== ACCEPTED DOCUMENTS (ONLY these — strictly) ===
${isExpert ? `✅ Agriculture Degree Certificate (B.Sc Ag, M.Sc Ag, PhD)
✅ Post-Graduate Certificate or Diploma (from recognized institutions/platforms)
✅ University ID card indicating Agriculture department
✅ Government Agriculture Officer ID
✅ Authorized Agronomist Certificate
✅ State/National Agricultural Board Registration` : `✅ Kisan Credit Card (KCC) / Kisan Debit Card
✅ 7/12 Utara (Satbara) — Maharashtra land record issued by tehsil office
✅ Kisan Passbook / Kisan Vikas Patra
✅ PM-Kisan registration certificate / PM-Kisan Samman Nidhi letter
✅ Land ownership certificate (Jamabandi / Fard / Khatian)
✅ Farmer registration certificate from state agriculture department`}

=== REJECTED DOCUMENTS (DO NOT accept these) ===
${isExpert ? `❌ Blank documents, selfies, memes
❌ Generic ID (Aadhaar, PAN, Voter ID) unless it explicitly states Agriculture Designation` : `❌ Aadhaar Card
❌ PAN Card
❌ Voter ID / Election Card
❌ Passport
❌ Driving License
❌ Ration Card
❌ Any non-farmer-specific ID`}

=== CROSS-VERIFICATION RULES ===
- Compare the FORM NAME with the name visible in the document (case-insensitive, partial match is okay)
- Compare the FORM VILLAGE with any location/village/district visible in the document (partial match ok)
- Compare the FORM PHONE with any mobile number visible (if shown)
- A name mismatch MUST lower confidence significantly.
- If no name is visible in doc, nameMatch = null (cannot verify)

=== RESPONSE FORMAT ===
Return ONLY valid JSON — no markdown, no code fences, no extra text:

{
  "isGenuine": true,
  "confidence": 82,
  "docType": "Document Name",
  "rejectionReason": null,
  "extractedInfo": {
    "name": "Ramesh Patil or null",
    "phone": "9876543210 or null",
    "location": "Nashik or null"
  },
  "crossVerification": {
    "nameMatch": true,
    "phoneMatch": null,
    "locationMatch": true,
    "summary": "Name matches. Location matches."
  },
  "reason": "Clear document with name visible and matching the form entry."
}

IMPORTANT:
- isGenuine = false if document is in the rejected list.
- isGenuine = false if image is blank, a meme, cartoon, selfie, or random photo.
- Set rejectionReason to a clear message when isGenuine = false.
- nameMatch = true if names are reasonably similar (ignore case, titles, minor spelling).
- nameMatch = false if names clearly differ.
- nameMatch = null if name is not visible in document.`;
}

// ─── Provider: xAI Grok Vision ───────────────────────────────────────────────

async function verifyWithXAI(base64, mimeType, farmerDetails) {
  const models = ["grok-2-vision-latest", "grok-vision-beta"];
  let lastErr = null;

  for (const model of models) {
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: buildPrompt(farmerDetails) },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          }],
          temperature: 0.1,
          max_tokens: 700,
        }),
      });
      const raw = await res.text();
      if (!res.ok) { lastErr = new Error(`xAI[${model}] HTTP ${res.status}: ${raw.slice(0, 150)}`); continue; }
      const text = JSON.parse(raw)?.choices?.[0]?.message?.content || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { lastErr = new Error(`xAI[${model}]: no JSON in response`); continue; }
      return { ...JSON.parse(match[0]), provider: "xAI Grok" };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("xAI: all model attempts failed");
}

// ─── Provider: Groq Vision ────────────────────────────────────────────────────

async function verifyWithGroq(base64, mimeType, farmerDetails) {
  const models = [
    "llama-3.2-90b-vision-preview",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
  ];
  let lastErr = null;

  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: buildPrompt(farmerDetails) },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          }],
          temperature: 0.1,
          max_tokens: 700,
        }),
      });
      const raw = await res.text();
      if (!res.ok) { lastErr = new Error(`Groq[${model}] HTTP ${res.status}: ${raw.slice(0, 150)}`); continue; }
      const text = JSON.parse(raw)?.choices?.[0]?.message?.content || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { lastErr = new Error(`Groq[${model}]: no JSON`); continue; }
      return { ...JSON.parse(match[0]), provider: "Groq" };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Groq: all model attempts failed");
}

// ─── Provider: Gemini ─────────────────────────────────────────────────────────

async function verifyWithGemini(base64, mimeType, farmerDetails) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: buildPrompt(farmerDetails) },
          { inlineData: { mimeType, data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 700 },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${raw.slice(0, 150)}`);
  const text = JSON.parse(raw)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini: no JSON in response");
  return { ...JSON.parse(match[0]), provider: "Gemini" };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Verify a farmer identity document with cross-verification against form data.
 *
 * @param {File}   file          - Uploaded document image
 * @param {object} farmerDetails - { name, phone, village } from the registration form
 * @returns {Promise<VerificationResult>}
 *
 * Result shape:
 * {
 *   isGenuine        : boolean,
 *   confidence       : number (0–100),
 *   docType          : string,
 *   rejectionReason  : string | null,
 *   extractedInfo    : { name, phone, landArea, surveyNo, village, state, issuedBy },
 *   crossVerification: { nameMatch, phoneMatch, locationMatch, summary },
 *   reason           : string,
 *   provider         : string,
 *   clientCrossCheck : { nameMatch, locationMatch } — local JS cross-check as safety net
 * }
 */
export async function verifyFarmerDocument(file, userDetails = {}) {
  const { name = "", phone = "", village = "", role = "farmer" } = userDetails;

  // ── File guards ──
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  if (!allowed.includes((file.type || "").toLowerCase())) {
    return {
      isGenuine: false, confidence: 0, docType: "Invalid", extractedInfo: {},
      rejectionReason: "Please upload a valid image file (JPG, PNG, WebP).",
      crossVerification: {}, reason: "Invalid file type.", provider: "none",
    };
  }
  if (file.size > 15 * 1024 * 1024) {
    return {
      isGenuine: false, confidence: 0, docType: "Invalid", extractedInfo: {},
      rejectionReason: "File too large. Please upload an image under 15 MB.",
      crossVerification: {}, reason: "File too large.", provider: "none",
    };
  }

  // ── Compress ──
  let base64, mimeType;
  try {
    ({ base64, mimeType } = await compressImage(file, 1024, 0.75));
    console.log(`[Verify] Compressed: ~${Math.round(base64.length * 0.75 / 1024)} KB`);
  } catch (e) {
    return {
      isGenuine: false, confidence: 0, docType: "Error", extractedInfo: {},
      rejectionReason: "Could not read the image file.", crossVerification: {},
      reason: "Image processing error.", provider: "none",
    };
  }

  // ── Log key status ──
  console.log("[Verify] Keys —",
    "xAI:", XAI_API_KEY ? `${XAI_API_KEY.slice(0, 8)}…` : "MISSING",
    "Groq:", GROQ_API_KEY ? `${GROQ_API_KEY.slice(0, 10)}…` : "MISSING",
  );

  const errors = [];

  // 1. xAI Grok
  if (XAI_API_KEY?.startsWith("xai-")) {
    try {
      console.log("[Verify] → xAI Grok…");
      const r = await verifyWithXAI(base64, mimeType, { name, phone, village, role });
      return enrichWithClientCrossCheck(r, { name, village });
    } catch (e) { console.warn("[Verify] xAI failed:", e.message); errors.push(`xAI: ${e.message}`); }
  } else { errors.push("xAI key not set"); }

  // 2. Groq
  if (GROQ_API_KEY && GROQ_API_KEY.length > 10) {
    try {
      console.log("[Verify] → Groq…");
      const r = await verifyWithGroq(base64, mimeType, { name, phone, village, role });
      return enrichWithClientCrossCheck(r, { name, village });
    } catch (e) { console.warn("[Verify] Groq failed:", e.message); errors.push(`Groq: ${e.message}`); }
  } else { errors.push("Groq key not set"); }

  // 3. Gemini
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("Dummy")) {
    try {
      console.log("[Verify] → Gemini…");
      const r = await verifyWithGemini(base64, mimeType, { name, phone, village, role });
      return enrichWithClientCrossCheck(r, { name, village });
    } catch (e) { console.warn("[Verify] Gemini failed:", e.message); errors.push(`Gemini: ${e.message}`); }
  } else { errors.push("Gemini key not configured"); }

  throw new Error(`AI verification unavailable. ${errors.join(" | ")}`);
}

/** Add a local JS cross-check as a safety net alongside the AI's cross-check */
function enrichWithClientCrossCheck(result, { name, village }) {
  const docName = result.extractedInfo?.name;
  const docVillage = result.extractedInfo?.village;

  const clientCrossCheck = {
    nameMatch: namesMatch(name, docName),
    locationMatch: locationsMatch(village, docVillage),
  };

  // If AI says isGenuine=true but client detects clear name mismatch, downgrade confidence
  if (
    result.isGenuine &&
    clientCrossCheck.nameMatch === false &&
    (result.crossVerification?.nameMatch !== false) // AI didn't already catch it
  ) {
    result = {
      ...result,
      confidence: Math.max(0, (result.confidence || 70) - 20),
      crossVerification: {
        ...result.crossVerification,
        nameMatch: false,
        summary: (result.crossVerification?.summary || "") +
          " [Client check: entered name does not match document name.]",
      },
    };
  }

  return { ...result, clientCrossCheck };
}
