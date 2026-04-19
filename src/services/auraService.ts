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

async function trackApiUsage(operation: 'analysis' | 'translation' | 'coaching') {
  try {
    const env = getEnvironment();
    const statsRef = doc(db, 'admin', 'stats');
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`[Aura] Tracking API usage: ${operation} on ${env} for ${today}`);

    // Update global stats using merge to handle non-existent document
    await setDoc(statsRef, {
      totalCalls: increment(1),
      [`calls_${operation}`]: increment(1),
      [`env_${env}`]: increment(1),
      [`daily_${today}`]: increment(1),
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

    ### RIGOROUS ACCURACY PROTOCOL (CRITICAL):
    1. **Early Warning Detection:** Look for subtle signs of chronic fatigue, early-stage dehydration, micronutrient deficiencies (e.g., Vitamin B12/Iron markers), and hormonal fluctuations. 
    2. **Visual Evidence Only:** Base findings strictly on visible markers (capillary congestion, facial asymmetry, skin turgor, eye coloration, hyperpigmentation patterns).
    3. **Confidence Scoring:** For every indicator, provide a confidence score (0.0 to 1.0). If lighting is poor or features are obscured, lower the confidence and specifically mention "Scan Environment Optimization" in the summary.
    4. **Systemic Deep-Dive:** Map markers to specific systems: Cardiovascular (lip color/micro-vessels), Renal (periorbital region), Hepatic (sclera/cheek pigmentation), and Endocrine (jawline/forehead texture).
    
    ### FORMATTING & TONE:
    1. **Markdown Summary:** Use **Bold**, *Italics*, and Bullet points in the 'summary' field.
    2. **Tone:** Supportive, high-energy Bestie vibes, but with professional biomedical depth.
    3. **Actionability:** Recommendations MUST be highly specific (e.g., instead of "Drink more water," say "Increase hydration by 500ml today with added electrolytes to improve skin turgor").

    ### BIOMETRIC MAPPING PARAMETERS:
    (Explain results in simple, catchy terms but with underlying medical rigor)
    1. Vascular & Oxygenation (Lip/Sclera/Cheek) -> "Glow & Flow" (Bloodflow & Cell Health)
    2. Metabolic & Endocrine (Jawline/Neck/Eyes) -> "Energy & Balance" (Hormones & Stress)
    3. Digestive & Gut-Skin Axis (Forehead/Mouth/Cheeks) -> "Inner Harmony" (Gut Health & Inflammation)
    4. Dermatological Integrity -> "Dermal Shield" (Skin Barrier & Resilience)

    ### 7-DAY CHALLENGE:
    Generate a personalizeable 7-day wellness quest that targets the #1 vulnerability found in the scan.

    ### RECOMMENDATIONS, PRODUCTS & NUTRITION (CRITICAL):
    1. **Recommendations:** Provide 3-5 highly specific, actionable tips. Each tip must belong to a category: 'Nutrition', 'Hydration', 'Sleep', 'Exercise', 'Stress Management', 'Skincare', or 'Lifestyle'.
    2. **Products:** Recommend 2-3 products (Skincare or Supplements) that directly address the 'fair' or 'attention_needed' indicators. Include a realistic 'brand' (or 'Aura Specialty'), a 'reason' why it helps the specific facial marker, and a generic 'link' (e.g., placeholder or affiliate-style).
    3. **Personalized Nutrition:** Provide 2-3 specific meal ideas. Each meal MUST have:
       - 'title': Catchy, healthy name.
       - 'description': Why this specific meal helps the user based on their scan.
       - 'image_keyword': 2-3 words for a high-quality food image (e.g., 'salmon-avocado-salad').
       - 'ingredients': List of key functional ingredients.
       - 'nutritional_info': Realistic calories, protein, carbs, and fats.

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
      model: "gemini-flash-latest",
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
