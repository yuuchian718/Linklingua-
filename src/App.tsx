import React, { useState } from 'react';
import { VideoProcessor } from './services/videoProcessor';
import { StudyMode, VideoData, LanguageMode, UILanguage } from './types';
import Sidebar from './components/Sidebar';
import ModeRenderer from './components/ModeRenderer';

export default function App() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  if (!videoData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">LinkLingua</h1>
        <button
          className="px-6 py-3 bg-indigo-600 rounded"
          onClick={async () => {
            const data = await VideoProcessor.processVideo('demo');
            setVideoData(data);
          }}
        >
          Generate Demo Data
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar sentences={videoData.sentences} />
      <div className="flex-1 p-10">
        <ModeRenderer videoData={videoData} />
      </div>
    </div>
  );
}
export enum StudyMode {
  VIDEO = 'VIDEO',
}

export enum LanguageMode {
  JP_ZH = 'JP_ZH',
}

export enum UILanguage {
  JP = 'JP',
  EN = 'EN',
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
}

export interface VideoData {
  sentences: Sentence[];
}
import { VideoData } from '../types';

export class VideoProcessor {
  static async processVideo(_: string): Promise<VideoData> {
    return {
      sentences: [
        { text: 'This is a demo sentence.', start: 0, end: 3 },
        { text: 'LinkLingua is running.', start: 3, end: 6 },
      ],
    };
  }
}
import React from 'react';
import { Sentence } from '../types';

export default function Sidebar(props: { sentences: Sentence[] }) {
  return (
    <div className="w-64 bg-gray-900 p-4">
      <h2 className="font-bold mb-4">Sentences</h2>
      <ul className="space-y-2 text-sm">
        {props.sentences.map((s, i) => (
          <li key={i} className="text-gray-300">
            {s.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
