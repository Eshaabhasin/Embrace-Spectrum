import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Notification data for different pages
const NOTIFICATIONS = {
  solace: {
    id: 'solace_talkcoach',
    title: 'Try Talk Coach',
    message: 'Practice conversations with our Talk Coach using Gemini Live for more interactive communication practice.',
    linkTo: '/GeminiLive',
    linkText: 'Try Talk Coach',
    delay: 10000
  },
  talkcoach: {
    id: 'talkcoach_speechcoach',
    title: 'Improve Your Speech',
    message: 'Practice your speech clarity and expression with our Speech Coach feature.',
    linkTo: '/SpeechCoach',
    linkText: 'Try Speech Coach',
    delay: 10000
  },
  speechcoach: {
    id: 'speechcoach_journal',
    title: 'Track Your Progress',
    message: 'Document your communication journey in our Journal feature.',
    linkTo: '/JournalBoard',
    linkText: 'Open Journal',
    delay: 10000
  },
  journal: {
    id: 'journal_sketchtales',
    title: 'Express Visually',
    message: 'Try Sketch Tales to express yourself through visual art.',
    linkTo: '/SketchTales',
    linkText: 'Open Sketch Tales',
    delay: 10000
  }
};

const PageNotification = ({ pageId }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Get notification data for current page
  const notificationData = NOTIFICATIONS[pageId];
  
  // If no notification for this page, return null
  if (!notificationData) return null;

  useEffect(() => {
    // Check if notification has been shown before
    const hasShownNotification = sessionStorage.getItem(`notification_${notificationData.id}`);
    
    if (!hasShownNotification) {
      // Show notification after specified delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, notificationData.delay);
      
      return () => clearTimeout(timer);
    }
  }, [notificationData.id, notificationData.delay]);

  const closeNotification = () => {
    // Mark notification as shown for this session
    sessionStorage.setItem(`notification_${notificationData.id}`, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#6488e9] animate-fadeIn z-50">
      <div className="flex items-start">
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{notificationData.title}</p>
          <p className="mt-1 text-sm text-gray-500">{notificationData.message}</p>
          <div className="mt-3 flex space-x-3">
            <Link
              to={notificationData.linkTo}
              className="bg-[#6488e9] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#5070d0]"
            >
              {notificationData.linkText}
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
  );
};

export default PageNotification;