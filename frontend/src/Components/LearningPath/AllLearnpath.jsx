import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import parse from 'html-react-parser';
import SubmitButtonInvestiMate from "./FormSubmitButton";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Download, Volume2, VolumeX } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LearningPathPDF from "./PDFGeneratorPaths";

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
        .replace(/(!important|!note|note:|important:)/gi, '<strong class="text-blue-500">$1</strong>')
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
    location: "",
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

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
    "Ladakh", "Lakshadweep", "Puducherry"
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
  return `Create a personalized and inclusive educational toolkit in ${formData.preferred_language}, tailored for a neurodivergent learner.

User Profile:
- Preferred Language: ${formData.preferred_language}
- Location: ${formData.location}
- Age: ${formData.age}
- Understanding Level: ${formData.learning_path_type}
- Learning Topic: ${formData.learning_topic}

Design an educational path that is:
- Neurodivergent-friendly (suitable for users with autism, ADHD, dyslexia, etc.)
- Simple, visual, structured, and calming
- Free from overwhelming details, using plain language and short sentences
- Encouraging and empowering

Please include:
1. A 6-week simplified learning roadmap, with each week broken into small, manageable parts
2. Direct online resources with actual, accessible URLs
3. Local community resources and support groups in ${formData.location}
4. Free or low-cost learning materials (audio, video, interactive)
5. Sensory-friendly practice tasks with expected outcomes and time commitment
6. Visual supports (if possible: diagrams, flowcharts, videos)

Each Week Format:
Week X:
• Focus Topic  
• Simple Explanation  
• Free Resources (with real links)  
• Interactive/Visual Tools  
• Practice Task (sensory-friendly)  
• Outcome to Expect  
• Time Needed (in minutes)  

Guidelines:
- All content must be in ${formData.preferred_language}
- Make it visually digestible and cognitively light
- Prioritize clarity, routine, and scaffolded learning
- Recommend breaks and sensory considerations if needed
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
      const response = await axios.post("http://localhost:3002/api/learn", {
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
          <h1 className="text-3xl font-bold mt-14 mb-1 text-white">
            Financial Education Plan
          </h1>

          <select
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleInputChange}
            required
            className="mt-5 w-full p-3 bg-white text-black rounded-lg"
          >
            <option value="">Select Preferred Language</option>
            {indianLanguages.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>

          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full p-3 bg-white text-black rounded-lg"
          >
            <option value="">Select Your State</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Your Age"
            required
            className="w-full p-3 bg-white text-black rounded-lg"
          />

          <select
            name="learning_path_type"
            value={formData.learning_path_type}
            onChange={handleInputChange}
            required
            className="w-full p-3 bg-white text-black rounded-lg"
          >
            <option value="">Select Learning Path Type</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Professional">Professional Certification</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="text"
              name="learning_topic"
              value={formData.learning_topic}
              onChange={handleInputChange}
              placeholder="What specific topic do you want to learn?"
              className="w-full p-3 bg-white text-black rounded-lg"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          <SubmitButtonInvestiMate
            onClick={sendDataToAPI}
            disabled={isLoading}
          >
          </SubmitButtonInvestiMate>

       

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}
        </form>
      </div>

      {/* Response Section */}
      {(response || isLoading) && (
          <div className="lg:w-[45%] lg:absolute right-8 top-[10%] mt-10 lg:mt-13 max-h-[75vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="mt-5 w-full rounded-lg border border-gray-700 bg-[#FFFDD0] backdrop-blur-sm shadow-lg">
              <div className="border-b border-gray-700 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-black">Your Personalized Learning Path</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={isSpeaking ? stopSpeaking : speak}
                    className={`p-2 rounded-full transition-colors ${
                      isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
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
                  <PDFDownloadLink
                    document={<LearningPathPDF formData={formData} response={response} />}
                    fileName={`LearnPath_${formData.learning_topic}_${new Date().toISOString().split('T')[0]}.pdf`}
                    className="text-white hover:text-pink-500 transition-colors p-2"
                  >
                    {({ loading }) => 
                      loading ? (
                        <div className="animate-pulse">
                          <Download className="h-5 w-5" />
                        </div>
                      ) : (
                        <Download className="h-5 w-5" />
                      )
                    }
                  </PDFDownloadLink>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <span className="text-gray-400">Crafting your personalized learning path...</span>
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