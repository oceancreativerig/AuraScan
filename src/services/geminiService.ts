import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HealthAnalysis {
  summary: string;
  overall_score: number;
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
  disclaimer: string;
}

export async function analyzeFaceHealth(base64Image: string): Promise<HealthAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a highly advanced AI Biometric Health Analyst. Analyze this facial image with clinical precision to identify physiological markers that correlate with systemic health.

    Your analysis must be data-driven and focus on:
    1. Colorimetry: Detect subtle jaundice (yellowing), pallor (anemia/circulation), cyanosis (oxygenation), or malar flush.
    2. Texture & Hydration: Analyze skin turgor, fine lines, and oil distribution.
    3. Periorbital Analysis: Examine dark circles (sleep/kidneys), puffiness (hydration/allergies), and sclera color.
    4. Structural Symmetry: Check for inflammation or localized swelling.

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
          "confidence": 0.95, // A number between 0 and 1 representing AI certainty
          "facial_signs": ["even skin tone", "normal lip color"], // Specific things seen on the face
          "affected_regions": ["skin_overall", "mouth"], // Choose from: forehead, eyes, cheeks, nose, mouth, jawline, skin_overall
          "systemic_implication": "Detailed explanation of what this means for the body." 
        }
      ],
      "recommendations": [
        { "category": "DIET", "tip": "Specific actionable advice" },
        { "category": "LIFESTYLE", "tip": "Specific actionable advice" }
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
