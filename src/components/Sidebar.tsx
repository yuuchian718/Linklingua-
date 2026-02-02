import React from "react";
import { LanguageMode, UILanguage } from "../types";

interface SidebarProps {
  sentences: any[];
  currentIndex: number;
  onSelect: (index: number) => void;
  langMode: LanguageMode;
  uiLang: UILanguage;
}

const Sidebar: React.FC<SidebarProps> = ({
  sentences,
  currentIndex,
  onSelect
}) => {
  return (
    <aside className="w-80 bg-gray-900 border-r border-white/10 overflow-y-auto">
      <ul className="p-4 space-y-2">
        {sentences.map((s, i) => (
          <li
            key={i}
            onClick={() => onSelect(i)}
            className={`p-3 rounded cursor-pointer text-sm ${
              i === currentIndex
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {s.text || `Sentence ${i + 1}`}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

