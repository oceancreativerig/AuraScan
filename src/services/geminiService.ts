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
  const model = "gemini-1.5-flash";
  
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
    console.error("Gemini Translation Error:", error);
    throw new Error("Failed to translate results.");
  }
}

export async function generateCoachingMessage(history: HealthAnalysis[], latest: HealthAnalysis, language: string): Promise<string> {
  const model = "gemini-1.5-flash";
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
    console.error("Gemini Coaching Error:", error);
    return "Keep up the great work on your wellness journey!";
  }
}

export async function analyzeFaceHealth(base64Image: string, language: string = 'English', focusArea: string = 'General Wellness'): Promise<HealthAnalysis> {
  const model = "gemini-1.5-flash";
  
  const prompt = `
    You are a world-class AI Biometric Health Analyst specializing in non-invasive physiological assessment via facial mapping. Your task is to analyze the provided high-resolution facial image to detect subtle biometric markers that correlate with systemic health.

    ### LANGUAGE REQUIREMENT:
    You MUST return all text fields (summary, label, facial_signs, systemic_implication, tip, disclaimer, challenge title/description/task) in the following language: ${language}.

    ### FOCUS AREA:
    The user has requested a specific focus on: **${focusArea}**.
    Ensure that your analysis heavily weights this area. Provide exactly 5 key health indicators. At least 2 or 3 of these indicators MUST directly address the requested focus area based on facial markers.

    ### METHODOLOGY:
    Use a combination of modern clinical dermatology and traditional face mapping (Traditional Chinese Medicine/Ayurvedic correlations) to identify potential internal imbalances.

    ### ANALYSIS FOCUS (EXTENDED PARAMETERS):
    1. **Colorimetry & Vascularity:**
       - **Pallor:** Anemia, low circulation (check lips, inner eyelids).
       - **Malar Flush:** Mitral stenosis, high blood pressure, or systemic lupus (butterfly rash).
       - **Cyanosis:** Oxygenation issues (check lip/nail bed hue).
       - **Jaundice:** Liver/Gallbladder (check sclera and skin undertone).
       - **Xanthelasma:** Yellow deposits around eyes (high cholesterol).

    2. **Texture & Hydration:**
       - **Turgor:** Skin elasticity (hydration levels).
       - **Sebum Distribution:** T-zone oiliness vs. cheek dryness (hormonal/metabolic).
       - **Deep Furrows:** Chronic stress or specific organ strain (e.g., vertical line between brows for Liver).

    3. **Periorbital (Eye) Region:**
       - **Dark Circles:** Kidney strain, chronic fatigue, or allergies (allergic shiners).
       - **Puffiness:** Fluid retention, high sodium, or thyroid function.
       - **Arcus Senilis:** White ring around cornea (lipid metabolism).

    4. **Dermatological & Metabolic Markers:**
       - **Angular Cheilitis:** Cracks at mouth corners (B12/Iron deficiency).
       - **Acne Mapping:** Jawline (Hormonal), Forehead (Digestive), Cheeks (Respiratory/Stomach).
       - **Acanthosis Nigricans:** Darkening of skin folds (Insulin resistance/Metabolic health).
       - **Skin Tags:** Often correlated with metabolic syndrome.

    5. **Respiratory & Oxygenation:**
       - **Nasal Flare/Redness:** Respiratory strain or chronic inflammation.
       - **Lip Hue:** Oxygen saturation levels.

    6. **Micronutrient Status:**
       - **Zinc Markers:** White spots or specific texture changes.
       - **Vitamin C:** Redness or easy bruising markers.

    ### 7-DAY CHALLENGE:
    Identify the most critical finding (the indicator with the lowest score). Generate a personalized 7-day wellness challenge that is DIRECTLY linked to improving this specific indicator.
    - The 'title' should explicitly mention the area being improved.
    - The 'description' should explain how these tasks address the critical finding.
    - Each day should have a small, actionable task that helps improve that specific health marker.

    ### FEW-SHOT EXAMPLE (English):
    If you see: "Deep horizontal forehead lines, dry skin, and slight puffiness under eyes."
    Your indicator should be:
    {
      "label": "Digestive & Kidney Function",
      "status": "fair",
      "score": 65,
      "confidence": 0.88,
      "facial_signs": ["Deep forehead furrows", "Periorbital edema"],
      "affected_regions": ["forehead", "eyes"],
      "systemic_implication": "Forehead lines often correlate with digestive stress or high sugar intake, while under-eye puffiness suggests the kidneys are working harder to manage fluid balance."
    }

    ### RESPONSE REQUIREMENTS:
    - Return ONLY valid JSON.
    - Provide exactly 5 indicators in the 'indicators' array.
    - Be clinically objective but maintain a wellness-focused tone.
    - If the image is unclear, lower the 'confidence' score accordingly.
    
    ### GENERAL RECOMMENDATIONS:
    Provide 3-4 general, actionable wellness tips in the 'recommendations' array. Categorize them (e.g., 'Nutrition', 'Hydration', 'Sleep', 'Lifestyle') and provide a brief, helpful tip for each.
    
    Example of recommendations:
    [
      { "category": "Nutrition", "tip": "Increase intake of leafy greens to boost iron and vitamin levels." },
      { "category": "Hydration", "tip": "Aim for 2-3 liters of water daily to support metabolic function." }
    ]

    ### BUSINESS INTEGRATION (NEW):
    1. **Recommended Products:** Suggest 2-3 specific types of products (e.g., "Hyaluronic Acid Serum", "Zinc Supplement") that would help the user based on their results. Include a realistic brand name and price.
    2. **Personalized Nutrition:** Provide 2 simple meal ideas that target the critical findings. For each meal, provide:
       - A descriptive 'image_keyword' for finding a relevant photo (e.g., "salmon-salad", "green-smoothie").
       - Detailed 'nutritional_info' including calories, protein, carbs, and fats.

    ### JSON STRUCTURE:
    {
      "summary": "...",
      "overall_score": 0,
      "indicators": [...],
      "recommendations": [
        { "category": "...", "tip": "..." }
      ],
      "products": [
        { "name": "Product Name", "type": "SKINCARE|SUPPLEMENT", "reason": "Why this helps", "link": "#", "brand": "Brand Name", "price": "$29.99" }
      ],
      "meals": [
        { 
          "title": "Meal Name", 
          "description": "How it helps", 
          "ingredients": ["item 1", "item 2"],
          "image_keyword": "keyword",
          "nutritional_info": {
            "calories": 450,
            "protein": "25g",
            "carbs": "40g",
            "fats": "15g"
          }
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
    console.error("Gemini Analysis Error Details:", JSON.stringify(error, null, 2));
    
    // Check if it's a quota/rate limit error
    const errorMessage = error?.message?.toLowerCase() || "";
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("resource_exhausted")) {
      throw new Error("Gemini API Quota Exceeded. Please check your API key billing details or try again later.");
    }
    
    throw new Error(`Failed to analyze facial health: ${error.message || "Unknown error"}`);
  }
}
