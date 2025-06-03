import React, { useState, useRef, useEffect } from "react";
import NavBar from '../NavBar/NavBar';

// Feature sections
const features = [
  {
    id: "creative",
    name: "Creative Expression",
    icon: "🎨",
    description: "Express yourself through stickers"
  },
  {
    id: "music",
    name: "Mood Music",
    icon: "🎶",
    description: "Calming sounds and melodies"
  },
  {
    id: "games",
    name: "Mini Games",
    icon: "🧩",
    description: "Quick mood-lifting activities"
  },
  {
    id: "affirmations",
    name: "Affirmations",
    icon: "🌈",
    description: "Positive thoughts and reminders"
  },
  {
    id: "emotions",
    name: "Emotion Tracker",
    icon: "😊",
    description: "Track how you feel"
  }
];

// Affirmations
const affirmations = [
  "I am worthy of love and respect",
  "Today I choose joy",
  "I believe in my abilities",
  "I am enough just as I am",
  "My feelings are valid",
  "I celebrate my unique strengths",
  "I am growing every day",
  "I deserve happiness",
  "I am resilient and strong",
  "My voice matters"
];

// Sounds - using base64 encoded short audio clips
const sounds = [
  { 
    name: "Gentle Rain", 
    icon: "🌧️", 
    audio: new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==") 
  },
  { 
    name: "Ocean Waves", 
    icon: "🌊", 
    audio: new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==") 
  },
  { 
    name: "Forest Birds", 
    icon: "🐦", 
    audio: new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==") 
  },
  { 
    name: "Soft Piano", 
    icon: "🎹", 
    audio: new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==") 
  }
];

// Mini games
const miniGames = [
  {
    id: "gratitude",
    name: "Gratitude Garden",
    icon: "🌻",
    description: "Plant flowers by listing things you're grateful for"
  },
  {
    id: "smile",
    name: "Smile Catcher",
    icon: "😄",
    description: "Catch the smiles before they disappear"
  },
  {
    id: "memory",
    name: "Happy Memory Match",
    icon: "🎭",
    description: "Match pairs of joyful images"
  }
];

const MoodBooster = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [mood, setMood] = useState(3); // 1-5 scale
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    reducedMotion: false,
    highContrast: false,
    dyslexiaFont: false,
    textToSpeech: false
  });
  const [customAffirmation, setCustomAffirmation] = useState("");
  const [currentSound, setCurrentSound] = useState(null);
  const [stickers, setStickers] = useState([]);
  
  // Game states
  const [gratitudeItems, setGratitudeItems] = useState([]);
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [smiles, setSmiles] = useState([]);
  const [smileScore, setSmileScore] = useState(0);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  
  // Select a feature
  const selectFeature = (feature) => {
    setActiveFeature(feature);
    setActiveGame(null);
    
    // Initialize feature-specific elements
    if (feature.id === "games") {
      // Reset game states
      setSmiles([]);
      setSmileScore(0);
      setMemoryCards([]);
      setFlippedCards([]);
      setMatchedCards([]);
    }
  };
  
  // Select a mini game
  const selectGame = (game) => {
    setActiveGame(game);
    
    // Initialize game-specific elements
    if (game.id === "smile") {
      startSmileCatcher();
    } else if (game.id === "memory") {
      initializeMemoryGame();
    }
  };
  
  // Toggle setting
  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Get random affirmation
  const getRandomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(affirmations[randomIndex]);
  };
  
  // Add custom affirmation
  const addCustomAffirmation = () => {
    if (customAffirmation.trim()) {
      affirmations.push(customAffirmation);
      setCurrentAffirmation(customAffirmation);
      setCustomAffirmation("");
    }
  };
  
  // Play sound
  const playSound = (sound) => {
    // Stop current sound if playing
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
    }
    
    // Play new sound
    sound.audio.loop = true;
    sound.audio.play().catch(e => console.log("Audio play prevented:", e));
    setCurrentSound(sound.audio);
  };
  
  // Add sticker
  const addSticker = (emoji) => {
    setStickers([...stickers, {
      id: Date.now(),
      emoji,
      x: Math.random() * 80 + 10, // 10-90% of width
      y: Math.random() * 80 + 10  // 10-90% of height
    }]);
  };
  
  // Add gratitude item
  const addGratitudeItem = () => {
    if (gratitudeInput.trim()) {
      setGratitudeItems([...gratitudeItems, gratitudeInput]);
      setGratitudeInput("");
    }
  };
  
  // Start smile catcher game
  const startSmileCatcher = () => {
    setSmiles([]);
    setSmileScore(0);
    
    // Create initial smiles
    const newSmiles = [];
    for (let i = 0; i < 5; i++) {
      newSmiles.push({
        id: Date.now() + i,
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 80 + 10, // 10-90% of height
        size: Math.random() * 30 + 20,
        speed: Math.random() * 0.8 + 0.3, // Slower speed: 0.3-1.1
        caught: false
      });
    }
    setSmiles(newSmiles);
  };
  
  // Catch a smile
  const catchSmile = (id) => {
    setSmiles(prev => prev.map(smile => 
      smile.id === id ? { ...smile, caught: true } : smile
    ));
    setSmileScore(prev => prev + 1);
    
    // Add a new smile
    setTimeout(() => {
      const newSmile = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 30 + 20,
        speed: Math.random() * 0.8 + 0.3, // Slower speed: 0.3-1.1
        caught: false
      };
      setSmiles(prev => [...prev.filter(s => !s.caught), newSmile]);
    }, 500);
  };
  
  // Initialize memory game
  const initializeMemoryGame = () => {
    const emojis = ["😄", "🌈", "⭐", "🦋", "🌻", "🌟", "🎨", "💖"];
    const cardPairs = [...emojis, ...emojis];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }, index) => ({ id: index, value, flipped: false, matched: false }));
    
    setMemoryCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
  };
  
  // Handle card flip in memory game
  const flipCard = (cardId) => {
    // Don't allow flipping if two cards are already flipped
    if (flippedCards.length === 2) return;
    
    // Don't allow flipping already matched or flipped cards
    const card = memoryCards.find(c => c.id === cardId);
    if (card.matched || flippedCards.includes(cardId)) return;
    
    // Add card to flipped cards
    setFlippedCards(prev => [...prev, cardId]);
    
    // Update card state
    setMemoryCards(prev => 
      prev.map(card => 
        card.id === cardId ? { ...card, flipped: true } : card
      )
    );
    
    // Check for match if this is the second card
    if (flippedCards.length === 1) {
      const firstCardId = flippedCards[0];
      const firstCard = memoryCards.find(c => c.id === firstCardId);
      const secondCard = memoryCards.find(c => c.id === cardId);
      
      if (firstCard.value === secondCard.value) {
        // Match found
        setMatchedCards(prev => [...prev, firstCardId, cardId]);
        setMemoryCards(prev => 
          prev.map(card => 
            card.id === firstCardId || card.id === cardId
              ? { ...card, matched: true }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setMemoryCards(prev => 
            prev.map(card => 
              card.id === firstCardId || card.id === cardId
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Text to speech for affirmations
  useEffect(() => {
    if (settings.textToSpeech && currentAffirmation && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentAffirmation);
      window.speechSynthesis.speak(utterance);
    }
  }, [currentAffirmation, settings.textToSpeech]);
  
  // Animate smiles
  useEffect(() => {
    if (!smiles.length) return;
    
    const moveSmiles = () => {
      setSmiles(prev => prev.map(smile => {
        if (smile.caught) return smile;
        
        // Move smile upward
        let newY = smile.y - smile.speed;
        
        // If smile goes off screen, reset from bottom
        if (newY < -10) {
          newY = 110;
        }
        
        return {
          ...smile,
          y: newY
        };
      }));
    };
    
    // Set up animation interval with slower refresh rate
    const animationInterval = setInterval(moveSmiles, 100); // Increased from 50ms to 100ms
    
    // Clean up interval on unmount
    return () => clearInterval(animationInterval);
  }, [smiles]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.pause();
      }
    };
  }, [currentSound]);
  
  // Render active feature content
  const renderFeatureContent = () => {
    if (!activeFeature) return null;
    
    switch (activeFeature.id) {
      case "creative":
        return (
          <div className="text-center ">
            <h3 className="text-xl font-semibold mb-4">Creative Expression</h3>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
              <h4 className="font-semibold mb-2">Sticker Collection</h4>
              <p className="mb-4">Click on any emoji to add it to your collection below</p>
              
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {["😊", "🌈", "⭐", "🦋", "🌻", "🌟", "🎨", "💖", "🎵", "🌺"].map((emoji, i) => (
                  <div 
                    key={i} 
                    className="text-3xl cursor-pointer hover:scale-125 transition-transform"
                    onClick={() => addSticker(emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              <div className="relative bg-white/10 h-64 rounded-lg overflow-hidden">
                {stickers.map(sticker => (
                  <div
                    key={sticker.id}
                    className="absolute text-3xl"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}
                {stickers.length === 0 && (
                  <div className="flex items-center justify-center h-full text-white/70">
                    Click emojis above to place them here
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case "music":
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Mood Music</h3>
            <div className="grid grid-cols-2 gap-4">
              {sounds.map((sound, i) => (
                <button 
                  key={i}
                  onClick={() => playSound(sound)}
                  className="bg-white/20 backdrop-blur-md rounded-lg p-4 hover:bg-white/30 transition-colors"
                >
                  <div className="text-3xl mb-2">{sound.icon}</div>
                  <div>{sound.name}</div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-white/70">
              Note: Audio playback is simulated. In a real implementation, actual audio files would be used.
            </p>
          </div>
        );
        
      case "games":
        if (activeGame) {
          // Render active game
          switch (activeGame.id) {
            case "smile":
              return (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Smile Catcher</h3>
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                    <div className="flex justify-between mb-4">
                      <div className="text-xl font-bold">Score: {smileScore}</div>
                      <button 
                        onClick={() => startSmileCatcher()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Restart
                      </button>
                    </div>
                    
                    <div className="relative bg-gradient-to-b from-blue-400/30 to-purple-500/30 h-80 rounded-lg overflow-hidden">
                      {smiles.map(smile => (
                        <div
                          key={smile.id}
                          className={`absolute text-4xl cursor-pointer transition-opacity ${smile.caught ? 'opacity-0' : 'opacity-100'}`}
                          style={{
                            left: `${smile.x}%`,
                            top: `${smile.y}%`,
                            fontSize: `${smile.size}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => !smile.caught && catchSmile(smile.id)}
                        >
                          😄
                        </div>
                      ))}
                      {smiles.length === 0 && (
                        <div className="flex items-center justify-center h-full text-white/70">
                          Loading smiles...
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-4 text-white/70">
                      Tap the smiley faces before they float away!
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="mt-4 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Back to Games
                  </button>
                </div>
              );
            
            case "gratitude":
              return (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Gratitude Garden</h3>
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                    <p className="mb-4">Plant a flower by sharing something you're grateful for</p>
                    
                    <div className="flex mb-4">
                      <input
                        type="text"
                        value={gratitudeInput}
                        onChange={(e) => setGratitudeInput(e.target.value)}
                        placeholder="I'm grateful for..."
                        className="flex-1 p-2 rounded-l-lg"
                      />
                      <button 
                        onClick={addGratitudeItem}
                        className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition-colors"
                      >
                        Plant 🌱
                      </button>
                    </div>
                    
                    <div className="relative bg-gradient-to-b from-green-400/20 to-blue-500/20 h-80 rounded-lg overflow-hidden">
                      {gratitudeItems.map((item, index) => (
                        <div
                          key={index}
                          className="absolute"
                          style={{
                            left: `${10 + (index % 5) * 18}%`,
                            bottom: `${5 + Math.floor(index / 5) * 20}%`,
                          }}
                        >
                          <div className="text-4xl">🌻</div>
                          <div className="text-xs max-w-32 break-words">{item}</div>
                        </div>
                      ))}
                      {gratitudeItems.length === 0 && (
                        <div className="flex items-center justify-center h-full text-white/70">
                          Your garden is waiting for gratitude flowers
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="mt-4 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Back to Games
                  </button>
                </div>
              );
              
            case "memory":
              return (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Happy Memory Match</h3>
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                    <div className="flex justify-between mb-4">
                      <div className="text-xl font-bold">Matches: {matchedCards.length / 2}</div>
                      <button 
                        onClick={() => initializeMemoryGame()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        New Game
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {memoryCards.map(card => (
                        <div
                          key={card.id}
                          onClick={() => !card.matched && !card.flipped && flipCard(card.id)}
                          className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 ${
                            card.flipped || card.matched 
                              ? 'bg-white/30 rotate-y-180' 
                              : 'bg-purple-600/50 hover:bg-purple-600/70'
                          } ${card.matched ? 'opacity-60' : 'opacity-100'}`}
                        >
                          {(card.flipped || card.matched) ? (
                            <span className="text-3xl">{card.value}</span>
                          ) : (
                            <span className="text-xl">?</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {memoryCards.length > 0 && matchedCards.length === memoryCards.length && (
                      <div className="text-xl font-bold text-yellow-300 mb-4">
                        🎉 You matched all pairs! 🎉
                      </div>
                    )}
                    
                    <p className="mt-4 text-white/70">
                      Find matching pairs of joyful emojis
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="mt-4 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Back to Games
                  </button>
                </div>
              );
              
            default:
              return null;
          }
        } else {
          // Show game selection
          return (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Mini Games</h3>
              <div className="grid grid-cols-2 gap-4">
                {miniGames.map((game, i) => (
                  <button 
                    key={i}
                    onClick={() => selectGame(game)}
                    className="bg-white/20 backdrop-blur-md rounded-lg p-4 hover:bg-white/30 transition-colors"
                  >
                    <div className="text-3xl mb-2">{game.icon}</div>
                    <div>{game.name}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        }
        
      case "affirmations":
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Positive Affirmations</h3>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 mb-6">
              <p className="text-2xl font-semibold mb-6">{currentAffirmation}</p>
              <button 
                onClick={getRandomAffirmation}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                New Affirmation
              </button>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
              <h4 className="font-semibold mb-2">Create Your Own</h4>
              <input
                type="text"
                value={customAffirmation}
                onChange={(e) => setCustomAffirmation(e.target.value)}
                placeholder="Enter your affirmation..."
                className="w-full p-2 rounded-lg mb-3"
              />
              <button 
                onClick={addCustomAffirmation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Affirmation
              </button>
            </div>
          </div>
        );
        
      case "emotions":
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Emotion Tracker</h3>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
              <h4 className="font-semibold mb-4">How are you feeling today?</h4>
              <div className="flex justify-between items-center mb-6">
                <span className="text-3xl">😔</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-1/2 mx-4"
                />
                <span className="text-3xl">😄</span>
              </div>
              
              <div className="text-xl mb-6">
                {mood === 1 && "I'm feeling down today"}
                {mood === 2 && "I'm feeling a bit low"}
                {mood === 3 && "I'm feeling okay"}
                {mood === 4 && "I'm feeling good"}
                {mood === 5 && "I'm feeling great!"}
              </div>
              
              <textarea
                placeholder="What made you feel good today? (optional)"
                className="w-full p-2 rounded-lg h-24"
              ></textarea>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      <NavBar />
      <div className={`min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 px-4 py-12 flex flex-col mt-20
        ${settings.reducedMotion ? 'motion-reduce' : ''}
        ${settings.highContrast ? 'contrast-150' : ''}
        ${settings.dyslexiaFont ? 'font-mono' : ''}`}>
        
        <h1 className="text-white text-3xl font-bold mb-8 text-center">MoodBooster</h1>
        
        {/* Accessibility button for smaller screens */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="fixed top-24 right-4 z-10 md:hidden bg-blue-500 text-white p-2 rounded-full shadow-lg"
        >
          <span className="text-xl">⚙️</span>
        </button>
        
        {/* Main content area with left menu and right content */}
        <div className="flex flex-1 gap-6">
          {/* Left side - Feature menu */}
          <div className="w-1/4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-white">Activities</h2>
              
              <div className="space-y-2">
                {features.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => selectFeature(feature)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                      activeFeature?.id === feature.id 
                        ? "bg-white/30 text-white" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-xs opacity-80">{feature.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Settings button */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="w-full mt-6 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
              >
                <span className="text-xl mr-2">⚙️</span>
                Accessibility Settings
              </button>
            </div>
          </div>
          
          {/* Right side - Content area */}
          <div className="w-3/4 relative">
            {activeFeature ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 text-white max-w-2xl mx-auto">
                {renderFeatureContent()}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 text-white text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Welcome to MoodBooster!</h2>
                <p className="mb-6">Select an activity from the menu to get started.</p>
                <div className="grid grid-cols-2 gap-4">
                  {features.map(feature => (
                    <div 
                      key={feature.id}
                      onClick={() => selectFeature(feature)}
                      className="bg-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <div className="font-semibold">{feature.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Settings panel - appears when clicked */}
            <div className={`absolute top-0 right-0 bg-blue-200/90 backdrop-blur-md w-64 transform transition-opacity duration-300 ease-in-out ${
              showSettings ? 'opacity-100 visible' : 'opacity-0 invisible'
            } shadow-lg rounded-xl overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-800 text-xl font-semibold">Accessibility Settings</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-gray-800 opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-gray-800 mb-2">
                      <input 
                        type="checkbox" 
                        checked={settings.reducedMotion}
                        onChange={() => toggleSetting('reducedMotion')}
                        className="mr-3 h-4 w-4"
                      />
                      Reduced Motion
                    </label>
                    <p className="text-gray-700 text-sm pl-7">Minimize animations and movement</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-gray-800 mb-2">
                      <input 
                        type="checkbox" 
                        checked={settings.highContrast}
                        onChange={() => toggleSetting('highContrast')}
                        className="mr-3 h-4 w-4"
                      />
                      High Contrast
                    </label>
                    <p className="text-gray-700 text-sm pl-7">Increases visual contrast</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-gray-800 mb-2">
                      <input 
                        type="checkbox" 
                        checked={settings.dyslexiaFont}
                        onChange={() => toggleSetting('dyslexiaFont')}
                        className="mr-3 h-4 w-4"
                      />
                      Dyslexia Font
                    </label>
                    <p className="text-gray-700 text-sm pl-7">Uses more readable font</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-gray-800 mb-2">
                      <input 
                        type="checkbox" 
                        checked={settings.textToSpeech}
                        onChange={() => toggleSetting('textToSpeech')}
                        className="mr-3 h-4 w-4"
                      />
                      Text to Speech
                    </label>
                    <p className="text-gray-700 text-sm pl-7">Read affirmations aloud</p>
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

export default MoodBooster;