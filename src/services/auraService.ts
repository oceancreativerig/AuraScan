import { HealthAnalysis } from "../types";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// In AI Studio, process.env.GEMINI_API_KEY is injected via vite.config.ts
// In GitHub/Production, ensure GEMINI_API_KEY is set in environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function translateAnalysis(analysis: HealthAnalysis, targetLanguage: string): Promise<HealthAnalysis> {
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.");
  }

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

  const prompt = `
    You are Aura, a persistent AI wellness coach. Your tone is motivational, scientific, and friendly.
    Analyze the user's latest health scan and their scan history to provide personalized, encouraging feedback.
    Language: ${language}.
    
    Latest Scan: ${JSON.stringify(latest)}
    History: ${JSON.stringify(history)}
    
    Provide a short, punchy, and humanized coaching message (max 2 sentences).
    Example: "Your fatigue markers dropped 12%. Keep this sleep cycle."
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

  const prompt = `
    You are a world-class AI Biometric Health Analyst specializing in non-invasive physiological assessment via facial mapping. Your task is to analyze the provided high-resolution facial image to detect subtle biometric markers that correlate with systemic health.

    ### RIGOROUS ACCURACY PROTOCOL:
    1. **Visual Evidence Only:** Base your findings strictly on visible markers in the image. Do not hallucinate.
    2. **Confidence Scoring:** For every indicator, provide a confidence score (0.0 to 1.0). If lighting is poor or features are obscured, lower the confidence significantly.
    3. **Micro-Marker Detection:** Look for minute details: capillary breakage, pore size distribution, subtle skin tone shifts (dyschromia), and periorbital texture.
    4. **Systemic Correlation:** Link facial markers to internal physiological systems (Endocrine, Digestive, Cardiovascular, Renal, Hepatic).

    ### LANGUAGE REQUIREMENT:
    You MUST return all text fields (summary, label, facial_signs, systemic_implication, tip, disclaimer, challenge title/description/task) in the following language: ${language}.

    ### FOCUS AREA:
    The user has requested a specific focus on: **${focusArea}**.
    Ensure that your analysis heavily weights this area. Provide exactly 5 key health indicators. At least 2 or 3 of these indicators MUST directly address the requested focus area based on facial markers.

    ### BIOMETRIC MAPPING PARAMETERS:
    1. **Vascular & Oxygenation (Lip/Sclera/Cheek):**
       - Check for Malar flush (Cardiovascular/Autoimmune).
       - Check for Pallor (Anemia/Circulation).
       - Check for Cyanotic hues (Oxygenation).
       - Check for Scleral icterus (Hepatic).

    2. **Metabolic & Endocrine (Jawline/Neck/Eyes):**
       - Check for Acanthosis Nigricans (Insulin Resistance).
       - Check for Xanthelasma (Lipid Metabolism).
       - Check for Periorbital puffiness (Thyroid/Renal).
       - Check for Hirsutism or specific acne patterns (Hormonal).

    3. **Digestive & Gut-Skin Axis (Forehead/Mouth/Cheeks):**
       - Check for Angular cheilitis (Vitamin B/Iron).
       - Check for Forehead furrows (Digestive stress/Hydration).
       - Check for Nasolabial fold depth (Respiratory/Digestive).

    4. **Dermatological Integrity:**
       - Check for Seborrheic distribution.
       - Check for Photo-aging (UV damage).
       - Check for Transepidermal water loss (TEWL) markers.

    ### 7-DAY CHALLENGE:
    Identify the most critical finding (the indicator with the lowest score). Generate a personalized 7-day wellness challenge that is DIRECTLY linked to improving this specific indicator.
    - The 'title' should explicitly mention the area being improved.
    - The 'description' should explain how these tasks address the critical finding.
    - Each day should have a small, actionable task that helps improve that specific health marker.

    ### RESPONSE REQUIREMENTS:
    - Return ONLY valid JSON.
    - Provide exactly 5 indicators in the 'indicators' array.
    - Be clinically objective but maintain a wellness-focused tone.
    - If the image is unclear, lower the 'confidence' score accordingly.
    
    ### BUSINESS INTEGRATION:
    1. **Recommended Products:** Suggest 2-3 specific types of products (e.g., "Hyaluronic Acid Serum", "Zinc Supplement") that would help the user based on their results. Include a realistic brand name and price.
    2. **Personalized Nutrition:** Provide 2 simple meal ideas that target the critical findings. For each meal, provide:
       - A 'image_keyword' string containing 2-3 comma-separated tags for finding a relevant photo (e.g., "salmon,grilled,asparagus" or "smoothie,berry,spinach"). ALWAYS include "food" as one of the tags.
       - Detailed 'nutritional_info' including calories, protein, carbs, and fats.

    ### JSON STRUCTURE:
    {
      "summary": "...",
      "overall_score": 0,
      "indicators": [
        {
          "label": "...",
          "status": "optimal|fair|attention_needed",
          "score": 0-100,
          "confidence": 0.0-1.0,
          "facial_signs": ["...", "..."],
          "affected_regions": ["forehead", "eyes", "cheeks", "nose", "mouth", "jawline", "skin_overall"],
          "systemic_implication": "..."
        }
      ],
      "recommendations": [
        { "category": "...", "tip": "..." }
      ],
      "products": [
        { "name": "...", "type": "SKINCARE|SUPPLEMENT", "reason": "...", "link": "#", "brand": "...", "price": "..." }
      ],
      "meals": [
        { 
          "title": "...", 
          "description": "...", 
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
