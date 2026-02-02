
export enum StudyMode {
  VIDEO = 'video',
  DICTATION = 'dictation',
  TYPING = 'typing',
  SHADOWING = 'shadowing'
}

export enum LanguageMode {
  JP_ZH = 'jp-zh', 
  JP_EN = 'jp-en', 
  ZH_EN = 'zh-en', 
  EN_ZH = 'en-zh', 
  ALL = 'all'
}

export enum UILanguage {
  EN = 'en',
  JP = 'jp'
}

export interface Sentence {
  sentence_id: string;
  start: number;
  end: number;
  text: {
    en: string;
    zh: string;
    jp: string;
  };
}

export interface VideoData {
  video_id: string;
  source_url: string;
  type: 'youtube' | 'bilibili' | 'direct' | 'other';
  sentences: Sentence[];
}
