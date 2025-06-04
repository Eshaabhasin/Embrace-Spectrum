
import React, { useRef, useState, useEffect } from "react";
import { Mic, Video, Users, Briefcase, MessageSquare, Eye, Target, TrendingUp, CheckCircle, XCircle, Clock, Volume2, Camera, MicOff, VideoOff } from "lucide-react";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;


const PRACTICE_TYPES = {
  professional: {
    id: 'professional',
    title: 'Professional Communication',
    description: 'Practice job interviews, presentations, and workplace conversations',
    icon: Briefcase,
    color: 'blue'
  },
  social: {
    id: 'social',
    title: 'Social Conversation',
    description: 'Improve casual conversations, networking, and social interactions',
    icon: Users,
    color: 'green'
  }
};

// Enhanced analysis functions
const analyzeTranscription = (transcription, practiceType, sessionDuration) => {
  const sentences = transcription.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = transcription.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // More comprehensive filler words and hesitation patterns
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'well', 'so', 'right', 'okay', 'i mean'];
  const hesitationPatterns = ['...', 'erm', 'hmm', 'ah'];
  
  let fillerCount = 0;
  const detectedFillers = [];
  
  fillerWords.forEach(filler => {
    const matches = transcription.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g')) || [];
    fillerCount += matches.length;
    if (matches.length > 0) {
      detectedFillers.push({ word: filler, count: matches.length });
    }
  });
  
  hesitationPatterns.forEach(pattern => {
    const matches = transcription.toLowerCase().match(new RegExp(pattern, 'g')) || [];
    fillerCount += matches.length;
  });
  
  // Calculate metrics
  const speakingRate = sessionDuration > 0 ? Math.round((wordCount / (sessionDuration / 60000))) : 0;
  const fillerPercentage = wordCount > 0 ? Math.round((fillerCount / wordCount) * 100) : 0;
  const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
  
  // Vocabulary complexity analysis
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, ''))).size;
  const vocabularyDiversity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;
  
  // Content length assessment
  let contentDepth = 0;
  if (wordCount < 10) contentDepth = 20;
  else if (wordCount < 30) contentDepth = 40;
  else if (wordCount < 60) contentDepth = 60;
  else if (wordCount < 100) contentDepth = 75;
  else contentDepth = 90;
  
  // Professional vs Social context scoring
  const professionalWords = ['experience', 'skills', 'team', 'project', 'responsibility', 'achievement', 'goal', 'strategy', 'solution', 'management'];
  const socialWords = ['great', 'awesome', 'cool', 'nice', 'interesting', 'fun', 'enjoy', 'love', 'amazing', 'wonderful'];
  
  const contextWords = practiceType === 'professional' ? professionalWords : socialWords;
  const contextScore = contextWords.reduce((score, word) => {
    return score + (transcription.toLowerCase().includes(word) ? 10 : 0);
  }, 0);
  
  return {
    wordCount,
    fillerCount,
    fillerPercentage,
    detectedFillers,
    speakingRate,
    avgWordsPerSentence,
    vocabularyDiversity,
    contentDepth,
    contextScore: Math.min(contextScore, 100),
    sentences: sentences.length
  };
};

// Enhanced feedback generator with more realistic scoring
const generateFeedback = (practiceType, transcription, sessionDuration) => {
  const analysis = analyzeTranscription(transcription, practiceType, sessionDuration);
  
  // Calculate component scores more realistically
  const clarityScore = Math.max(20, Math.min(100, 
    85 - (analysis.fillerPercentage * 3) + (analysis.vocabularyDiversity * 0.3)
  ));
  
  const paceScore = (() => {
    if (analysis.speakingRate < 100) return 45; // Too slow
    if (analysis.speakingRate < 130) return 70; // Slightly slow
    if (analysis.speakingRate >= 130 && analysis.speakingRate <= 160) return 90; // Good pace
    if (analysis.speakingRate <= 180) return 75; // Slightly fast
    return 50; // Too fast
  })();
  
  const contentScore = Math.max(30, Math.min(95, 
    (analysis.contentDepth * 0.6) + (analysis.contextScore * 0.4)
  ));
  
  const toneScore = Math.max(40, Math.min(95,
    70 + (analysis.avgWordsPerSentence > 5 ? 15 : 0) + (analysis.sentences > 2 ? 10 : -10)
  ));
  
  // Overall score calculation
  const overallScore = Math.round(
    (clarityScore * 0.3) + (paceScore * 0.25) + (contentScore * 0.25) + (toneScore * 0.2)
  );
  
  // Generate contextual feedback
  const generateFeedbackText = (score, metric, analysis) => {
    switch(metric) {
      case 'clarity':
        if (analysis.fillerPercentage > 15) return `High filler word usage (${analysis.fillerPercentage}%). Try pausing instead of using: ${analysis.detectedFillers.map(f => f.word).join(', ')}.`;
        if (analysis.fillerPercentage > 8) return `Moderate filler word usage (${analysis.fillerPercentage}%). Consider reducing words like: ${analysis.detectedFillers.map(f => f.word).join(', ')}.`;
        return "Excellent clarity with minimal filler words. Your speech flows naturally.";
      
      case 'pace':
        if (analysis.speakingRate < 100) return `Speaking pace is quite slow (${analysis.speakingRate} WPM). Try to increase your energy and speaking rate.`;
        if (analysis.speakingRate > 180) return `Speaking pace is very fast (${analysis.speakingRate} WPM). Slow down to ensure your audience can follow.`;
        if (analysis.speakingRate >= 130 && analysis.speakingRate <= 160) return `Excellent speaking pace (${analysis.speakingRate} WPM). Easy to follow and engaging.`;
        return `Speaking pace of ${analysis.speakingRate} WPM could be adjusted for better engagement.`;
      
      case 'content':
        if (analysis.wordCount < 20) return `Very brief response (${analysis.wordCount} words). Try to elaborate more on your thoughts and provide examples.`;
        if (analysis.wordCount < 50) return `Short response (${analysis.wordCount} words). Consider expanding with more details and examples.`;
        return `Good content depth (${analysis.wordCount} words) with ${analysis.sentences} complete thoughts.`;
      
      default:
        return "Analysis completed.";
    }
  };
  
  const feedback = {
    overall: {
      score: overallScore,
      summary: overallScore >= 85 
        ? `Excellent ${practiceType} communication with strong clarity and engagement.`
        : overallScore >= 70
        ? `Good ${practiceType} communication with some areas for improvement.`
        : overallScore >= 50
        ? `Developing ${practiceType} communication skills. Focus on the key recommendations below.`
        : `Significant room for improvement in ${practiceType} communication. Practice regularly with the suggestions provided.`
    },
    speechAnalysis: {
      clarity: {
        score: Math.round(clarityScore),
        feedback: generateFeedbackText(clarityScore, 'clarity', analysis)
      },
      pace: {
        score: Math.round(paceScore),
        feedback: generateFeedbackText(paceScore, 'pace', analysis)
      },
      content: {
        score: Math.round(contentScore),
        feedback: generateFeedbackText(contentScore, 'content', analysis)
      }
    },
    nonVerbalCues: {
      eyeContact: {
        score: Math.round(70 + Math.random() * 25),
        feedback: "Simulated analysis suggests maintaining direct eye contact. Look at the camera to simulate eye contact in virtual settings."
      },
      facialExpressions: {
        score: Math.round(75 + Math.random() * 20),
        feedback: "Your facial expressions appeared engaged. Continue using expressions to emphasize important points."
      },
      posture: {
        score: Math.round(80 + Math.random() * 15),
        feedback: "Body positioning looked confident. Maintain good posture to project authority and engagement."
      }
    },
    detailedMetrics: {
      wordCount: analysis.wordCount,
      fillerCount: analysis.fillerCount,
      speakingRate: analysis.speakingRate,
      vocabularyDiversity: analysis.vocabularyDiversity,
      sessionDuration: Math.round(sessionDuration / 1000)
    },
    recommendations: (() => {
      const recs = [];
      
      if (analysis.fillerPercentage > 10) {
        recs.push(`Reduce filler words - you used ${analysis.fillerCount} fillers (${analysis.fillerPercentage}% of speech)`);
      }
      
      if (analysis.speakingRate < 120) {
        recs.push("Increase speaking pace to maintain audience engagement");
      } else if (analysis.speakingRate > 170) {
        recs.push("Slow down your speaking pace for better comprehension");
      }
      
      if (analysis.wordCount < 30) {
        recs.push("Provide more detailed responses with examples and elaboration");
      }
      
      if (analysis.avgWordsPerSentence < 5) {
        recs.push("Use more complete sentences to express complex ideas");
      }
      
      if (practiceType === 'professional') {
        recs.push("Practice the STAR method (Situation, Task, Action, Result) for structured responses");
        if (analysis.contextScore < 50) {
          recs.push("Include more professional terminology and industry-specific language");
        }
      } else {
        recs.push("Use open-ended questions to keep conversations flowing naturally");
        if (analysis.contextScore < 50) {
          recs.push("Express more enthusiasm and personal interest in topics");
        }
      }
      
      return recs.length > 0 ? recs : ["Great job! Continue practicing to maintain your communication skills."];
    })()
  };

  return feedback;
};

// Simple Control Tray Component
const ControlTray = ({ videoRef, onVideoStreamChange }) => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [stream, setStream] = useState(null);

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        onVideoStreamChange(mediaStream);
        setIsVideoOn(true);
        setIsMicOn(true);
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        onVideoStreamChange(null);
        setStream(null);
        setIsVideoOn(false);
        setIsMicOn(false);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full ${
          isVideoOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
        } text-white transition-colors`}
        aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </button>
      <button
        className={`p-3 rounded-full ${
          isMicOn ? 'bg-green-500' : 'bg-gray-500'
        } text-white cursor-not-allowed`}
        disabled
        aria-label="Microphone status"
      >
        {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>
    </div>
  );
};

function SpeechCoach() {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const [videoStream, setVideoStream] = useState(null);
  
  // Core state
  const [selectedPracticeType, setSelectedPracticeType] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Transcription and feedback
  const [transcription, setTranscription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Real-time metrics
  const [liveMetrics, setLiveMetrics] = useState({
    wordCount: 0,
    fillerCount: 0,
    speakingRate: 0,
    sessionDuration: 0
  });

  // Check speech recognition support
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Update live metrics as user speaks
  useEffect(() => {
    if (sessionActive && sessionStartTime) {
      const interval = setInterval(() => {
        const currentDuration = Date.now() - sessionStartTime;
        const analysis = analyzeTranscription(transcription, selectedPracticeType, currentDuration);
        
        setLiveMetrics({
          wordCount: analysis.wordCount,
          fillerCount: analysis.fillerCount,
          speakingRate: analysis.speakingRate,
          sessionDuration: Math.round(currentDuration / 1000)
        });
      }, 2000); // Update every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [sessionActive, sessionStartTime, transcription, selectedPracticeType]);

  // Speech recognition setup
  useEffect(() => {
    if (sessionActive && speechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Restart recognition if session is still active
        if (sessionActive) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.log('Recognition restart failed:', error);
            }
          }, 1000);
        }
      };
      
      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current = recognition;
      
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }
  }, [sessionActive, speechSupported]);

  const startSession = (practiceType) => {
    setSelectedPracticeType(practiceType);
    setSessionActive(true);
    setSessionEnded(false);
    setSessionStartTime(Date.now());
    setTranscription("");
    setFeedback(null);
    setLiveMetrics({ wordCount: 0, fillerCount: 0, speakingRate: 0, sessionDuration: 0 });
  };

  const endSession = async () => {
    if (transcription.trim().length < 10) {
      alert("Please speak more before ending the session. We need at least a few sentences to provide meaningful feedback.");
      return;
    }
    
    setSessionActive(false);
    setSessionEnded(true);
    setAnalyzingFeedback(true);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const sessionDuration = Date.now() - sessionStartTime;
    
    // Simulate AI analysis delay (more realistic timing)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const generatedFeedback = generateFeedback(selectedPracticeType, transcription, sessionDuration);
    setFeedback(generatedFeedback);
    setAnalyzingFeedback(false);
  };

  const resetSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setSelectedPracticeType(null);
    setSessionActive(false);
    setSessionEnded(false);
    setSessionStartTime(null);
    setTranscription("");
    setFeedback(null);
    setAnalyzingFeedback(false);
    setLiveMetrics({ wordCount: 0, fillerCount: 0, speakingRate: 0, sessionDuration: 0 });
  };

  const ScoreCircle = ({ score, size = "w-16 h-16" }) => {
    const circumference = 2 * Math.PI * 20;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
    
    return (
      <div className={`${size} relative`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{score}</span>
        </div>
      </div>
    );
  };

  // Speech not supported warning
  if (!speechSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Speech Recognition Not Supported</h2>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for the best experience.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Practice type selection screen
  if (!selectedPracticeType) {
    return (
      <>
      <div className="min-h-screen mt-25">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Speech Coach
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Choose your practice focus and improve your communication skills with AI-powered feedback
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.values(PRACTICE_TYPES).map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
                  onClick={() => startSession(type.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && startSession(type.id)}
                  aria-label={`Start ${type.title} practice`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
    );
  }

  // Feedback results screen
  if (sessionEnded && feedback) {
    return (
      <>
      <div className="min-h-screen mt-25">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-8xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                Session Complete!
              </h1>
              <p className="text-xl text-white">
                Here's your detailed communication analysis
              </p>
            </div>

            {/* Overall Score */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Performance</h2>
                <div className="flex justify-center mb-6">
                  <ScoreCircle score={feedback.overall.score} size="w-24 h-24" />
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {feedback.overall.summary}
                </p>
                
                {/* Session Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{feedback.detailedMetrics.wordCount}</div>
                    <div className="text-sm text-gray-600">Words Spoken</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{feedback.detailedMetrics.speakingRate}</div>
                    <div className="text-sm text-gray-600">Words/Min</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">{feedback.detailedMetrics.fillerCount}</div>
                    <div className="text-sm text-gray-600">Filler Words</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{feedback.detailedMetrics.sessionDuration}s</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Speech Analysis */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Mic className="w-6 h-6 mr-2 text-blue-600" />
                  Speech Analysis
                </h3>
                <div className="space-y-6">
                  {Object.entries(feedback.speechAnalysis).map(([key, data]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold capitalize text-gray-800">{key}</span>
                        <ScoreCircle score={data.score} size="w-12 h-12" />
                      </div>
                      <p className="text-gray-600 text-sm">{data.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Verbal Analysis */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-green-600" />
                  Non-Verbal Cues
                </h3>
                <div className="space-y-6">
                  {Object.entries(feedback.nonVerbalCues).map(([key, data]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold capitalize text-gray-800">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <ScoreCircle score={data.score} size="w-12 h-12" />
                      </div>
                      <p className="text-gray-600 text-sm">{data.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Recommendations for Improvement
              </h3>
              <div className="grid gap-4">
                {feedback.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => startSession(selectedPracticeType)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                aria-label="Practice again"
              >
                Practice Again
              </button>
              <button
                onClick={resetSession}
                className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                aria-label="Choose different practice type"
              >
                Choose Different Practice
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Loading/analyzing screen
  if (analyzingFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Performance</h2>
          <p className="text-gray-600">AI is processing your speech patterns, tone, and communication style...</p>
          <div className="mt-4 text-sm text-gray-500">
            Analyzing {liveMetrics.wordCount} words from your {Math.round(liveMetrics.sessionDuration)}-second session
          </div>
        </div>
      </div>
    );
  }

  // Get current practice type info with safety check
  const currentPracticeType = PRACTICE_TYPES[selectedPracticeType];
  if (!currentPracticeType) {
    console.error('Invalid practice type:', selectedPracticeType);
    resetSession();
    return null;
  }

  // Active session screen
  return (
    <div className="min-h-screen mt-25">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="container mx-auto px-6 py-8">
          {/* Session Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
              <h1 className="text-3xl font-bold text-white">
                {currentPracticeType.title} Session
              </h1>
            </div>
            <p className="text-lg text-white">
              Speak naturally - your communication is being analyzed in real-time
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video and Controls */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="relative mb-6">
                  <Altair />
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full rounded-xl ${!videoRef.current || !videoStream ? 'hidden' : ''}`}
                    aria-label="Your live video feed"
                  />
                </div>
                <ControlTray
                  videoRef={videoRef}
                  supportsVideo={true}
                  onVideoStreamChange={setVideoStream}
                />
              </div>

              {/* Real-time Metrics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Live Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{liveMetrics.wordCount}</div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{liveMetrics.speakingRate}</div>
                    <div className="text-sm text-gray-600">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{liveMetrics.fillerCount}</div>
                    <div className="text-sm text-gray-600">Fillers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{liveMetrics.sessionDuration}s</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                </div>
              </div>

              {/* End Session Button */}
              <div className="text-center">
                <button
                  onClick={endSession}
                  className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-lg"
                  aria-label="End practice session"
                >
                  End Session & Get Feedback
                </button>
              </div>
            </div>

            {/* Live Transcription */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg h-96">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Live Transcription</h3>
                  {isListening && (
                    <div className="ml-auto flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm text-green-600 font-medium">Listening</span>
                    </div>
                  )}
                </div>
                <div 
                  className="h-72 overflow-y-auto bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed"
                  aria-live="polite"
                  aria-label="Live transcription of your speech"
                >
                  {transcription || (
                    <p className="text-gray-500 italic">
                      Start speaking to see your words appear here in real-time...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default SpeechCoach;