import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-react'; 
import { MessageCircle, Sparkles, X, ChevronRight, RotateCcw } from 'lucide-react';
import {db} from '../../../firebase';
import { useAudioDescription } from '../AudioDescription/AudioDescriptionContext';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const GeminiAgent = () => {
  const { user, isLoaded } = useUser();
  const [onboardingData, setOnboardingData] = useState(null);
  const [recommendationCards, setRecommendationCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [typingText, setTypingText] = useState('');
  const chatRef = useRef(null);
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();

  // Monitor Clerk authentication state and fetch data
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Clerk user detected:', user.id);
      fetchOnboardingData(user.id);
    } else if (isLoaded && !user) {
      console.log('No user signed in with Clerk');
      setOnboardingData(null);
    }
  }, [isLoaded, user]);

  // Fetch user onboarding data from Firestore
  const fetchOnboardingData = async (userId) => {
    try {
      console.log('Fetching data for user:', userId);
      
      const docRef = doc(db, 'onboardingData', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Onboarding data found:', data);
        
        if (data.preferredName || data.mainGoals || data.neurodiversityTypes) {
          setOnboardingData(data);
          console.log('Data structure matches expected format');
        } else {
          console.log('Data found but structure unexpected:', Object.keys(data));
          setOnboardingData(data);
        }
      } else {
        console.log('No onboarding document found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  // System prompt for Gemini - updated for card format
  const createSystemPrompt = (userData) => {
    return `You are a compassionate wellness assistant for "Embrace Spectrum", a mental wellness app. 

    User Profile:
    - Name: ${userData.preferredName || user?.firstName || 'Friend'}
    - Age Group: ${userData.ageGroup || 'Not specified'}
    - Role: ${userData.role || 'Not specified'}
    - Main Goals: ${Array.isArray(userData.mainGoals) ? userData.mainGoals.join(', ') : userData.mainGoals || 'Not specified'}
    - Neurodiversity Types: ${Array.isArray(userData.neurodiversityTypes) ? userData.neurodiversityTypes.join(', ') : userData.neurodiversityTypes || 'Not specified'}
    - Communication Style: ${userData.communicationStyle || 'Not specified'}
    - Sensory Preferences: ${Array.isArray(userData.sensoryPreferences) ? userData.sensoryPreferences.join(', ') : userData.sensoryPreferences || 'Not specified'}

    IMPORTANT: You can ONLY recommend features from this exact list:
    1. Emotion Journal - synced perfectly with Google
    2. Support chatbot - Uses Gemini
    3. Talk Coach Live Conversation with Gemini
    4. Quiz to test yourself
    5. Sketch Tales to convert Imagination into stories
    6. Feel Reader - To feel what's intended in plain text

    CRITICAL FORMAT REQUIREMENT:
    - Respond with EXACTLY 3-4 short cards separated by "|||"
    - Each card should be 2-4 lines maximum
    - Use friendly language and 1-2 emojis per card
    - Make each card stand alone (don't reference other cards)
    - Focus on specific features that match their profile

    Example format:
    Hi Sarah! 🌟 Based on your goals, I think you'd love our Emotion Journal. It syncs with Google and helps track your daily feelings effortlessly.|||The Support chatbot could be perfect for you! 💙 It uses Gemini AI and understands neurodivergent communication styles really well.|||I'd also recommend Talk Coach! 🗣️ It's great for practicing conversations in a safe space with real-time AI feedback.|||Ready to start your wellness journey? ✨ These tools are designed specifically with your needs in mind!

    Keep each card warm, specific to their profile, and encouraging!`;
  };

  // Parse response into cards
  const parseCardsFromResponse = (response) => {
    const cards = response.split('|||').map(card => card.trim()).filter(card => card.length > 0);
    return cards.length > 0 ? cards : [response]; // Fallback to single card if parsing fails
  };

  // Generate recommendations using Gemini
  const generateRecommendation = async () => {
    console.log('Generating recommendation with data:', onboardingData);
    
    if (!onboardingData) {
      setRecommendationCards([
        "Hi there! 👋 I'd love to help you find the perfect wellness tools for your journey.",
        "It looks like you haven't completed your onboarding yet! ✨",
        "Once you share a bit about yourself, I can give you personalized recommendations that really fit your needs. 🌟",
        "Ready to get started? Complete your profile and let's find your perfect wellness match! 💙"
      ]);
      setHasRecommendation(true);
      setCurrentCardIndex(0);
      return;
    }

    setIsLoading(true);
    setTypingText('');

    try {
      console.log('Making API call to Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: createSystemPrompt(onboardingData) }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        const cards = parseCardsFromResponse(generatedText);
        
        // Typing effect for first card
        let currentText = '';
        const firstCard = cards[0];
        for (let i = 0; i < firstCard.length; i++) {
          currentText += firstCard[i];
          setTypingText(currentText);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        setRecommendationCards(cards);
        setHasRecommendation(true);
        setCurrentCardIndex(0);
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error generating recommendation:', error);
      const userName = onboardingData?.preferredName || user?.firstName;
      setRecommendationCards([
        "I'm having a little trouble connecting right now, but I'm here for you! 💙",
        `${userName ? `${userName}, based on what I know about you,` : 'For now,'} I'd recommend starting with our Support chatbot! 🤖`,
        "The Emotion Journal is also fantastic for tracking your daily wellness journey. ✨",
        "Try again in a moment, and I'll give you more personalized suggestions! 🌟"
      ]);
      setHasRecommendation(true);
      setCurrentCardIndex(0);
    } finally {
      setIsLoading(false);
      setTypingText('');
    }
  };

  // Handle next card
  const handleNextCard = () => {
    if (currentCardIndex < recommendationCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  // Handle previous card
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Handle chat open/close
  const handleChatToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!hasRecommendation) {
        generateRecommendation();
      }
    } else {
      setIsOpen(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [recommendationCards, typingText, currentCardIndex]);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div className="mb-4 w-90 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Wellness Guide</h3>
                <p className="text-purple-100 text-xs">Your personal companion</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => isAudioDescriptionEnabled && speakText("Close wellness guide")}
              aria-label="Close wellness guide"
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={chatRef} className="p-4 min-h-48 flex flex-col justify-center">            
            {isLoading ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-l-4 border-purple-300">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-purple-600 text-sm font-medium">Creating your recommendations...</span>
                </div>
                {typingText && (
                  <p className="text-gray-700 leading-relaxed">{typingText}</p>
                )}
              </div>
            ) : recommendationCards.length > 0 ? (
              <div className="space-y-4">
                {/* Current Card */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-l-4 border-purple-300 shadow-sm min-h-24 flex items-center">
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-purple-600 text-sm font-semibold">
                         {currentCardIndex + 1} of {recommendationCards.length}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {recommendationCards[currentCardIndex]}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevCard}
                    onMouseEnter={() => isAudioDescriptionEnabled && speakText("Previous recommendation")}
                    disabled={currentCardIndex === 0}
                    aria-label="Previous recommendation"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      currentCardIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {recommendationCards.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentCardIndex ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextCard}
                    onMouseEnter={() => isAudioDescriptionEnabled && speakText("Next recommendation")}
                    disabled={currentCardIndex === recommendationCards.length - 1}
                    aria-label="Next recommendation"
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                      currentCardIndex === recommendationCards.length - 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-l-4 border-purple-300 text-center">
                <p className="text-gray-700">Click to get your personalized wellness recommendations! ✨</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Powered by Gemini AI</span>
              {hasRecommendation && (
                <button 
                  onClick={() => {
                    setHasRecommendation(false);
                    setRecommendationCards([]);
                    setCurrentCardIndex(0);
                    generateRecommendation();
                  }}
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Get new wellness suggestions")}
                  aria-label="Get new wellness suggestions"
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>New Suggestions</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleChatToggle}
        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Open Wellness Guide for personalized recommendations")}
        aria-label="Open Wellness Guide for personalized recommendations"
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-200"></div>
        
        {/* Icon */}
        <MessageCircle className="w-6 h-6 text-white relative z-10 transform group-hover:rotate-12 transition-transform duration-200" />
        
        {/* Notification dot */}
        {!hasRecommendation && user && onboardingData && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-purple-300 opacity-0 group-hover:opacity-30 group-hover:animate-ping"></div>
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-16 left-0 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Get wellness recommendations
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default GeminiAgent;