import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import parse from 'html-react-parser';
import SubmitButtonInvestiMate from "./FormSubmitButton";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Volume2, VolumeX, User, Calendar, BookOpen, MessageCircle } from 'lucide-react';

const languageToCode = {
  'English': 'en-IN',
  'Hindi': 'hi-IN',
  'Bengali': 'bn-IN',
  'Telugu': 'te-IN',
  'Marathi': 'mr-IN',
  'Tamil': 'ta-IN',
  'Gujarati': 'gu-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Punjabi': 'pa-IN'
};

const ResponseDisplay = ({ text, language, isLoading }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!text || !speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageToCode[language] || 'en-IN';
    const voices = speechSynthesis.getVoices();
    const languageVoice = voices.find(voice => voice.lang === utterance.lang);
    if (languageVoice) {
      utterance.voice = languageVoice;
    }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!text) return null;

  const processText = (text) => {
    const paragraphs = text.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      const processedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/₹(\d+(?:,\d+)*(?:\.\d+)?)/g, '<span class="whitespace-nowrap">₹$1</span>')
        .replace(/(\d+(?:,\d+)*(?:\.\d+)?)/g, '<span class="whitespace-nowrap">$1</span>')
        .replace(/(!important|!note|note:|important:)/gi, '<strong class="text-blue-600">$1</strong>')
        .replace(/^- /g, '• ')
        .replace(/^[0-9]+\. /g, match => `<strong>${match}</strong>`);

      return (
        <div key={index} className="mb-4 last:mb-0 leading-relaxed">
          {parse(processedText)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-2">
      {processText(text)}
    </div>
  );
};

const LearnPath = () => {
  const [formData, setFormData] = useState({
    preferred_language: "",
    age: "",
    learning_path_type: "",
    learning_topic: "",
  });
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!response || !speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = languageToCode[formData.preferred_language] || 'en-IN';
    const voices = speechSynthesis.getVoices();
    const languageVoice = voices.find(voice => voice.lang === utterance.lang);
    if (languageVoice) {
      utterance.voice = languageVoice;
    }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const { 
    transcript, 
    resetTranscript, 
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, learning_topic: transcript }));
    }
  }, [transcript]);

  const indianLanguages = [
    "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", 
    "Urdu", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", 
    "Assamese", "Sanskrit", "Konkani", "Manipuri", "Nepali"
  ];

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
      setIsListening(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const formatDataToString = () => {
    return `Create a personalized and inclusive educational toolkit in ${formData.preferred_language}.

User Profile:
- Preferred Language: ${formData.preferred_language}
- Age: ${formData.age}
- Understanding Level: ${formData.learning_path_type}
- Learning Topic: ${formData.learning_topic}

Design an educational path that is:
- Simple, visual, structured, and calming
- Free from overwhelming details, using plain language and short sentences
- Encouraging and empowering
- Accessible and inclusive for all learning styles

Please include:
1. A 6-week simplified learning roadmap, with each week broken into small, manageable parts
2. Direct online resources with actual, accessible URLs
3. Local community resources and support groups
4. Free or low-cost learning materials (audio, video, interactive)
5. Practice tasks with expected outcomes and time commitment
6. Visual supports (if possible: diagrams, flowcharts, videos)

Each Week Format:
Week X:
• Focus Topic  
• Simple Explanation  
• Free Resources (with real links)  
• Interactive/Visual Tools  
• Practice Task  
• Outcome to Expect  
• Time Needed (in minutes)  

Guidelines:
- All content must be in ${formData.preferred_language}
- Make it visually digestible and easy to follow
- Prioritize clarity, routine, and step-by-step learning
- Include regular breaks and pacing recommendations
- Ensure suggestions are age-appropriate for ${formData.age}`;
  };

  const validateForm = () => {
    const fields = Object.entries(formData);
    for (const [key, value] of fields) {
      if (key !== "learning_topic" && (!value || value.trim() === "")) {
        setErrorMessage(`Please enter your ${key.replace("_", " ")}`);
        return false;
      }
    }
    
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) < 13 || parseInt(formData.age) > 100)) {
      setErrorMessage("Please enter a valid age between 13 and 100");
      return false;
    }

    return true;
  };

  const sendDataToAPI = async () => {
    if (!validateForm()) return;

    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/learn", {
        message: formatDataToString(),
      });

      if (response.data && response.data.message) {
        setResponse(response.data.message);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error.response?.data?.error || 
        "Failed to generate learning path. Please try again."
      );
    } finally {
      setIsLoading(false);
      resetTranscript();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-red-500">
        Browser doesn't support speech recognition.
      </div>
    );
  }

  return (
    <>
    <NavBar/>
    <div className="lg:flex gap-8 p-8 mt-8 flex-1">
      <div className="lg:w-[46%]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <h1 className="text-6xl font-extrabold mt-20 mb-9 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-2xl tracking-normal animate-fade-in">
  Growth Journey
</h1>

          {/* Language Selection */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-teal-500" />
            </div>
            <select
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleInputChange}
              required
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-teal-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-colors shadow-sm"
            >
              <option value="">Select Preferred Language</option>
              {indianLanguages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>

          {/* Age Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Your Age"
              required
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors shadow-sm"
            />
          </div>

          {/* Learning Path Type */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
            <select
              name="learning_path_type"
              value={formData.learning_path_type}
              onChange={handleInputChange}
              required
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-green-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 transition-colors shadow-sm"
            >
              <option value="">Select Learning Path Type</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Professional">Professional Certification</option>
            </select>
          </div>

          {/* Learning Topic with Voice Input */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MessageCircle className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="learning_topic"
                  value={formData.learning_topic}
                  onChange={handleInputChange}
                  placeholder="What specific topic do you want to learn?"
                  className="flex-1 pl-12 pr-4 py-4 bg-white border-2 border-purple-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening 
                      ? 'bg-red-100 border-2 border-red-300 text-red-600' 
                      : 'bg-blue-100 border-2 border-blue-300 text-blue-600 hover:bg-blue-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {isListening && (
              <div className="text-sm text-slate-600 flex items-center gap-2 pl-4">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Listening...
              </div>
            )}
          </div>

          {/* Submit Button */}
          <SubmitButtonInvestiMate
            onClick={sendDataToAPI}
            disabled={isLoading}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}
        </form>
      </div>

      {/* Response Section */}
      {(response || isLoading) && (
          <div className="lg:w-[45%] lg:absolute right-8 top-[10%] mt-10 lg:mt-13 max-h-[75vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="mt-5 w-full rounded-lg border border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm shadow-xl">
              <div className="border-b border-indigo-200 p-6 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg">
                <h3 className="text-xl font-bold text-white">Your Personalized Learning Path</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={isSpeaking ? stopSpeaking : speak}
                    className={`p-2 rounded-full transition-colors ${
                      isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                    }`}
                    title={isSpeaking ? 'Stop speaking' : 'Start speaking'}
                    disabled={isLoading || !response}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <span className="text-gray-600">Crafting your personalized learning path...</span>
                  </div>
                ) : (
                  <ResponseDisplay 
                    text={response} 
                    language={formData.preferred_language}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LearnPath;