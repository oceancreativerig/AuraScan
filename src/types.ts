export type ScanType = 'general' | 'morning' | 'evening';

export interface ExternalHealthData {
  steps?: number;
  sleepHours?: number;
  heartRate?: number;
  lastSynced?: number;
}

export interface HealthAnalysis {
  summary: string;
  overall_score: number;
  language?: string;
  scan_type?: ScanType;
  external_data_context?: ExternalHealthData;
  daily_readiness?: {
    score: number;
    label: string;
    description: string;
  };
  indicators: {
    label: string;
    status: 'optimal' | 'fair' | 'attention_needed';
    score: number;
    confidence: number;
    facial_signs: string[];
    affected_regions: ('forehead' | 'eyes' | 'cheeks' | 'nose' | 'mouth' | 'jawline' | 'skin_overall')[];
    systemic_implication: string;
    technical_insight?: string;
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
