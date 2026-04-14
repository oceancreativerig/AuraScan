import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  challenge: {
    title: string;
    description: string;
    days: { day: number; task: string }[];
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
    const response = await ai.models.generateContent({
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

export async function analyzeFaceHealth(base64Image: string, language: string = 'English', focusArea: string = 'General Wellness'): Promise<HealthAnalysis> {
  const model = "gemini-3-flash-preview";
  
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
    Based on the most critical finding (the indicator with the lowest score) or the requested focus area (${focusArea}), generate a personalized 7-day wellness challenge. Each day should have a small, actionable task that helps improve that specific health marker.

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
    
    ### JSON STRUCTURE:
    {
      "summary": "A detailed clinical summary of the biometric findings.",
      "overall_score": number (0-100),
      "indicators": [
        { 
          "label": "System Name", 
          "status": "optimal|fair|attention_needed", 
          "score": number,
          "confidence": number (0.0-1.0),
          "facial_signs": ["sign 1", "sign 2"],
          "affected_regions": ["forehead", "eyes", "cheeks", "nose", "mouth", "jawline", "skin_overall"],
          "systemic_implication": "Detailed correlation text." 
        }
      ],
      "recommendations": [
        { "category": "DIET|LIFESTYLE|SKINCARE|SUPPLEMENTS", "tip": "Actionable advice" }
      ],
      "challenge": {
        "title": "Challenge Title",
        "description": "Challenge description",
        "days": [
          { "day": 1, "task": "Task description" },
          { "day": 2, "task": "Task description" },
          { "day": 3, "task": "Task description" },
          { "day": 4, "task": "Task description" },
          { "day": 5, "task": "Task description" },
          { "day": 6, "task": "Task description" },
          { "day": 7, "task": "Task description" }
        ]
      },
      "disclaimer": "This analysis is for informational purposes only and is not a medical diagnosis."
    }
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return { ...result, language } as HealthAnalysis;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Check if it's a quota/rate limit error
    const errorMessage = error?.message?.toLowerCase() || "";
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("resource_exhausted")) {
      throw new Error("Gemini API Quota Exceeded. Please check your API key billing details or try again later.");
    }
    
    throw new Error("Failed to analyze facial health. Please try again.");
  }
}
