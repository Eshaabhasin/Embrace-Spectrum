import { useRef, useState } from "react";
import React from "react";
import { useAudioDescription } from "../../AudioDescription/AudioDescriptionContext";

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(0, 0, 0, 1)",
  description,
}) => {
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.4);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.4);
    // Speak the description or the first heading when hovered
    if (isAudioDescriptionEnabled && description) {
      speakText(description);
    }
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        w-[23vw]
        h-[17vw] 
        rounded-xl 
        text-white
        font-bold 
        px-6 py-3 
        shadow-md 
        backdrop-blur-lg bg-[rgba(255,255,255,0.2)]
        transition-all 
        duration-300 
        ${className}
      `}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
