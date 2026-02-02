import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 text-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-900/40 border border-white/10 rounded-3xl p-16 shadow-2xl text-center">
        <h1 className="text-7xl font-black mb-8 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          LinkLingua
        </h1>

        <p className="text-gray-400 text-xl mb-16">
          Transform video links into AI-powered language learning materials.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <input
            className="flex-1 bg-gray-950/60 border border-white/10 rounded-xl px-6 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            placeholder="Paste YouTube / Bilibili link..."
          />
          <button className="px-10 py-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-bold text-lg shadow-xl">
            Generate
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
          <div className="bg-white/5 rounded-2xl py-6">YouTube</div>
          <div className="bg-white/5 rounded-2xl py-6">AI Transcript</div>
          <div className="bg-white/5 rounded-2xl py-6">Multi Language</div>
          <div className="bg-white/5 rounded-2xl py-6">Study Modes</div>
        </div>
      </div>
    </div>
  );
};

export default App;

