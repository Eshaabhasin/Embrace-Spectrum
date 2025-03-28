import React from 'react';
import PDFEmotionReader from './PDFReader';

function SentimentAnalyser() {
  return (
    <div className="min-h-screen bg-[#5C7EEC]">
      <main className="container mx-auto p-6">
      <h1 className="bg-gradient-to-r from-white via-blue-300 to-white bg-clip-text text-transparent text-7xl mt-10 font-extrabold tracking-wide mb-10">
          Feel Reader - know what's intended
      </h1>
        <PDFEmotionReader />
      </main>
    </div>
  );
}

export default SentimentAnalyser;