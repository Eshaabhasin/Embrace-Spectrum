import React, { useRef, useState, useEffect } from "react";
import "./GeminiLive.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import HaloEffect from "./components/Halo Effect/HaloEffect";
import cn from "classnames";
import { Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function GeminiLive() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    // Check if notification has been shown before
    const hasShownNotification = sessionStorage.getItem('talkcoach_speechcoach_notification');
    
    if (!hasShownNotification) {
      // Show notification after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closeNotification = () => {
    // Mark notification as shown for this session
    sessionStorage.setItem('talkcoach_speechcoach_notification', 'true');
    setShowNotification(false);
  };

  return (
    <div className="App">
      {/* Speech Coach Notification */}
      {showNotification && (
        <div className="fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#6488e9] animate-fadeIn z-50">
          <div className="flex items-start">
            <div className="ml-3 w-70 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">Improve Your Speech</p>
              <p className="mt-1 text-sm text-gray-500">
                Practice your speech clarity and expression with our Speech Coach feature.
              </p>
              <div className="mt-3 flex space-x-3">
                <Link
                  to="/SpeechCoach"
                  className="bg-[#6488e9] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#5070d0]"
                >
                  Try Speech Coach
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

      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <HaloEffect />
          <main>
            <div className="main-app-area">
              <Altair />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
            />
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default GeminiLive;