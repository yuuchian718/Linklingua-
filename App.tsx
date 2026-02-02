
import React, { useState } from 'react';
import { VideoProcessor } from './services/videoProcessor';
import { StudyMode, VideoData, LanguageMode, UILanguage } from './types';
import Sidebar from './components/Sidebar';
import ModeRenderer from './components/ModeRenderer';

const UI_STRINGS = {
  [UILanguage.JP]: {
    title: "LinkLingua",
    subtitle: "動画リンクからAIがリアルな語学教材を高速生成します",
    placeholder: "YouTube / Bilibili リンク...",
    btnAnalyze: "教材を生成する",
    btnProcessing: "解析中...",
    supportYt: "字幕同期",
    supportCaption: "AI検索抽出",
    supportLang: "多言語対応",
    supportType: "学習モード",
    back: "トップ",
    session: "学習セッション",
    modes: {
      [StudyMode.VIDEO]: "ビデオ",
      [StudyMode.DICTATION]: "ディクテーション",
      [StudyMode.TYPING]: "タイピング",
      [StudyMode.SHADOWING]: "シャドーイング"
    }
  },
  [UILanguage.EN]: {
    title: "LinkLingua",
    subtitle: "Transform video links into AI curriculums instantly.",
    placeholder: "Paste YouTube / Bilibili URL...",
    btnAnalyze: "Generate Course",
    btnProcessing: "Analyzing...",
    supportYt: "Sync Captions",
    supportCaption: "AI Search",
    supportLang: "Multi-lingual",
    supportType: "Study Modes",
    back: "Back",
    session: "Study Session",
    modes: {
      [StudyMode.VIDEO]: "VIDEO",
      [StudyMode.DICTATION]: "DICTATION",
      [StudyMode.TYPING]: "TYPING",
      [StudyMode.SHADOWING]: "SHADOWING"
    }
  }
};

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState<StudyMode>(StudyMode.VIDEO);
  const [langMode, setLangMode] = useState<LanguageMode>(LanguageMode.JP_ZH); 
  const [uiLang, setUiLang] = useState<UILanguage>(UILanguage.JP);
  const [currentIndex, setCurrentIndex] = useState(0);

  const t = UI_STRINGS[uiLang];

  const processUrl = async () => {
    if (!url) return;
    setIsProcessing(true);
    try {
      const data = await VideoProcessor.processVideo(url);
      if (data && data.sentences.length > 0) {
        setVideoData(data);
        setCurrentIndex(0);
      } else {
        alert(uiLang === UILanguage.JP ? "字幕の抽出に失敗しました。" : "Failed to extract transcript.");
      }
    } catch (error) {
      console.error("Load failed", error);
      alert(uiLang === UILanguage.JP ? "エラーが発生しました。" : "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onTimeUpdate = (time: number) => {
    if (videoData) {
      const idx = videoData.sentences.findIndex(s => time >= s.start && time <= s.end);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  };

  if (!videoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-950 to-indigo-950 relative font-sans overflow-hidden">
        <div className="absolute top-8 right-8 flex gap-4 z-50">
          <button onClick={() => setUiLang(UILanguage.JP)} className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${uiLang === UILanguage.JP ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-800/50 text-gray-500 hover:text-white'}`}>日本語</button>
          <button onClick={() => setUiLang(UILanguage.EN)} className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${uiLang === UILanguage.EN ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-800/50 text-gray-500 hover:text-white'}`}>English</button>
        </div>

        <div className="w-full max-w-4xl bg-gray-900/30 p-16 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-3xl text-center relative z-10">
          <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic tracking-tighter drop-shadow-2xl animate-in slide-in-from-bottom duration-1000">
            {t.title}
          </h1>
          <p className="text-gray-400 mb-16 text-xl font-medium tracking-tight opacity-80">{t.subtitle}</p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-16">
            <input 
              type="text" 
              placeholder={t.placeholder}
              className="flex-1 bg-gray-950/50 border-2 border-white/5 rounded-[1.5rem] px-8 py-6 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processUrl()}
            />
            <button 
              onClick={processUrl}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 px-12 py-6 rounded-[1.5rem] font-black transition-all text-xl min-w-[240px] shadow-2xl shadow-indigo-900/40 border border-white/10"
            >
              {isProcessing ? t.btnProcessing : t.btnAnalyze}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-gray-500 font-black uppercase tracking-widest">
            <div className="flex flex-col items-center gap-4 bg-white/5 py-8 rounded-[2rem] border border-white/5"><i className="fab fa-youtube text-red-500 text-3xl"></i><span>{t.supportYt}</span></div>
            <div className="flex flex-col items-center gap-4 bg-white/5 py-8 rounded-[2rem] border border-white/5"><i className="fas fa-search text-blue-500 text-3xl"></i><span>{t.supportCaption}</span></div>
            <div className="flex flex-col items-center gap-4 bg-white/5 py-8 rounded-[2rem] border border-white/5"><i className="fas fa-language text-green-500 text-3xl"></i><span>{t.supportLang}</span></div>
            <div className="flex flex-col items-center gap-4 bg-white/5 py-8 rounded-[2rem] border border-white/5"><i className="fas fa-keyboard text-yellow-500 text-3xl"></i><span>{t.supportType}</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-100 font-sans italic-font-fix">
      <Sidebar 
        sentences={videoData.sentences} 
        currentIndex={currentIndex} 
        onSelect={setCurrentIndex} 
        langMode={langMode}
        uiLang={uiLang}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-28 border-b border-white/5 flex items-center justify-between px-12 bg-gray-950/40 backdrop-blur-3xl z-10 shadow-2xl">
          <div className="flex items-center gap-10">
             <button onClick={() => setVideoData(null)} className="text-gray-500 hover:text-white flex items-center gap-3 text-[10px] font-black transition-all group uppercase tracking-[0.4em]">
                <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span className="hidden md:inline">{t.back}</span>
             </button>
             <div className="h-10 w-[2px] bg-white/5 hidden md:block"></div>
             <h2 className="font-black text-gray-200 uppercase tracking-[0.2em] text-2xl italic flex items-center gap-3">
               <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
               {t.session}
             </h2>
          </div>

          <div className="flex bg-gray-900/80 rounded-[1.5rem] p-2 border border-white/5 shadow-2xl">
            {Object.values(StudyMode).map((mode) => (
              <button 
                key={mode} 
                onClick={() => setCurrentMode(mode)} 
                className={`px-10 py-3.5 rounded-[1.2rem] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-all ${currentMode === mode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t.modes[mode]}
              </button>
            ))}
          </div>

          <select 
            value={langMode} 
            onChange={(e) => setLangMode(e.target.value as LanguageMode)} 
            className="bg-gray-900 text-[10px] md:text-xs border border-white/5 rounded-2xl px-8 py-3.5 text-gray-200 font-black uppercase tracking-widest shadow-inner focus:outline-none"
          >
            <option value={LanguageMode.JP_ZH}>JP → ZH</option>
            <option value={LanguageMode.JP_EN}>JP → EN</option>
            <option value={LanguageMode.ZH_EN}>ZH → EN</option>
            <option value={LanguageMode.ALL}>ALL DATA</option>
          </select>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-14 flex flex-col gap-8 bg-gray-950 scrollbar-hide">
          <ModeRenderer 
            mode={currentMode} 
            videoData={videoData} 
            currentIndex={currentIndex} 
            langMode={langMode} 
            uiLang={uiLang}
            onTimeUpdate={onTimeUpdate} 
            onSentenceEnd={() => currentIndex < videoData.sentences.length - 1 && setCurrentIndex(currentIndex + 1)}
            onSentencePrev={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
