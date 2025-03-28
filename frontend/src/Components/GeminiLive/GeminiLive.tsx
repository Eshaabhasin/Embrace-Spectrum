import React, { useRef, useState } from "react";
import "./GeminiLive.scss"
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import HaloEffect from "./components/Halo Effect/HaloEffect";
import cn from "classnames";

const API_KEY = "AIzaSyCN7qtGsHboeYuMffK-eyBpvMLVP5XHemc";
if (typeof API_KEY !== "string" || API_KEY.trim() === "") {
  throw new Error("API Key is missing. Please provide a valid API key.");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function GeminiLive() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
        <h1 className="bg-gradient-to-r from-blue-100 ml-10 via-white to-blue-400 bg-clip-text text-transparent absolute text-7xl mt-10 font-extrabold tracking-wide">
            Talk Coach
        </h1>
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
            >
            </ControlTray>

          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default GeminiLive;