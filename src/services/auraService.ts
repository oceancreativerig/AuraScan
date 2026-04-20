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
    const result = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const parsed = JSON.parse(result.text || "{}");
    const translated = { ...parsed, language: targetLanguage } as HealthAnalysis;
    translationCache[cacheKey] = translated;
    return translated;
  } catch (error: any) {
    console.error("Aura Translation Error:", error);
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
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const message = result.text?.trim() || "Keep it up!";
    coachingCache[cacheKey] = message;
    return message;
  } catch (error: any) {
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
    - If ${scanType} is 'evening', focus on recovery, inflammation markers, and "Evening Wind-down".
    - Factor in the External Vitality Data (like steps or sleep) to validate what you see on the face. (e.g., if sleep was low and eyes look puffy, explain the connection).

    ### RIGOROUS ACCURACY PROTOCOL (STRICT):
    1. **Early Warning Detection:** Look for subtle signs of chronic fatigue, early-stage dehydration, micronutrient deficiencies (e.g., Vitamin B12/Iron markers), and hormonal fluctuations. 
    2. **Visual Evidence Only:** Base findings strictly on visible markers (capillary congestion, facial asymmetry, skin turgor, eye coloration, hyperpigmentation patterns).
    3. **Confidence Scoring:** For every indicator, provide a confidence score (0.0 to 1.0).
    4. **Systemic Deep-Dive:** Map markers to specific systems using known clinical correlations: Cardiovascular (lip color/micro-vessels), Renal (periorbital region), Hepatic (sclera/cheek pigmentation), and Endocrine (jawline/forehead texture).
    
    ### FORMATTING & TONE:
    1. **Markdown Summary:** Use **Bold**, *Italics*, and Bullet points.
    2. **Tone:** Supportive Bestie vibes, but with professional biomedical depth. Reference specific physiological concepts (e.g., "capillary dilation," "epidermal barrier integrity"). 
    3. **Actionability:** Recommendations MUST be highly specific.

    ### BIOMETRIC MAPPING PARAMETERS:
    (Explain results in simple, catchy terms but with underlying medical rigor)
    1. Vascular & Oxygenation (Lip/Sclera/Cheek) -> "Glow & Flow" (Bloodflow & Cell Health)
    2. Metabolic & Endocrine (Jawline/Neck/Eyes) -> "Energy & Balance" (Hormones & Stress)
    3. Digestive & Gut-Skin Axis (Forehead/Mouth/Cheeks) -> "Inner Harmony" (Gut Health & Inflammation)
    4. Dermatological Integrity -> "Dermal Shield" (Skin Barrier & Resilience)

    ### 7-DAY CHALLENGE:
    Generate a personalizeable 7-day wellness quest that targets the #1 vulnerability found in the scan.

    ### RECOMMENDATIONS, PRODUCTS & NUTRITION (STRICT):
    1. **Recommendations (MANDATORY):** Provide exactly 5 highly specific tips. Categories: 'Nutrition', 'Hydration', 'Sleep', 'Exercise', 'Stress Management', 'Skincare', 'Lifestyle'.
    2. **Products (MANDATORY):** Provide exactly 3 products. Use 'Aura Prime' or 'Aura Skin' as brand if unknown. MUST include: name, type, reason, price, and a placeholder link.
    3. **Personalized Nutrition (MANDATORY):** Provide exactly 3 specific meals. High-quality image_keywords (e.g., 'colorful-quinoa-bowl').
       - MUST include nutritional_info: calories (number), protein (string like '20g'), carbs (string like '30g'), fats (string like '10g').
       - The 'description' MUST connect the meal to a specific biometric marker seen in the scan.

    ### JSON STRUCTURE (STRICT):
    {
      "summary": "Immersive, markdown-formatted overview of current vitality state.",
      "overall_score": 0,
      "daily_readiness": {
        "score": 0-100,
        "label": "e.g., Peak Performance | Recovery Mode | High Vitality",
        "description": "Short reasoning for today's readiness score."
      },
      "indicators": [
        {
          "label": "Catchy name",
          "status": "optimal|fair|attention_needed",
          "score": 0-100,
          "confidence": 0.0-1.0,
          "facial_signs": ["Specific markers seen, e.g., 'Minor vascular congestion under lower eyelids'"],
          "affected_regions": ["forehead", "eyes", "cheeks", "nose", "mouth", "jawline", "skin_overall"],
          "systemic_implication": "Deep explanation of internal connection",
          "technical_insight": "A brief medical/dermatological term for the finding"
        }
      ],
      "recommendations": [
        { "category": "category", "tip": "specific actionable tip" }
      ],
      "products": [
        { "name": "name", "type": "SKINCARE|SUPPLEMENT", "reason": "why this helps the facial signs", "link": "link", "brand": "brand", "price": "$0.00" }
      ],
      "meals": [
        {
          "title": "meal name",
          "description": "why this helps your biometric state",
          "ingredients": ["item1", "item2"],
          "image_keyword": "keywords-for-image",
          "nutritional_info": { "calories": 0, "protein": "0g", "carbs": "0g", "fats": "0g" }
        }
      ],
      "challenge": { ... },
      "disclaimer": "Standard biometric disclaimer."
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

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: content,
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
