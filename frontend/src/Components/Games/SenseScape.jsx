import React, { useState, useEffect, useRef } from "react";

const environments = [
  {
    id: "clouds",
    name: "Floating Cloud Islands",
    bgColor: "bg-gradient-to-b from-sky-300 to-blue-400",
    emoji: "☁️",
    elements: [
      { type: "cloud", count: 5, speed: "slow" },
      { type: "bird", count: 3, speed: "medium" }
    ],
    interactions: ["tap", "drag"],
    soundUrl: "rain.mp3"
  },
  {
    id: "forest",
    name: "Enchanted Forest",
    bgColor: "bg-gradient-to-b from-green-700 to-emerald-900",
    emoji: "🌳",
    elements: [
      { type: "tree", count: 7, speed: "none" },
      { type: "leaf", count: 12, speed: "slow" },
      { type: "firefly", count: 15, speed: "medium" }
    ],
    interactions: ["tap", "hover"],
    soundUrl: "breeze.mp3"
  },
  {
    id: "underwater",
    name: "Underwater Glow Realm",
    bgColor: "bg-gradient-to-b from-blue-900 to-indigo-900",
    emoji: "🌊",
    elements: [
      { type: "fish", count: 8, speed: "medium" },
      { type: "bubble", count: 20, speed: "slow" },
      { type: "seaweed", count: 5, speed: "gentle" }
    ],
    interactions: ["tap", "swipe"],
    soundUrl: "soft-piano.mp3"
  }
];

const activities = [
  {
    id: "breathing",
    name: "Breathing Flower",
    icon: "🌸",
    description: "Follow inhale/exhale cycles"
  },
  {
    id: "ripples",
    name: "Ripple Pools",
    icon: "💧",
    description: "Tap to generate gentle ripples"
  },
  {
    id: "feather",
    name: "Feather Trails",
    icon: "🪶",
    description: "Swipe to see calming animations"
  },
  {
    id: "music",
    name: "Music Puzzles",
    icon: "🎵",
    description: "Arrange tones for calming melodies"
  }
];

const SenseScape = () => {
  const [activeEnvironment, setActiveEnvironment] = useState(environments[0]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [particles, setParticles] = useState([]);
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [breathSize, setBreathSize] = useState(50);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    lowSensory: false,
    highContrast: false,
    dyslexiaFont: false,
    animationSpeed: 1
  });
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const breathingTimerRef = useRef(null);
  
  // Handle environment selection
  const selectEnvironment = (env) => {
    setActiveEnvironment(env);
    setParticles([]); // Reset particles when changing environments
    
    if (isSoundOn && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = env.soundUrl;
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
  };
  
  // Handle activity selection
  const selectActivity = (activity) => {
    if (activeActivity?.id === activity.id) {
      setActiveActivity(null);
      if (activity.id === "breathing" && breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
      }
    } else {
      setActiveActivity(activity);
      setParticles([]);
      
      if (activity.id === "breathing") {
        startBreathingExercise();
      }
    }
  };
  
  // Start breathing exercise
  const startBreathingExercise = () => {
    if (breathingTimerRef.current) {
      clearInterval(breathingTimerRef.current);
    }
    
    breathingTimerRef.current = setInterval(() => {
      setIsBreathingIn(prev => !prev);
    }, 4000);
    
    return () => {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
      }
    };
  };
  
  // Toggle sound
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    
    if (!isSoundOn) {
      if (!audioRef.current) {
        audioRef.current = new Audio(activeEnvironment.soundUrl);
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  // Toggle accessibility settings
  const toggleSetting = (setting) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Update animation speed
  const updateAnimationSpeed = (speed) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      animationSpeed: speed
    }));
  };
  
  // Create a new particle at the specified position
  const createParticle = (x, y) => {
    const newParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 30 + 10,
      color: getRandomColor(activeEnvironment.id),
      opacity: 1,
      speedX: (Math.random() - 0.5) * 2 * accessibilitySettings.animationSpeed,
      speedY: (Math.random() - 0.5) * 2 * accessibilitySettings.animationSpeed
    };
    
    setParticles(prev => [...prev.slice(-30), newParticle]); // Limit to 30 particles
  };
  
  // Create ripple effect
  const createRipple = (x, y) => {
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 10,
      maxSize: 100,
      color: getRandomColor(activeEnvironment.id),
      opacity: 0.8
    };
    
    setParticles(prev => [...prev.slice(-10), newRipple]); // Limit to 10 ripples
  };
  
  // Create feather trail
  const createFeatherTrail = (x, y) => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      points.push({
        id: Date.now() + Math.random() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        size: Math.random() * 10 + 5,
        color: getRandomColor(activeEnvironment.id),
        opacity: 0.9 - (i * 0.15)
      });
    }
    
    setParticles(prev => [...prev.slice(-50), ...points]); // Limit to 50 points
  };
  
  // Get a random color based on the environment
  const getRandomColor = (envId) => {
    const colorMaps = {
      clouds: ["#ffffff", "#e6f7ff", "#cce6ff", "#b3d9ff"],
      forest: ["#00cc66", "#33cc33", "#009933", "#006622"],
      underwater: ["#00ccff", "#0099cc", "#33ccff", "#6600cc"]
    };
    
    const colors = colorMaps[envId] || ["#ffffff"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Handle canvas interactions
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeActivity) {
      switch (activeActivity.id) {
        case "ripples":
          createRipple(x, y);
          break;
        case "music":
          // Simple tone generation
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = "sine";
          oscillator.frequency.value = 300 + Math.random() * 200;
          gainNode.gain.value = 0.1;
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
          
          setTimeout(() => oscillator.stop(), 1000);
          createParticle(x, y);
          break;
        default:
          createParticle(x, y);
      }
    } else {
      createParticle(x, y);
    }
  };
  
  // Handle mouse move for feather trails
  const handleMouseMove = (e) => {
    if (!activeActivity || activeActivity.id !== "feather") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createFeatherTrail(x, y);
  };
  
  // Animation loop for particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animationId = requestAnimationFrame(() => {
      setParticles(prev => 
        prev.map(p => {
          if (p.maxSize) {
            // Ripple animation
            return {
              ...p,
              size: p.size < p.maxSize ? p.size + 2 * accessibilitySettings.animationSpeed : p.size,
              opacity: p.size < p.maxSize ? p.opacity : p.opacity - 0.01 * accessibilitySettings.animationSpeed
            };
          } else {
            // Regular particle animation
            return {
              ...p,
              x: p.x + (p.speedX || 0),
              y: p.y + (p.speedY || 0),
              opacity: p.opacity > 0 ? p.opacity - 0.005 * accessibilitySettings.animationSpeed : 0
            };
          }
        }).filter(p => p.opacity > 0)
      );
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [particles, accessibilitySettings.animationSpeed]);
  
  // Breathing animation
  useEffect(() => {
    if (activeActivity?.id !== "breathing") return;
    
    const breathingAnimation = () => {
      setBreathSize(isBreathingIn ? 
        prev => Math.min(prev + 1, 150) : 
        prev => Math.max(prev - 1, 50)
      );
    };
    
    const animationId = requestAnimationFrame(breathingAnimation);
    return () => cancelAnimationFrame(animationId);
  }, [isBreathingIn, activeActivity]);
  
  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getBoundingClientRect();
    canvas.width = ctx.width;
    canvas.height = ctx.height;
    
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw breathing flower
    if (activeActivity?.id === "breathing") {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw flower petals
      const petalCount = 8;
      const petalSize = breathSize;
      
      context.save();
      context.translate(centerX, centerY);
      
      for (let i = 0; i < petalCount; i++) {
        context.rotate(Math.PI * 2 / petalCount);
        context.beginPath();
        context.ellipse(0, petalSize/2, petalSize/4, petalSize/2, 0, 0, Math.PI * 2);
        context.fillStyle = isBreathingIn ? 
          `rgba(255, 182, 193, ${0.7 + breathSize/300})` : 
          `rgba(173, 216, 230, ${0.7 + breathSize/300})`;
        context.fill();
      }
      
      // Draw center
      context.beginPath();
      context.arc(0, 0, breathSize/4, 0, Math.PI * 2);
      context.fillStyle = isBreathingIn ? "#ffcc00" : "#ff9900";
      context.fill();
      
      // Draw text
      context.font = "24px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText(isBreathingIn ? "Breathe In..." : "Breathe Out...", 0, -breathSize - 20);
      
      context.restore();
    }
    
    // Draw particles
    particles.forEach(p => {
      if (p.maxSize) {
        // Draw ripple
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.strokeStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        context.lineWidth = 2;
        context.stroke();
      } else {
        // Draw regular particle
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        context.fill();
      }
    });
  }, [particles, activeActivity, breathSize, isBreathingIn]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  return (
    <>
      <div className={`${activeEnvironment.bgColor} transition-colors duration-1000 flex flex-col mt-29 w-[1500px] ml-5 h-[615px] rounded-2xl
        ${accessibilitySettings.lowSensory ? 'opacity-75' : ''}
        ${accessibilitySettings.highContrast ? 'contrast-150' : ''}
        ${accessibilitySettings.dyslexiaFont ? 'font-mono' : ''}`}>
        
        {/* Environment selector */}
        <div className="flex justify-center gap-4 p-4">
          {environments.map(env => (
            <button
              key={env.id}
              onClick={() => selectEnvironment(env)}
              className={`px-4 py-2 rounded-full transition-all ${
                activeEnvironment.id === env.id 
                  ? "bg-white text-blue-800 shadow-lg scale-110" 
                  : "bg-white/30 text-white hover:bg-white/50"
              }`}
            >
              <span className="mr-2">{env.emoji}</span>
              {env.name}
            </button>
          ))}
        </div>
        
        {/* Main content area with left instructions and right activities */}
        <div className="flex flex-1 p-4">
          {/* Left side - Instructions */}
          <div className="w-1/4 pr-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 h-[515px]">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-white">How to use SenseScape</h2>
                
                <div className="space-y-4 text-white">
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <span className="mr-2">🌸</span> Breathing Flower
                    </h3>
                    <p className="text-sm opacity-80">Follow the flower's rhythm for guided breathing exercises.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <span className="mr-2">💧</span> Ripple Pools
                    </h3>
                    <p className="text-sm opacity-80">Tap anywhere to create calming water ripple effects.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <span className="mr-2">🪶</span> Feather Trails
                    </h3>
                    <p className="text-sm opacity-80">Move your cursor to create flowing, gentle animations.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <span className="mr-2">🎵</span> Music Puzzles
                    </h3>
                    <p className="text-sm opacity-80">Tap to create soothing sounds and visual patterns.</p>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="mt-4 space-y-2">
                <button 
                  onClick={toggleSound}
                  className={`w-full px-3 py-2 rounded-lg ${
                    isSoundOn ? "bg-green-600 text-white" : "bg-white/30 text-white"
                  }`}
                >
                  {isSoundOn ? "🔊 Sound On" : "🔇 Sound Off"}
                </button>
                
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full px-3 py-2 rounded-lg bg-white/30 text-white hover:bg-white/40"
                >
                  ⚙️ Accessibility Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side - Activities */}
          <div className="w-3/4 pl-4 relative">
            {/* Activity selector */}
            <div className="flex mb-4 gap-2">
              {activities.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => selectActivity(activity)}
                  className={`px-4 py-2 rounded-lg transition-all flex-1 ${
                    activeActivity?.id === activity.id 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "bg-white/30 text-white hover:bg-white/50"
                  }`}
                >
                  <span className="mr-2">{activity.icon}</span>
                  {activity.name}
                </button>
              ))}
            </div>
            
            {/* Interactive canvas */}
            <div className="relative h-[60vh] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm bg-white/10">
              <canvas 
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                className="absolute inset-0 w-full h-full cursor-pointer"
              />
              
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-opacity-70">
                {activeActivity ? 
                  `${activeActivity.icon} ${activeActivity.name}: ${activeActivity.description}` : 
                  "Tap or click anywhere to interact"}
              </div>
            </div>
            
            {/* Settings panel - only appears when clicked */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setShowSettings(false)}></div>
            )}
            <div className={`fixed top-0 right-0 h-full bg-gray-800/90 backdrop-blur-md w-72 transform transition-transform duration-300 ease-in-out ${
              showSettings ? 'translate-x-0' : 'translate-x-full'
            } shadow-lg rounded-l-2xl overflow-y-auto z-20`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white text-xl font-semibold">Accessibility Settings</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-white opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6 mt-25">
                  <div>
                    <label className="flex items-center text-white mb-2">
                      <input 
                        type="checkbox" 
                        checked={accessibilitySettings.lowSensory}
                        onChange={() => toggleSetting('lowSensory')}
                        className="mr-3 h-4 w-4"
                      />
                      Low Sensory Mode
                    </label>
                    <p className="text-white/60 text-sm pl-7">Reduces visual intensity for sensitive users</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-white mb-2">
                      <input 
                        type="checkbox" 
                        checked={accessibilitySettings.highContrast}
                        onChange={() => toggleSetting('highContrast')}
                        className="mr-3 h-4 w-4"
                      />
                      High Contrast
                    </label>
                    <p className="text-white/60 text-sm pl-7">Increases visual contrast for better visibility</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-white mb-2">
                      <input 
                        type="checkbox" 
                        checked={accessibilitySettings.dyslexiaFont}
                        onChange={() => toggleSetting('dyslexiaFont')}
                        className="mr-3 h-4 w-4"
                      />
                      Dyslexia Font
                    </label>
                    <p className="text-white/60 text-sm pl-7">Uses more readable font for dyslexic users</p>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Animation Speed</label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1"
                      value={accessibilitySettings.animationSpeed}
                      onChange={(e) => updateAnimationSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-white/60 text-xs mt-1">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SenseScape;