import { HealthAnalysis } from "../types";
import { GoogleGenAI } from "@google/genai";
import { db, auth } from "../lib/firebase";
import { doc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";

// Initialize Gemini
// In AI Studio, process.env.GEMINI_API_KEY is injected via vite.config.ts
// In GitHub/Production, ensure GEMINI_API_KEY is set in environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const getEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  const host = window.location.hostname;
  if (host.includes('asia-southeast1.run.app')) return 'ai-studio';
  if (host.includes('vercel.app')) return 'vercel';
  if (host.includes('github.app') || host.includes('github.io')) return 'github';
  return 'other';
};

async function trackApiUsage(operation: 'analysis' | 'translation' | 'coaching') {
  try {
    const env = getEnvironment();
    const statsRef = doc(db, 'admin', 'stats');
    
    console.log(`[Aura] Tracking API usage: ${operation} on ${env}`);

    // Update global stats using merge to handle non-existent document
    await setDoc(statsRef, {
      totalCalls: increment(1),
      [`calls_${operation}`]: increment(1),
      [`env_${env}`]: increment(1),
      lastCallAt: serverTimestamp()
    }, { merge: true });

    // Log individual call for detailed tracking
    await addDoc(collection(db, 'api_logs'), {
      operation,
      environment: env,
      userId: auth.currentUser?.uid || 'anonymous',
      timestamp: serverTimestamp(),
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
    });
  } catch (error) {
    console.error("Failed to track API usage:", error);
  }
}

export async function translateAnalysis(analysis: HealthAnalysis, targetLanguage: string): Promise<HealthAnalysis> {
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  await trackApiUsage('translation');

  const prompt = `
    You are an expert medical translator. Translate the following JSON object representing a biometric health analysis into ${targetLanguage}.
    
    CRITICAL INSTRUCTIONS:
    1. Maintain the exact JSON structure and keys.
    2. Only translate the string values for: summary, label, facial_signs (array items), systemic_implication, tip, disclaimer, and challenge title/description/task.
    3. Do NOT translate the 'status' values ('optimal', 'fair', 'attention_needed').
    4. Do NOT translate the 'affected_regions' values.
    5. Do NOT change any numbers or scores.
    6. Return ONLY valid JSON.

    JSON to translate:
    ${JSON.stringify(analysis, null, 2)}
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const parsed = JSON.parse(result.text || "{}");
    return { ...parsed, language: targetLanguage } as HealthAnalysis;
  } catch (error: any) {
    console.error("Aura Translation Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The Gemini API key provided is invalid. Please check your GEMINI_API_KEY setting.");
    }
    throw error;
  }
}

export async function generateCoachingMessage(history: HealthAnalysis[], latest: HealthAnalysis, language: string): Promise<string> {
  if (!apiKey || apiKey === "undefined") return "Keep up the great work on your wellness journey!";

  await trackApiUsage('coaching');

  const prompt = `
    You are Aura, the user's ultimate Health Coach Bestie. Your tone is super conversational, supportive, and uses "regular talking language" (like a friend would text). Avoid overly clinical jargon.
    Analyze the user's latest health scan and their scan history to provide personalized, encouraging feedback.
    Language: ${language}.
    
    Latest Scan: ${JSON.stringify(latest)}
    History: ${JSON.stringify(history)}
    
    Provide a short, punchy, and humanized coaching message (max 2 sentences).
    Example: "Omg, your stress markers are way down! Whatever you're doing, keep it up bestie! ✨"
    Return ONLY the message text.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return result.text?.trim() || "Keep up the great work on your wellness journey!";
  } catch (error: any) {
    console.error("Aura Coaching Error:", error);
    return "Keep up the great work on your wellness journey!";
  }
}

export async function analyzeFaceHealth(base64Image: string, language: string = 'English', focusArea: string = 'General Wellness'): Promise<HealthAnalysis> {
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  await trackApiUsage('analysis');

  const prompt = `
    You are Aura, the user's ultimate Health Coach Bestie. Your task is to analyze the provided facial image to detect health markers, but explain them in "regular talking language" that's easy to understand. Think of yourself as a super-smart friend who knows everything about health but explains it simply.

    ### TONE & LANGUAGE PROTOCOL:
    1. **Conversational First:** Use super friendly, supportive, and regular talking language. Avoid sounding like a cold medical report.
    2. **Simple Explanations:** Instead of "Periorbital puffiness indicating renal stress," say "Your eyes look a bit puffy today, which might mean your kidneys are working overtime or you need more water, bestie! 💧"
    3. **Bestie Vibes:** Use encouraging phrases, lots of emojis, and focus on actionable, easy-to-understand advice. If you see something that needs attention, say it gently like a friend would.
    4. **Language Requirement:** You MUST return all text fields in the following language: ${language}.

    ### RIGOROUS ACCURACY PROTOCOL:
    1. **Visual Evidence Only:** Base your findings strictly on visible markers in the image. Do not hallucinate.
    2. **Confidence Scoring:** For every indicator, provide a confidence score (0.0 to 1.0). If lighting is poor or features are obscured, lower the confidence significantly.
    3. **Micro-Marker Detection:** Look for minute details: capillary breakage, pore size distribution, subtle skin tone shifts, and texture.
    4. **Systemic Correlation:** Link facial markers to internal physiological systems (Endocrine, Digestive, Cardiovascular, Renal, Hepatic).

    ### FOCUS AREA:
    The user has requested a specific focus on: **${focusArea}**.
    Ensure that your analysis heavily weights this area. Provide exactly 5 key health indicators.

    ### BIOMETRIC MAPPING PARAMETERS:
    (Explain results in simple, catchy terms)
    1. Vascular & Oxygenation (Lip/Sclera/Cheek) -> "Glow & Flow"
    2. Metabolic & Endocrine (Jawline/Neck/Eyes) -> "Energy & Balance"
    3. Digestive & Gut-Skin Axis (Forehead/Mouth/Cheeks) -> "Gut-Skin Connection"
    4. Dermatological Integrity -> "Skin Strength"

    ### 7-DAY CHALLENGE:
    Identify the most critical finding. Generate a personalized 7-day wellness challenge that feels like a "Fun Quest" or a "Mini-Game" to level up their health. 🎮🌈
    - The 'title' should be catchy and fun.
    - The 'description' should be super encouraging and bestie-like.
    - Each day should have a small, actionable task that feels like "leveling up."

    ### RESPONSE REQUIREMENTS:
    - Return ONLY valid JSON.
    - Provide exactly 5 indicators in the 'indicators' array.
    - If the image is unclear, lower the 'confidence' score accordingly.
    
    ### BUSINESS INTEGRATION:
    1. **Recommended Products:** Suggest 2-3 specific types of products that would help the user. Explain WHY in simple terms.
    2. **Personalized Nutrition:** Provide 2 simple meal ideas that target the critical findings. Explain why they are good for the user like a nutritionist friend would.

    ### JSON STRUCTURE:
    {
      "summary": "A friendly, conversational summary of the overall scan results.",
      "overall_score": 0,
      "indicators": [
        {
          "label": "A simple, catchy name for the indicator",
          "status": "optimal|fair|attention_needed",
          "score": 0-100,
          "confidence": 0.0-1.0,
          "facial_signs": ["Simple description of what you see", "..."],
          "affected_regions": ["forehead", "eyes", "cheeks", "nose", "mouth", "jawline", "skin_overall"],
          "systemic_implication": "A simple explanation of what this means for their health"
        }
      ],
      "recommendations": [
        { "category": "...", "tip": "A fun, actionable tip" }
      ],
      "products": [
        { "name": "...", "type": "SKINCARE|SUPPLEMENT", "reason": "Simple reason why this is good for them", "link": "#", "brand": "...", "price": "..." }
      ],
      "meals": [
        { 
          "title": "...", 
          "description": "Why this meal is a game-changer for them", 
          "ingredients": ["...", "..."],
          "image_keyword": "...",
          "nutritional_info": { "calories": 0, "protein": "...", "carbs": "...", "fats": "..." }
        }
      ],
      "challenge": { ... },
      "disclaimer": "..."
    }
  `;

  try {
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    };

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: { parts: [imagePart, { text: prompt }] },
      config: { responseMimeType: "application/json" }
    });
    const parsed = JSON.parse(result.text || "{}");
    return { ...parsed, language } as HealthAnalysis;
  } catch (error: any) {
    console.error("Aura Analysis Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The Gemini API key provided is invalid. Please check your GEMINI_API_KEY setting.");
    }
    throw error;
  }
}
