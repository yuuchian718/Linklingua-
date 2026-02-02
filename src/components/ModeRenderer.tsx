import React from "react";
import { StudyMode, VideoData, LanguageMode, UILanguage } from "../types";

interface Props {
  mode: StudyMode;
  videoData: VideoData;
  currentIndex: number;
  langMode: LanguageMode;
  uiLang: UILanguage;
  onTimeUpdate: (t: number) => void;
  onSentenceEnd: () => void;
  onSentencePrev: () => void;
}

const ModeRenderer: React.FC<Props> = ({ mode, currentIndex }) => {
  return (
    <div className="text-xl text-white">
      Current mode: {mode} <br />
      Current index: {currentIndex}
    </div>
  );
};

export default ModeRenderer;

