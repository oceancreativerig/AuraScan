import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface HealthAnalysis {
  summary: string;
  overall_score: number;
  language?: string;
  indicators: {
    label: string;
    status: 'optimal' | 'fair' | 'attention_needed';
    score: number;
    confidence: number;
    facial_signs: string[];
    affected_regions: ('forehead' | 'eyes' | 'cheeks' | 'nose' | 'mouth' | 'jawline' | 'skin_overall')[];
    systemic_implication: string;
  }[];
  recommendations: {
    category: string;
    tip: string;
  }[];
  products?: {
    name: string;
    type: 'SKINCARE' | 'SUPPLEMENT';
    reason: string;
    link: string;
    brand?: string;
    price?: string;
  }[];
  meals?: {
    title: string;
    description: string;
    ingredients: string[];
    image_keyword: string;
    nutritional_info: {
      calories: number;
      protein: string;
      carbs: string;
      fats: string;
    };
  }[];
  challenge: {
    title: string;
    description: string;
    days: { day: number; task: string; completed?: boolean }[];
  };
  disclaimer: string;
}

export async function translateAnalysis(analysis: HealthAnalysis, targetLanguage: string): Promise<HealthAnalysis> {
  const model = "gemini-3-flash-preview";
  
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
    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return { ...result, language: targetLanguage } as HealthAnalysis;
  } catch (error: any) {
    console.error("Aura Translation Error:", error);
    const errorMessage = (error?.message || "").toLowerCase();
    const errorString = JSON.stringify(error).toLowerCase();
    
    if (
      errorMessage.includes("429") || 
      errorMessage.includes("quota") || 
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("api key") ||
      errorMessage.includes("api_key_invalid") ||
      errorMessage.includes("invalid") ||
      errorString.includes("429") ||
      errorString.includes("quota") ||
      errorString.includes("api_key_invalid") ||
      errorString.includes("api key not valid") ||
      errorString.includes("invalid_argument")
    ) {
      throw new Error("Daily AI analysis quota reached. Please try again tomorrow or use your own API key in the settings.");
    }
    throw new Error("Failed to translate results.");
  }
}

export async function generateCoachingMessage(history: HealthAnalysis[], latest: HealthAnalysis, language: string): Promise<string> {
  const model = "gemini-3-flash-preview";
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
    const response = await getAIClient().models.generateContent({
      model,
      contents: prompt,
    });
    return response.text?.trim() || "Keep up the great work on your wellness journey!";
  } catch (error: any) {
    console.error("Aura Coaching Error:", error);
    return "Keep up the great work on your wellness journey!";
  }
}

export async function analyzeFaceHealth(base64Image: string, language: string = 'English', focusArea: string = 'General Wellness'): Promise<HealthAnalysis> {
  // Use Flash for General Wellness to save costs (~90% cheaper), Pro for specific health focus areas
  const model = focusArea === 'General Wellness' ? "gemini-3-flash-preview" : "gemini-3.1-pro-preview";
  
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

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  };

  try {
    const response = await getAIClient().models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return { ...result, language } as HealthAnalysis;
  } catch (error: any) {
    console.error("Aura Analysis Error Details:", JSON.stringify(error, null, 2));
    
    // Check if it's a quota/rate limit error or API key error
    const errorMessage = (error?.message || "").toLowerCase();
    const errorString = JSON.stringify(error).toLowerCase();
    
    if (
      errorMessage.includes("429") || 
      errorMessage.includes("quota") || 
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("api key") ||
      errorMessage.includes("api_key_invalid") ||
      errorMessage.includes("invalid") ||
      errorString.includes("429") ||
      errorString.includes("quota") ||
      errorString.includes("api_key_invalid") ||
      errorString.includes("api key not valid") ||
      errorString.includes("invalid_argument")
    ) {
      throw new Error("Daily AI analysis quota reached. Please try again tomorrow or use your own API key in the settings.");
    }
    
    throw new Error(`Failed to analyze facial health: ${error.message || "Unknown error"}`);
  }
}
