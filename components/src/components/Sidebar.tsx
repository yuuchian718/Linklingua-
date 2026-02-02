
import React, { useEffect, useRef } from 'react';
import { Sentence, LanguageMode, UILanguage } from '../types';

interface SidebarProps {
  sentences: Sentence[];
  currentIndex: number;
  onSelect: (index: number) => void;
  langMode: LanguageMode;
  uiLang: UILanguage;
}

const Sidebar: React.FC<SidebarProps> = ({ sentences, currentIndex, onSelect, langMode, uiLang }) => {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  const getSourceText = (s: Sentence) => {
    if (langMode === LanguageMode.JP_ZH || langMode === LanguageMode.JP_EN) return s.text.jp;
    if (langMode === LanguageMode.ZH_EN) return s.text.zh;
    return s.text.en;
  };

  const getSubText = (s: Sentence) => {
    if (langMode === LanguageMode.JP_ZH) return s.text.zh;
    if (langMode === LanguageMode.JP_EN) return s.text.en;
    if (langMode === LanguageMode.ZH_EN) return s.text.en;
    return s.text.zh;
  };

  return (
    <div className="w-80 md:w-96 border-r border-white/5 bg-gray-900/30 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
          {uiLang === UILanguage.JP ? "字幕リスト" : "Transcript"}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {sentences.map((s, idx) => (
          <div
            key={s.sentence_id}
            ref={idx === currentIndex ? activeRef : null}
            onClick={() => onSelect(idx)}
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
              idx === currentIndex 
                ? 'bg-indigo-600/20 border-indigo-500/50 shadow-inner scale-[1.02]' 
                : 'border-transparent hover:bg-gray-800/50 text-gray-400'
            }`}
          >
            <p className={`text-base font-bold mb-2 leading-snug ${idx === currentIndex ? 'text-white' : ''}`}>
              {getSourceText(s)}
            </p>
            <div className="text-xs opacity-60 font-medium">
              {langMode === LanguageMode.ALL ? (
                <>
                  <p>{s.text.en}</p>
                  <p>{s.text.zh}</p>
                  <p>{s.text.jp}</p>
                </>
              ) : (
                <p>{getSubText(s)}</p>
              )}
            </div>
            <div className="mt-3 text-[10px] text-gray-600 flex justify-between font-bold uppercase tracking-widest">
              <span>#{idx + 1}</span>
              <span>{Math.floor(s.start)}s - {Math.floor(s.end)}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
