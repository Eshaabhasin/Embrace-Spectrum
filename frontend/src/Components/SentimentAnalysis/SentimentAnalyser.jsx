import React, { useState, useEffect, useRef } from 'react';
import PDFEmotionReader from './PDFReader';
import { Link } from 'react-router-dom';

function SentimentAnalyser() {

  const [showNotification, setShowNotification] = useState(false);
  const [showSecondNotification, setShowSecondNotification] = useState(false);
  

useEffect(() => {
  const hasShownNotification = sessionStorage.getItem('journal_tasks_notification');
  if (!hasShownNotification) {
    const timer = setTimeout(() => {
      setShowSecondNotification(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }
}, []);

const closeNotification = () => {
  // Mark notification as shown for this session
  sessionStorage.setItem('journal_tasks_notification', 'true');
  setShowSecondNotification(false);
};

useEffect(() => {
      localStorage.removeItem('feelReaderNotificationSeen');
      
      const hasSeenNotification = localStorage.getItem('feelReaderNotificationSeen');
      if (!hasSeenNotification) {
        setShowNotification(true);
      }
    }, []);
    
    const dismissNotification = () => {
      setShowNotification(false);
      localStorage.setItem('feelReaderNotificationSeen', 'true');
    };

  return (
    <div className="min-h-screen bg-[#6488EA]">
      {showNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 bg-opacity-50">
            <div className="bg-white rounded-xl top-10 shadow-2xl p-6 max-w-2xl w-11/12 mx-auto relative border-l-8 border-blue-500 animate-fadeIn">
              <button 
                onClick={dismissNotification}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close notification"
              >
                ✕
              </button>
              
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Welcome to Feel Reader 📑</h3>
              </div>
              
              <p className="mb-4 text-gray-700">
                Feel Reader analyzes the emotional content in your PDF documents! Understand the sentiment and emotions conveyed in any text with this powerful analysis tool.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold text-blue-800 mb-2">How to use:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Upload your PDF document using the file selector</li>
                  <li>View the sentiment analysis results and emotion breakdown</li>
                  <li>Navigate through result in small paragraphs.</li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={dismissNotification}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      {showSecondNotification && (
                      <div id="journal_tasks_notification" className="fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#6488e9] animate-fadeIn z-50">
                        <div className="flex items-start">
                          <div className="ml-3 w-70 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">Unleash Your Creativity</p>
                            <p className="mt-1 text-sm text-gray-500">
                              Create your own unique stories and bring your imagination to life with SketchTales.
                            </p>
                            <div className="mt-3 flex space-x-3">
                              <Link
                                to="/sketchtales"
                                className="bg-[#6488e9] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#5070d0]"
                              >
                                Start Creating
                              </Link>
                              <button
                                type="button"
                                onClick={closeNotification}
                                className="bg-white text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex">
                            <button
                              onClick={closeNotification}
                              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              <span className="sr-only">Close</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
      <main className="container mx-auto p-6">
      <h1 className="bg-gradient-to-r from-white via-blue-300 to-white bg-clip-text text-transparent text-7xl mt-30 font-extrabold tracking-wide mb-10">
          Feel Reader - know what's intended
      </h1>
        <PDFEmotionReader />
      </main>
    </div>
  );
}

export default SentimentAnalyser;
