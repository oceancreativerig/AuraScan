import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HealthAnalysis {
  summary: string;
  indicators: {
    label: string;
    status: 'good' | 'fair' | 'concerning';
    observation: string;
  }[];
  recommendations: string[];
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
      "indicators": [
        { "label": "Cardiovascular Health", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Digestive & Gut Health", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Hormonal Balance", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Liver & Kidney Indicators", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Immune & Inflammation", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Hydration & Skin", "status": "good|fair|concerning", "observation": "description" },
        { "label": "Fatigue & Nervous System", "status": "good|fair|concerning", "observation": "description" }
      ],
      "recommendations": ["list of 3-5 personalized full-body wellness tips"],
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
