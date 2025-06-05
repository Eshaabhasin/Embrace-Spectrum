import React, { useRef, useState, useEffect } from "react";
import "./GeminiLive.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import HaloEffect from "./components/Halo Effect/HaloEffect";
import cn from "classnames";
import { Link } from "react-router-dom";
import { useAudioDescription } from "../AudioDescription/AudioDescriptionContext";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function GeminiLive() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [showTalkCoachInfo, setShowTalkCoachInfo] = useState<boolean>(true);
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  const [showSecondNotification, setShowSecondNotification] = useState(false);
  

  useEffect(() => {
    // Check if notification has been shown before
    const hasShownNotification = sessionStorage.getItem('talkcoach_speechcoach_notification');
    
    if (!hasShownNotification) {
      // Show notification after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      // Force show notification for testing
      setShowNotification(true);
    }
  }, []);
  
  // Set page title for accessibility
  useEffect(() => {
    document.title = "Talk Coach | Embrace Spectrum";
  }, []);

  const closeTalkCoachInfo = () => {
    setShowTalkCoachInfo(false);
    // Store in session storage that the info has been shown
    sessionStorage.setItem('talk_coach_info_shown', 'true');
  };

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
    <div className="App" role="main">
      
      {showNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 bg-opacity-50">
            <div className="bg-white rounded-xl top-5 shadow-2xl p-6 max-w-2xl w-11/12 mx-auto relative border-l-8 border-blue-500 animate-fadeIn">
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
                <h3 className="text-2xl font-bold text-gray-800">Welcome to Human Connect 🤖</h3>
              </div>
              
              <p className="mb-4 text-gray-700">
                Experience natural conversations with Gemini AI - your interactive chat companion powered by Google's advanced language model.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold text-blue-800 mb-2">Getting Started:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Allow camera and microphone access</li>
                  <li>Start chatting naturally with the AI</li>
                  <li>Experience human-like interactions</li>
                  <li>Engage in dynamic conversations</li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={dismissNotification}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Begin Chat
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Hidden element for screen reader announcements */}
      <div className="sr-only" aria-live="polite" id="talk-coach-status"></div>
      
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console" role="region" aria-label="Talk Coach conversation area">
          <HaloEffect />
          <main>
            <div className="main-app-area">
              <Altair aria-label="AI conversation assistant" />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
                aria-label="Your video feed"
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={(stream) => {
                setVideoStream(stream);
                // Announce video status to screen readers
                const statusElement = document.getElementById('talk-coach-status');
                if (statusElement) {
                  if (stream) {
                    statusElement.textContent = "Video is now active. You can start your conversation.";
                  } else {
                    statusElement.textContent = "Video has been turned off.";
                  }
                }
              }}
              aria-label="Conversation controls"
            />
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default GeminiLive;