import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Star, Mic, MicOff, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';

const LifeSkillsQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTextAnswer(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-generate questions on component mount
  useEffect(() => {
    generateQuestions();
  }, []);

  // Backend API question generation
  const generateQuestions = async () => {
    setIsGenerating(true);
    setGenerationError('');
    setIsLoading(true);
    
   try {
  const response = await fetch('http://localhost:3000/api/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'life-skills-neurodivergent',
      count: 5
    })
  });


      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid question format');
      }

    } catch (error) {
      console.error('Backend API Error:', error);
      setGenerationError(`Failed to generate questions: ${error.message}`);
      
      // Fallback questions for neurodivergent users
      const fallbackQuestions = [
        {
          id: 1,
          type: 'mcq',
          scenario: "🏢 You're in an open office and the constant noise is making it hard to focus on an important deadline. Your productivity is suffering.",
          question: "What's the most effective way to handle this sensory challenge? 🎯",
          options: [
            "🎧 Request noise-canceling headphones or ask to work in a quieter space",
            "😤 Tell everyone around you to be quieter",
            "😓 Try to push through and hope it gets better",
            "🏠 Call in sick to work from home"
          ],
          correct: 0,
          explanation: "Proactively requesting accommodations shows self-advocacy skills and creates a win-win solution. Most employers are willing to provide reasonable adjustments that help you perform your best! 🌟"
        },
        {
          id: 2,
          type: 'text',
          scenario: "🛍️ You're at the grocery store and the fluorescent lights are triggering a headache. The checkout lines are long and you're feeling overwhelmed by the sensory input.",
          question: "How would you manage this situation while still completing your shopping? 💭",
          sampleAnswers: [
            "I'd take a brief break outside to reset my nervous system, then return with a focused shopping list to minimize time inside 🌿",
            "I might ask store staff if there's a quieter checkout lane or use self-checkout to reduce social interaction 🏪",
            "I'd practice grounding techniques like deep breathing while focusing only on essential items 🧘‍♀️"
          ]
        },
        {
          id: 3,
          type: 'mcq',
          scenario: "🤝 During a team meeting, your colleague keeps interrupting you when you're trying to explain your project ideas. You feel frustrated and unheard.",
          question: "What's the best way to address this situation professionally? 💼",
          options: [
            "🗣️ Wait for a pause and say 'I'd like to finish my thought before we move on'",
            "😠 Interrupt them back to show how it feels",
            "😶 Stay quiet and bring it up with your manager later",
            "📱 Send them a text during the meeting asking them to stop"
          ],
          correct: 0,
          explanation: "Clear, direct communication in the moment is most effective. This approach is assertive but respectful, and helps establish healthy communication boundaries! 💪"
        },
        {
          id: 4,
          type: 'text',
          scenario: "🎉 You've been invited to a birthday party, but you know it will be very loud with lots of people you don't know. You want to celebrate your friend but also need to manage your social energy.",
          question: "How would you approach this social situation to balance friendship and self-care? 🤗",
          sampleAnswers: [
            "I'd tell my friend I'm excited to celebrate but might need to step outside for breaks, and ask if there's a quieter space available 🌱",
            "I could offer to help with setup early when it's less crowded, then leave before peak party time 🕐",
            "I might suggest meeting my friend for a quieter celebration separately, while still making a brief appearance at the main party 🎈"
          ]
        },
        {
          id: 5,
          type: 'mcq',
          scenario: "💼 Your new manager has a very different communication style - they prefer quick verbal updates while you work better with written instructions and time to process information.",
          question: "How can you bridge this communication gap effectively? 🌉",
          options: [
            "📝 Explain your communication preferences and suggest a hybrid approach that works for both of you",
            "😬 Try to adapt completely to their style even if it's challenging",
            "🤐 Don't say anything and hope you can figure it out",
            "📧 Only communicate through email regardless of their preferences"
          ],
          correct: 0,
          explanation: "Open communication about work style differences often leads to better solutions for everyone! Most managers appreciate when team members are proactive about optimizing their work relationship. 🤝"
        }
      ];
      setQuestions(fallbackQuestions);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowAnimation(true);
    setAnimationType('selection');
    setTimeout(() => setShowAnimation(false), 600);
  };

  const handleTextChange = (e) => {
    setTextAnswer(e.target.value);
  };

  const submitAnswer = () => {
    const currentQ = questions[currentQuestion];
    let isCorrect = false;
    let userAnswer = '';

    if (currentQ.type === 'mcq') {
      isCorrect = selectedAnswer === currentQ.correct;
      userAnswer = currentQ.options[selectedAnswer];
    } else {
      isCorrect = textAnswer.trim().length > 0;
      userAnswer = textAnswer;
    }

    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, { 
      question: currentQuestion, 
      answer: userAnswer, 
      correct: isCorrect 
    }]);

    setShowAnimation(true);
    setAnimationType(isCorrect ? 'success' : 'try-again');
    
    setTimeout(() => {
      setShowResult(true);
      setShowAnimation(false);
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setTextAnswer('');
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setTextAnswer('');
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setShowAnimation(false);
    setAnimationType('');
    generateQuestions(); // Generate new questions
  };

  const currentQ = questions[currentQuestion] || {};
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // Loading Screen
  if (isLoading || (isGenerating && questions.length === 0)) {
    return (
      <div className="h-screen bg-[#6488e9] p-4 flex items-center justify-center overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-8 w-[600px] h-[400px] border-4 border-white/20 text-center">
          <div className="text-6xl mb-6 animate-bounce">🧠</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Life Skills Challenge</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-slate-600">Creating personalized scenarios...</p>
          </div>
          <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-full p-4 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">✨ Generating questions✨</p>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="h-screen bg-[#6488e9] p-4 flex items-center justify-center overflow-hidden">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-6 text-center border-4 border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <div className="text-4xl mb-3 animate-bounce">🎉</div>
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-spin" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">🌟 Fantastic Work! 🌟</h2>
              <p className="text-slate-600">You completed the Life Skills Quiz! 🎊</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-emerald-200 rounded-2xl p-4 mb-4 border border-green-300">
              <p className="text-xl font-bold text-green-800 mb-2">
                🏆 Your Score: {score}/{questions.length} 🏆
              </p>
              <p className="text-green-700">
                {score === questions.length ? "🎯 Perfect! You handled all scenarios excellently! 🎯" :
                 score >= questions.length * 0.7 ? "👏 Well done! You showed great problem-solving skills! 👏" :
                 "💪 Good effort! Every scenario teaches us something valuable! 💪"}
              </p>
            </div>

            <div className="text-left bg-gradient-to-r from-blue-100 to-cyan-200 rounded-2xl p-4 mb-4 border border-blue-300">
              <h3 className="font-bold text-slate-800 mb-3 text-center">🎓 Key Takeaways 🎓</h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-lg">🗣️</span>
                  <span>Self-advocacy is a valuable skill</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <span>It's okay to ask for accommodations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <span>Clear communication helps everyone</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">❤️</span>
                  <span>Taking care of your needs benefits relationships</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                🔄 Generate New Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#6488e9] p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Animated Success Overlay */}
        {showAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`transform transition-all duration-1000 ${
              animationType === 'success' ? 'animate-bounce' : 
              animationType === 'try-again' ? 'animate-pulse' : 
              'animate-ping'
            }`}>
              {animationType === 'success' && (
                <div className="bg-green-500 text-white p-6 rounded-full shadow-2xl border-4 border-white">
                  <div className="text-3xl">🎉</div>
                </div>
              )}
              {animationType === 'try-again' && (
                <div className="bg-orange-500 text-white p-6 rounded-full shadow-2xl border-4 border-white">
                  <div className="text-lg font-bold">💪 Good Try! 💪</div>
                </div>
              )}
              {animationType === 'selection' && (
                <div className="bg-purple-500 text-white p-4 rounded-full shadow-2xl border-4 border-white">
                  <div className="text-2xl">✨</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🧠</div>
         <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
  Life Skills Challenge
</h1>
<p className="text-white text-xl font-medium tracking-wide animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
  🌟 Navigate real-world scenarios with confidence 🌟
</p>


        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 mb-4 shadow-inner border border-white/30">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            <span className="text-white font-bold text-xs">🚀</span>
          </div>
        </div>

        {/* Question Card - Flexible height */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-4 border-4 border-white/20 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 px-3 py-1 rounded-full font-semibold border border-purple-300 shadow-lg text-sm">
              📝 Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 px-3 py-1 rounded-full font-semibold border border-green-300 shadow-lg text-sm">
              🏆 Score: {score}
            </span>
          </div>

          {/* Scenario */}
          <div className="bg-gradient-to-r from-blue-100 to-cyan-200 rounded-2xl p-4 mb-4 border border-blue-300 shadow-inner">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
              <span className="text-lg">🎭</span>
              Scenario:
            </h3>
            <p className="text-blue-700 leading-relaxed text-sm">{currentQ.scenario}</p>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-200 rounded-2xl p-4 mb-4 border border-yellow-300">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              {currentQ.question}
            </h3>
          </div>

          {/* Answer Options */}
          {currentQ.type === 'mcq' ? (
            <div className="space-y-3 mb-4">
              {currentQ.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-102 text-sm ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 to-purple-200 text-indigo-800 shadow-xl scale-102'
                      : 'border-slate-300 hover:border-indigo-400 bg-gradient-to-r from-slate-50 to-gray-100 hover:shadow-lg'
                  }`}
                  disabled={showResult}
                >
                  <span className="font-bold mr-2 text-indigo-600">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <div className="relative">
                <textarea
                  value={textAnswer}
                  onChange={handleTextChange}
                  placeholder="✨ Type your response here... Think about how you would communicate clearly and respectfully. 💭"
                  className="w-full p-3 border-2 border-slate-300 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none h-24 pr-12 bg-white focus:bg-indigo-50 transition-all duration-300 shadow-inner text-sm"
                  disabled={showResult}
                />
                {speechSupported && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={showResult}
                      className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg border-2 ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-300' 
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-400 border-indigo-300'
                      }`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
              
              {speechSupported && (
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-100 p-2 rounded-xl border border-blue-200">
                  <span className="text-base">🎤</span>
                  <span>
                    {isListening 
                      ? '🔴 Listening... Speak your answer!' 
                      : '💡 Click the mic to speak your answer!'}
                  </span>
                </div>
              )}
              
              {currentQ.sampleAnswers && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2">
                    <span className="text-base">💡</span>
                    Need inspiration? Click for sample approaches ✨
                  </summary>
                  <div className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-2xl border border-yellow-300">
                    <p className="text-xs text-yellow-800 mb-2 font-semibold flex items-center gap-2">
                      <span className="text-sm">📝</span>
                      Sample responses:
                    </p>
                    {currentQ.sampleAnswers.map((sample, index) => (
                      <p key={index} className="text-yellow-700 text-xs mb-1 flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>{sample}</span>
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!showResult && (
            <button
              onClick={submitAnswer}
              disabled={currentQ.type === 'mcq' ? selectedAnswer === '' : textAnswer.trim() === ''}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-sm flex items-center gap-2"
            >
              <span className="text-base">🚀</span>
              Submit Answer
            </button>
          )}

          {/* Result Display */}
          {showResult && (
            <div className={`mt-4 p-4 rounded-2xl border-2 transition-all duration-500 transform ${
              currentQ.type === 'mcq' && selectedAnswer === currentQ.correct 
                ? 'border-green-400 bg-gradient-to-r from-green-100 to-emerald-200' 
                : currentQ.type === 'text' 
                ? 'border-green-400 bg-gradient-to-r from-green-100 to-emerald-200'
                : 'border-orange-400 bg-gradient-to-r from-orange-100 to-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {currentQ.type === 'mcq' ? (
                  selectedAnswer === currentQ.correct ? (
                    <>
                      <div className="text-2xl animate-bounce">🎉</div>
                      <span className="font-bold text-green-800 text-base">🌟 Excellent choice! 🌟</span>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl animate-pulse">💪</div>
                      <span className="font-bold text-orange-800 text-base">✨ Good effort! ✨</span>
                    </>
                  )
                ) : (
                  <>
                    <div className="text-2xl animate-bounce">🎊</div>
                    <span className="font-bold text-green-800 text-base">🌈 Thoughtful response! 🌈</span>
                  </>
                )}
              </div>
              
              {currentQ.explanation && (
                <div className={`mb-3 p-3 rounded-xl border-2 ${
                  currentQ.type === 'mcq' && selectedAnswer === currentQ.correct 
                    ? 'text-green-700 bg-green-50 border-green-200' 
                    : currentQ.type === 'text' 
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-orange-700 bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🧠</span>
                    <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
                  </div>
                </div>
              )}

              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg text-sm"
              >
                <span className="text-base">
                  {currentQuestion < questions.length - 1 ? '➡️' : '🏁'}
                </span>
                {currentQuestion < questions.length - 1 ? 'Next Challenge' : 'See Results'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeSkillsQuiz;