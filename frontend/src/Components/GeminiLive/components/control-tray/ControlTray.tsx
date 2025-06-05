import cn from "classnames";
import { memo, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { UseMediaStreamResult } from "../../hooks/use-media-stream-mux";
import { useScreenCapture } from "../../hooks/use-screen-capture";
import { useWebcam } from "../../hooks/use-webcam";
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioPulse from "../audio-pulse/AudioPulse";
import "./control-tray.scss";
import React from "react";
import { useAudioDescription } from "../../../AudioDescription/AudioDescriptionContext";

// Add link to load Material Symbols font
const MaterialSymbolsLink = () => (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  />
);

export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  children?: ReactNode; 
  supportsVideo: boolean;
  onVideoStreamChange?: (stream: MediaStream | null) => void;
  enableEditingSettings?: boolean;
};

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
};

const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop, ...props }: MediaStreamButtonProps) =>
    isStreaming ? (
      <button className="action-button" onClick={stop} {...props}>
        <span className="material-symbols-outlined" aria-hidden="true">{onIcon}</span>
      </button>
    ) : (
      <button className="action-button" onClick={start} {...props}>
        <span className="material-symbols-outlined" aria-hidden="true">{offIcon}</span>
      </button>
    )
);

function ControlTray({
  videoRef,
  children,
  onVideoStreamChange = () => {},
  supportsVideo,
  enableEditingSettings,
}: ControlTrayProps) {
  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] =
    useState<MediaStream | null>(null);
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();

  const { client, connected, connect, disconnect, volume } =
    useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef]);

  const changeStreams = (next?: UseMediaStreamResult) => async () => {
    if (next) {
      const mediaStream = await next.start();
      setActiveVideoStream(mediaStream);
      onVideoStreamChange(mediaStream);
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
    }

    videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
  };

  // Status announcements for screen readers
  useEffect(() => {
    const statusElement = document.getElementById('talk-coach-status');
    if (statusElement) {
      if (connected) {
        statusElement.textContent = "Conversation started. You can now speak with the AI assistant.";
      } else {
        statusElement.textContent = "Conversation paused. Press the start button to begin.";
      }
    }
  }, [connected]);

  return (
    <>
      <MaterialSymbolsLink />
      <section className="control-tray" role="region">
        <canvas style={{ display: "none" }} ref={renderCanvasRef} />
        <nav className={cn("actions-nav", { disabled: !connected })}>
          <div
            onMouseEnter={() => {
              if (isAudioDescriptionEnabled) {
                speakText(muted ? "Enable microphone" : "Disable microphone");
              }
            }}
          >
            <button
              className={cn("action-button mic-button")}
              onClick={() => setMuted(!muted)}
              aria-label={muted ? "Enable microphone" : "Disable microphone"}
              aria-pressed={muted}
            >
              {!muted ? (
                <span className="material-symbols-outlined filled" aria-hidden="true">mic</span>
              ) : (
                <span className="material-symbols-outlined filled" aria-hidden="true">mic_off</span>
              )}
            </button>
          </div>

          <div className="action-button no-action outlined">
            <AudioPulse volume={volume} active={connected} hover={false} />
          </div>

          {supportsVideo && (
            <>
              <div 
                onMouseEnter={() => {
                  if (isAudioDescriptionEnabled) {
                    speakText(screenCapture.isStreaming ? "Stop screen sharing" : "Share your screen");
                  }
                }}
              >
                <MediaStreamButton
                  isStreaming={screenCapture.isStreaming}
                  start={changeStreams(screenCapture)}
                  stop={changeStreams()}
                  onIcon="cancel_presentation"
                  offIcon="present_to_all"
                  aria-label={screenCapture.isStreaming ? "Stop screen sharing" : "Share your screen"}
                  aria-pressed={screenCapture.isStreaming}
                />
              </div>
              <div
                onMouseEnter={() => {
                  if (isAudioDescriptionEnabled) {
                    speakText(webcam.isStreaming ? "Turn off camera" : "Turn on camera");
                  }
                }}
              >
                <MediaStreamButton
                  isStreaming={webcam.isStreaming}
                  start={changeStreams(webcam)}
                  stop={changeStreams()}
                  onIcon="videocam_off"
                  offIcon="videocam"
                  aria-label={webcam.isStreaming ? "Turn off camera" : "Turn on camera"}
                  aria-pressed={webcam.isStreaming}
                />
              </div>
            </>
          )}
          {children}
        </nav>

        <div className={cn("connection-container", { connected })}>
          <div className="connection-button-container">
            <button
              ref={connectButtonRef}
              className={cn("action-button connect-toggle", { connected })}
              onClick={connected ? disconnect : connect}
              aria-label={connected ? "Pause conversation" : "Start conversation"}
              aria-pressed={connected}
              onMouseEnter={() => {
                if (isAudioDescriptionEnabled) {
                  speakText(connected ? "Pause conversation" : "Start conversation");
                }
              }}
            >
              <span className="material-symbols-outlined filled" aria-hidden="true">
                {connected ? "pause" : "play_arrow"}
              </span>
              <span className="sr-only">{connected ? "Pause" : "Start"} conversation</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(ControlTray);
