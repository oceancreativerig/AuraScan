import { HealthAnalysis, ScanType, ExternalHealthData } from "../types";
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

// Cache for translations to avoid redundant AI calls
const translationCache: Record<string, HealthAnalysis> = {};
const coachingCache: Record<string, string> = {};

/**
 * Utility for retrying AI calls on transient errors (503, 429)
 */
async function retryWithBackoff<T>(
  action: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    const isTransient = 
      error.message?.includes("high demand") || 
      error.message?.includes("503") || 
      error.message?.includes("429") ||
      error.status === 429 ||
      error.status === 503;

    if (isTransient && retries > 0) {
      console.warn(`Gemini busy/throtled, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(action, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Validates the Gemini API setup and connection.
 */
export async function validateGeminiSetup(): Promise<boolean> {
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return false;
  }
  try {
    // Simple light call to check connectivity
    await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: "ping",
    });
    return true;
  } catch (error) {
    console.error("Gemini Setup Validation failed:", error);
    return false;
  }
}

async function trackApiUsage(operation: 'analysis' | 'translation' | 'coaching') {
  // Fire and forget - don't block the main flow for analytics
  (async () => {
    try {
      const env = getEnvironment();
      const statsRef = doc(db, 'admin', 'stats');
      const today = new Date().toISOString().split('T')[0];
      
      await setDoc(statsRef, {
        totalCalls: increment(1),
        [`calls_${operation}`]: increment(1),
        [`env_${env}`]: increment(1),
        [`daily_${today}`]: increment(1),
        lastCallAt: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, 'api_logs'), {
        operation,
        environment: env,
        userId: auth.currentUser?.uid || 'anonymous',
        timestamp: serverTimestamp(),
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
      });
    } catch (error) {
      console.warn("Silent failure tracking API usage:", error);
    }
  })();
}

export async function translateAnalysis(analysis: HealthAnalysis, targetLanguage: string): Promise<HealthAnalysis> {
  if (targetLanguage === 'English' && (!analysis.language || analysis.language === 'English')) {
    return analysis;
  }

  const cacheKey = `${analysis.id || analysis.overall_score}_${targetLanguage}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  trackApiUsage('translation');

  const prompt = `
    Direct Translation Task:
    Translate this biometric health analysis JSON into ${targetLanguage}.
    
    RULES:
    1. Keep JSON structure exactly as provided.
    2. Translate ONLY value strings for: summary, label, facial_signs, systemic_implication, tip, disclaimer, challenge title/description/task.
    3. Keep technical/status values like 'optimal' or 'forehead' as they are.
    4. Return ONLY valid JSON.

    JSON:
    ${JSON.stringify(analysis)}
  `;

  try {
    const result = await retryWithBackoff(() => ai.models.generateContent({ 
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    }));
    
    const parsed = JSON.parse(result.text || "{}");
    const translated = { ...parsed, language: targetLanguage } as HealthAnalysis;
    translationCache[cacheKey] = translated;
    return translated;
  } catch (error: any) {
    console.error("Aura Translation Error:", error);
    if (error.message?.includes("API key not valid") || error.message?.includes("401")) {
      throw new Error("Gemini Translation Failed: API Authentication Error.");
    }
    return analysis; // Fallback to original if translation fails
  }
}

export async function generateCoachingMessage(history: HealthAnalysis[], latest: HealthAnalysis, language: string): Promise<string> {
  const cacheKey = `${latest.id || latest.overall_score}_${language}`;
  if (coachingCache[cacheKey]) return coachingCache[cacheKey];

  if (!apiKey || apiKey === "undefined") return "Keep up the great work!";

  trackApiUsage('coaching');

  const prompt = `
    You are Aura, a supportive health coach bestie. 
    Language: ${language}.
    
    Latest Stats: ${JSON.stringify(latest.overall_score)}
    Recent Context: ${latest.summary.substring(0, 200)}
    
    Write a 1-sentence supportive text-style message to the user about their health.
    Return ONLY the message.
  `;

  try {
    const result = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    }));
    const message = result.text?.trim() || "Keep it up!";
    coachingCache[cacheKey] = message;
    return message;
  } catch (error: any) {
    console.error("Aura Coaching Error:", error);
    return "Keep up the great work!";
  }
}

export async function analyzeFaceHealth(
  base64Image: string, 
  language: string = 'English', 
  focusArea: string = 'General Wellness',
  scanType: ScanType = 'general',
  externalData?: ExternalHealthData
): Promise<HealthAnalysis> {
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

  await trackApiUsage('analysis');

  const prompt = `
    You are Aura, the user's ultimate Health Coach Bestie. 
    CURRENT CONTEXT:
    - Scan Type: ${scanType} (Morning Kickstart / Evening Review / General)
    - External Vitality Data: ${externalData ? JSON.stringify(externalData) : 'None provided'}
    - Focus Area: ${focusArea}
    - Language: ${language}

    ### CORE DIRECTIVE:
    Integrate the facial analysis with the current context. 
    - If ${scanType} is 'morning', focus on readiness, energy levels, and a morning "Action Plan".
    - If ${scanType} is 'evening', focus on recovery and relaxation.
    - Factor in the External Vitality Data (like steps or sleep) to validate what you see on the face.
    - IMPORTANT: Generate ALL text in this language: ${language}.

    ### SIMPLE TONE PROTOCOL (STRICT):
    1. **No Jargon:** Use simple words that anyone can understand. 
    2. **Avoid:** "Vascular," "Implication," "Dermatological," "Integrity," "Sclera," "Epidermal."
    3. **Instead Use:** "Blood flow," "Skin health," "Eyes," "Energy," "Sleep quality."
    4. **Tone:** Supportive Bestie vibes. Conversational and direct.
    
    ### RIGOROUS ACCURACY:
    1. **Visual Evidence Only:** Base findings strictly on visible markers.
    2. **Confidence Scoring:** For every indicator, provide a confidence score (0.0 to 1.0).
    3. **Systemic Connection:** Briefly connect face signs to how the body feels (e.g., "Puffy eyes often mean you need more water or rest").
    
    ### BIOMETRIC MAPPING (SIMPLE NAMES):
    1. "Glow & Flow" (Blood flow & Skin color)
    2. "Energy & Rest" (How tired or awake you look)
    3. "Inner Balance" (General wellness signs)
    4. "Skin Shield" (How healthy your skin looks)

    ### 7-DAY QUEST:
    Generate a simple 7-day challenge that is easy to follow.

    ### RECOMMENDATIONS, PRODUCTS & NUTRITION:
    1. **Recommendations (MANDATORY):** 5 simple, easy-to-do tips.
    2. **Products (MANDATORY):** 3 helpful products. 
    3. **Nutrition (MANDATORY):** 3 simple, healthy meals with clear ingredients.

    ### JSON STRUCTURE (STRICT):
    {
      "summary": "Simple, short, and friendly overview of how you look today. Use bold and bullet points.",
      "overall_score": 0,
      "language": "${language}",
      "daily_readiness": {
        "score": 0-100,
        "label": "e.g., Ready for anything! | Time to rest | Looking good",
        "description": "One simple sentence on why."
      },
      "indicators": [
        {
          "label": "Simple name (e.g., Eye Brightness, Skin Hydration)",
          "status": "optimal|fair|attention_needed",
          "score": 0-100,
          "confidence": 0.0-1.0,
          "facial_signs": ["Simple signs, e.g., 'Slight dark circles under eyes'"],
          "affected_regions": ["forehead", "eyes", "cheeks", "nose", "mouth", "jawline", "skin_overall"],
          "systemic_implication": "Simple explanation (e.g., 'You might need more sleep')",
          "technical_insight": "Conversational note on what this means"
        }
      ],
      "recommendations": [
        { "category": "category", "tip": "simple tip" }
      ],
      "products": [
        { "name": "name", "type": "SKINCARE|SUPPLEMENT", "reason": "why this helps", "link": "link", "brand": "brand", "price": "$0.00" }
      ],
      "meals": [
        {
          "title": "meal name",
          "description": "why this is good for you today",
          "ingredients": ["item1", "item2"],
          "image_keyword": "keywords-for-image",
          "nutritional_info": { "calories": 0, "protein": "0g", "carbs": "0g", "fats": "0g" }
        }
      ],
      "challenge": { ... },
      "disclaimer": "This is for wellness guidance, not medical advice."
    }
  `;

    try {
    const isDemo = base64Image === 'DEMO_MODE_SIMULATION';
    
    let content;
    if (isDemo) {
      content = { 
        parts: [{ 
          text: `
            ${prompt}
            
            DEMO MODE ENABLED: No real image provided. 
            Generate a high-fidelity synthetic demo report for a person who is slightly dehydrated but otherwise high vitality. 
            
            REQUIRED DEMO DATA:
            - **Summary:** High-energy bestie vibes mentioning "glowing skin but slight thirst".
            - **Indicators:** Include "Hydration Depth" (score: 65, attention_needed) and "Vitamin B12 Vitality" (score: 92, optimal).
            - **Recommendations:** Include specific water intake with electrolytes.
            - **Products:** Recommend a "Hydra-Boost Serum" and "Daily Vitality Multi-Vitamins".
            - **Meals:** Include a "Vibrant Salmon Quinoa Bowl" with "spinach-salmon-lemon" keywords.
            - **Challenge:** A "7-Day Glow-Up" challenge focused on water and rest.
            
            Keep the report professional, actionable, and in the "Bestie" tone. 
            The purpose is to demonstrate AuraScan's full feature set.
          ` 
        }] 
      };
    } else {
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      };
      content = { parts: [imagePart, { text: prompt }] };
    }

    const result = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: content,
      config: { responseMimeType: "application/json" }
    }));
    
    const parsed = JSON.parse(result.text || "{}");
    return { ...parsed, language } as HealthAnalysis;
  } catch (error: any) {
    console.error("Aura Analysis Error:", error);
    const errorDetails = error.message || JSON.stringify(error);
    
    if (errorDetails.includes("API key not valid") || errorDetails.includes("Invalid API Key") || errorDetails.includes("401")) {
      throw new Error(`Gemini API Authentication Failed: The key in AI Studio Settings is being rejected. (Details: ${errorDetails})`);
    }
    
    if (errorDetails.includes("model not found") || errorDetails.includes("404")) {
      throw new Error(`Gemini Model Error: The model 'gemini-3.1-flash-lite-preview' is not available for this key. (Details: ${errorDetails})`);
    }

    if (errorDetails.includes("503") || errorDetails.includes("high demand")) {
      throw new Error(`Gemini is currently overloaded. Please wait a moment and try again. (503 Service Unavailable)`);
    }

    throw new Error(`Gemini API Error: ${errorDetails}`);
  }
}
