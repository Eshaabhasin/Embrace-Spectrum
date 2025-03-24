import React from 'react';
import PDFEmotionReader from './PDFReader';

function SentimentAnalyser() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        <PDFEmotionReader />
      </main>
    </div>
  );
}

export default SentimentAnalyser;