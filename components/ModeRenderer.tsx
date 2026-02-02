
import React, { useState, useEffect, useRef } from 'react';
import { StudyMode, VideoData, LanguageMode, UILanguage, Sentence } from '../types';

interface ModeRendererProps {
  mode: StudyMode;
  videoData: VideoData;
  currentIndex: number;
  langMode: LanguageMode;
  uiLang: UILanguage;
  onTimeUpdate: (time: number) => void;
  onSentenceEnd: () => void;
  onSentencePrev: () => void;
}

const LOCALES = {
  [UILanguage.JP]: {
    meaning: "意味",
    source: "原文",
    syncing: "同期中...",
    fetching: "AIが字幕を解析中...",
    dictation_placeholder: "聞いた内容を入力してください...",
    typing_placeholder: "タイピングを開始...",
    check_btn: "確認する",
    recognized: "認識されたテキスト",
    replay: "再生",
    perfect: "✓ 正解！",
    wrong: "✗ 違います",
    recording: "録音中...",
    practice_start: "練習を開始する",
    progress: "進捗",
    show_translation: "翻訳を表示",
    hide_translation: "翻訳を隠す"
  },
  [UILanguage.EN]: {
    meaning: "Meaning",
    source: "Source",
    syncing: "Synchronizing...",
    fetching: "AI is fetching transcript...",
    dictation_placeholder: "Type what you hear...",
    typing_placeholder: "Start typing...",
    check_btn: "CHECK",
    recognized: "Transcript Result",
    replay: "REPLAY",
    perfect: "✓ PERFECT",
    wrong: "✗ WRONG",
    recording: "Now Recording...",
    practice_start: "Press to start practice",
    progress: "Progress",
    show_translation: "Show Translation",
    hide_translation: "Hide Translation"
  }
};

const ModeRenderer: React.FC<ModeRendererProps> = ({ 
  mode, videoData, currentIndex, langMode, uiLang, onTimeUpdate, onSentenceEnd, onSentencePrev
}) => {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const sentence = videoData.sentences[currentIndex];
  
  const recognitionRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const l = LOCALES[uiLang];

  const getLangKeys = () => {
    switch (langMode) {
      case LanguageMode.JP_ZH: return { src: 'jp' as keyof Sentence['text'], target: 'zh' as keyof Sentence['text'], code: 'ja-JP' };
      case LanguageMode.JP_EN: return { src: 'jp' as keyof Sentence['text'], target: 'en' as keyof Sentence['text'], code: 'ja-JP' };
      case LanguageMode.ZH_EN: return { src: 'zh' as keyof Sentence['text'], target: 'en' as keyof Sentence['text'], code: 'zh-CN' };
      default: return { src: 'en' as keyof Sentence['text'], target: 'zh' as keyof Sentence['text'], code: 'en-US' };
    }
  };

  const { src, target, code } = getLangKeys();

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = code;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (sentence) speak(sentence.text[src]);
    setUserInput('');
    setIsCorrect(null);
    setRecognizedText('');
  }, [currentIndex, mode, src]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = code;
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setRecognizedText(text);
        const refText = sentence.text[src].toLowerCase().replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '');
        const userText = text.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '');
        setIsCorrect(userText.includes(refText) || refText.includes(userText));
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [sentence, code, src]);

  useEffect(() => {
    let ytPlayer: any = null;
    setIsVideoReady(false);
    const initPlayer = () => {
      if (videoData.type === 'youtube' && mode === StudyMode.VIDEO) {
        ytPlayer = new (window as any).YT.Player('yt-player-target', {
          videoId: videoData.source_url,
          playerVars: { 'autoplay': 1, 'modestbranding': 1, 'rel': 0, 'origin': window.location.origin, 'iv_load_policy': 3 },
          events: {
            'onReady': () => {
              setIsVideoReady(true);
              timerRef.current = setInterval(() => {
                if (ytPlayer?.getCurrentTime) onTimeUpdate(ytPlayer.getCurrentTime());
              }, 500);
            },
            'onStateChange': (e: any) => e.data === (window as any).YT.PlayerState.PLAYING && setIsVideoReady(true)
          }
        });
        playerRef.current = ytPlayer;
      }
    };
    if ((window as any).YT?.Player) initPlayer();
    else (window as any).onYouTubeIframeAPIReady = initPlayer;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ytPlayer?.destroy) ytPlayer.destroy();
    };
  }, [videoData.source_url, mode]);

  const getBoxDisplayText = () => {
    if (mode === StudyMode.TYPING) return sentence.text[src];
    if (mode === StudyMode.DICTATION) return sentence.text[target];
    return sentence.text[target];
  };

  const getBoxDisplayLabel = () => {
    if (mode === StudyMode.TYPING) return l.source;
    return l.meaning;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in duration-700">
      <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl group">
        
        {mode === StudyMode.VIDEO && !isVideoReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-950">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] bg-cover"></div>
            <div className="relative z-30 flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse"><i className="fas fa-play text-indigo-400 text-4xl ml-1"></i></div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest italic">{l.syncing}</h3>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest opacity-60">{l.fetching}</p>
              </div>
            </div>
          </div>
        )}

        {mode === StudyMode.VIDEO ? (
          <div id="yt-player-target" className="w-full h-full scale-105"></div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 space-y-10 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <button 
                onClick={() => speak(sentence.text[src])} 
                className="w-32 h-32 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-6xl shadow-2xl border-4 border-white/10 transition-all hover:scale-110 active:scale-95 group z-10"
              >
                <i className="fas fa-volume-up text-white group-hover:animate-bounce"></i>
              </button>
             <div className="text-center px-12 z-10 max-w-2xl">
                <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.4em] mb-4 opacity-60">{getBoxDisplayLabel()}</p>
                <p className="text-4xl text-gray-200 font-bold leading-tight drop-shadow-lg italic">{getBoxDisplayText()}</p>
             </div>
          </div>
        )}

        {mode === StudyMode.VIDEO && isVideoReady && (
          <div className="absolute bottom-10 left-0 right-0 p-4 text-center pointer-events-none z-10 px-8">
            <div className="inline-block bg-black/80 backdrop-blur-3xl px-10 py-5 rounded-[2rem] border border-white/10 shadow-2xl max-w-[90%] pointer-events-auto">
                <div className="flex items-center justify-center gap-6 mb-2">
                  <p className="text-2xl md:text-3xl font-black text-white italic">{sentence.text[src]}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); speak(sentence.text[src]); }} 
                      className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center transition-all hover:bg-white/20 hover:rotate-180"
                      title={l.replay}
                    >
                      <i className="fas fa-redo-alt text-sm"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowTranslation(!showTranslation); }} 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showTranslation ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      title={showTranslation ? l.hide_translation : l.show_translation}
                    >
                      <i className={`fas ${showTranslation ? 'fa-eye' : 'fa-eye-slash'} text-sm`}></i>
                    </button>
                  </div>
                </div>
                {showTranslation && (
                  <div className="text-sm md:text-lg text-indigo-400 font-black uppercase tracking-widest opacity-80 italic animate-in fade-in slide-in-from-top-1 duration-300">
                    {sentence.text[target]}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-2xl shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between mb-10">
           <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">{l.progress}: {currentIndex + 1} / {videoData.sentences.length}</span>
           <button onClick={() => speak(sentence.text[src])} className="text-gray-400 hover:text-white flex items-center gap-3 text-xs font-black transition-all bg-white/5 px-6 py-3 rounded-2xl hover:bg-indigo-600">
              <i className="fas fa-play-circle text-xl"></i> {l.replay}
            </button>
        </div>

        {mode === StudyMode.DICTATION && (
          <div className="space-y-8">
            <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full h-40 bg-gray-950/50 border-2 border-white/5 focus:border-indigo-500/50 rounded-[2rem] p-10 text-3xl font-bold text-white focus:outline-none" placeholder={l.dictation_placeholder} />
            <div className="flex gap-4">
              <button onClick={() => setIsCorrect(sentence.text[src].trim().toLowerCase().replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '') === userInput.trim().toLowerCase().replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, ''))} className="bg-indigo-600 px-14 py-5 rounded-2xl font-black text-white text-lg">{l.check_btn}</button>
              {isCorrect !== null && <div className={`flex items-center px-10 rounded-2xl font-black text-xl italic ${isCorrect ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10 border border-red-500/20'}`}>{isCorrect ? l.perfect : l.wrong}</div>}
            </div>
          </div>
        )}

        {mode === StudyMode.TYPING && (
          <div className="space-y-16 py-6">
             <div className="text-4xl md:text-6xl font-mono text-center tracking-tight text-gray-800 italic">
               {sentence.text[src].split('').map((char, i) => <span key={i} className={userInput[i] === char ? 'text-white' : userInput[i] ? 'text-red-500' : 'opacity-10'}>{char}</span>)}
             </div>
             <input autoFocus value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full bg-transparent border-b-4 border-indigo-600/30 text-center text-indigo-400 text-5xl py-8 outline-none" placeholder={l.typing_placeholder} />
          </div>
        )}

        {mode === StudyMode.SHADOWING && (
          <div className="flex flex-col items-center gap-12 py-10">
            <button onClick={() => isRecording ? recognitionRef.current?.stop() : (setIsRecording(true), recognitionRef.current?.start())} className={`w-40 h-40 rounded-full flex items-center justify-center text-7xl transition-all relative ${isRecording ? 'bg-red-600 scale-110 shadow-red-900/60' : 'bg-gray-800'}`}><i className={isRecording ? "fas fa-stop text-white" : "fas fa-microphone text-white"}></i></button>
            <div className="text-center space-y-6">
               <p className="text-5xl font-black text-indigo-300 italic">{sentence.text[src]}</p>
               {recognizedText && (
                 <div className="bg-gray-950/50 px-8 py-4 rounded-2xl border border-white/5">
                   <p className="text-xs text-gray-600 font-black uppercase tracking-[0.4em] mb-2">{l.recognized}</p>
                   <p className={`text-2xl font-black italic ${isCorrect ? 'text-emerald-400' : 'text-gray-400'}`}>{recognizedText}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-10 border-t border-white/5 mt-10">
           <div className="text-gray-400 font-black text-2xl tabular-nums italic">{currentIndex + 1} / {videoData.sentences.length}</div>
           <div className="flex gap-5">
              <button disabled={currentIndex === 0} onClick={onSentencePrev} className="bg-gray-950 hover:bg-gray-900 disabled:opacity-5 px-10 py-5 rounded-2xl font-black border border-white/5 transition-all"><i className="fas fa-chevron-left"></i></button>
              <button onClick={onSentenceEnd} className="bg-indigo-600 hover:bg-indigo-500 px-14 py-5 rounded-2xl font-black shadow-xl border border-white/10 transition-all"><i className="fas fa-chevron-right"></i></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ModeRenderer;
