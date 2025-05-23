import React, { useRef, useState } from "react";
import "./GeminiLive.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import HaloEffect from "./components/Halo Effect/HaloEffect";
import cn from "classnames";
import NavBar from "../NavBar/NavBar";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function GeminiLive() {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <NavBar />
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <h1 className="bg-gradient-to-r from-blue-100 ml-10 via-white to-blue-400 bg-clip-text text-transparent absolute text-7xl mt-27 font-extrabold tracking-wide">
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
            />
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default GeminiLive;
