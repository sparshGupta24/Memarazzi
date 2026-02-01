
export interface MemeMatch {
  id: string;
  timestamp: number;
  mood: string;
  action: string;
  memeTitle: string;
  memeCaption: string;
  snapshotUrl: string;
  memeImageUrl?: string;
  sourceUrl?: string;
  humorStyle: string;
}

export interface AnalysisResult {
  mood: string;
  action: string;
  memeTitle: string;
  memeCaption: string;
}

export type HumorStyle = 'classic' | 'savage' | 'wholesome' | 'sarcastic' | 'brainrot';
