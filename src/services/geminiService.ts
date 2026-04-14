import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HealthAnalysis {
  summary: string;
  overall_score: number;
  indicators: {
    label: string;
    status: 'optimal' | 'fair' | 'attention_needed';
    score: number;
    facial_signs: string[];
    systemic_implication: string;
  }[];
  recommendations: {
    category: string;
    tip: string;
  }[];
  disclaimer: string;
}

export async function analyzeFaceHealth(base64Image: string): Promise<HealthAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this facial image to identify potential full-body and systemic health issues based on facial markers.
    Focus on correlating visible facial cues with internal body systems:
    - Cardiovascular & Circulation (skin tone, lip color, visible capillaries)
    - Digestive & Gut Health (complexion, specific blemish locations like forehead/cheeks)
    - Hormonal Balance (jawline/chin breakouts, hair distribution, skin oiliness)
    - Liver & Kidney Function (sclera color, under-eye puffiness, dark circles)
    - Immune System & Inflammation (chronic redness, swollen lymph nodes if visible, overall puffiness)
    - Hydration & Skin Barrier (dryness, flaking, elasticity)
    - Fatigue & Nervous System (eye area, tension lines, asymmetry)

    IMPORTANT: This is strictly a visual wellness assessment, NOT a medical diagnosis. Provide observations based on visual cues only.
    
    Return the analysis in JSON format with the following structure:
    {
      "summary": "A comprehensive summary of potential full-body health insights based on the facial scan.",
      "overall_score": 85, // A number between 0 and 100 representing overall wellness
      "indicators": [
        { 
          "label": "Cardiovascular Health", 
          "status": "optimal|fair|attention_needed", 
          "score": 90, // A number between 0 and 100
          "facial_signs": ["even skin tone", "normal lip color"], // Specific things seen on the face
          "systemic_implication": "Detailed explanation of what this means for the body." 
        },
        // ... repeat for Digestive & Gut Health, Hormonal Balance, Liver & Kidney Indicators, Immune & Inflammation, Hydration & Skin, Fatigue & Nervous System
      ],
      "recommendations": [
        { "category": "Diet", "tip": "Specific actionable advice" },
        { "category": "Lifestyle", "tip": "Specific actionable advice" }
      ],
      "disclaimer": "A strong medical disclaimer"
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
    return result as HealthAnalysis;
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
