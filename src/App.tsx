import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold">LinkLingua</h1>

      <button
        className="mt-6 px-6 py-3 bg-indigo-600 rounded"
        onClick={() => setCount(c => c + 1)}
      >
        Clicked {count}
      </button>
    </div>
  );
}
