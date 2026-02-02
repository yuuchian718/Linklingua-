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
