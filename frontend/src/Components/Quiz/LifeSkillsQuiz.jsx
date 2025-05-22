import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Star, Mic, MicOff } from 'lucide-react';

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
  const recognitionRef = useRef(null);

  const questions = [
    {
      id: 1,
      type: 'mcq',
      scenario: "You're at a grocery store and realize you forgot your shopping list at home. The store is crowded and noisy, which makes you feel overwhelmed.",
      question: "What's the best strategy to handle this situation?",
      options: [
        "Leave immediately and come back another day",
        "Take a few deep breaths, find a quiet corner, and try to remember what you need",
        "Ask a store employee to help you remember your list",
        "Buy everything you think you might need"
      ],
      correct: 1,
      explanation: "Taking a moment to calm yourself and trying to remember in a quieter space is a practical approach that helps manage sensory overload while still accomplishing your goal."
    },
    {
      id: 2,
      type: 'text',
      scenario: "Your friend invited you to a party, but you're feeling anxious about the social interaction and loud environment. You want to maintain the friendship but also take care of your needs.",
      question: "What would you say to your friend to communicate your concerns while showing you care about the relationship?",
      sampleAnswers: [
        "I'd love to celebrate with you, but large parties can be overwhelming for me. Could we maybe hang out one-on-one before or after?",
        "Thanks for inviting me! I might need to leave early if I get overwhelmed, but I'd like to try coming for a bit.",
        "I really appreciate the invitation. Could I bring a friend for support, or is there a quieter space where we could chat?"
      ]
    },
    {
      id: 3,
      type: 'mcq',
      scenario: "You're in a job interview and the interviewer asks you about your 'weaknesses.' You want to be honest about your neurodivergent traits without jeopardizing your chances.",
      question: "Which response would be most appropriate?",
      options: [
        "I don't really have any significant weaknesses",
        "I sometimes need extra time to process information, but I always deliver quality work",
        "I have ADHD which makes me terrible at focusing",
        "I prefer not to discuss personal challenges"
      ],
      correct: 1,
      explanation: "This response reframes a challenge as something manageable while highlighting a positive outcome (quality work). It's honest without being self-deprecating."
    },
    {
      id: 4,
      type: 'mcq',
      scenario: "You're working on a group project and your teammates want to meet in a noisy café. You know you won't be able to concentrate or contribute effectively in that environment.",
      question: "How should you handle this situation?",
      options: [
        "Go along with it and try your best to participate",
        "Suggest an alternative location that works better for focused discussion",
        "Skip the meeting and work on your part alone",
        "Tell them you can't work in noisy environments because of your neurodivergence"
      ],
      correct: 1,
      explanation: "Suggesting an alternative shows initiative and problem-solving while ensuring everyone can contribute effectively. You don't need to disclose personal information to advocate for a better working environment."
    },
    {
      id: 5,
      type: 'text',
      scenario: "Your manager has given you feedback that you seem 'disengaged' in meetings because you don't make much eye contact and fidget with a stress ball. You want to explain your needs professionally.",
      question: "How would you explain to your manager that these behaviors actually help you focus and engage better?",
      sampleAnswers: [
        "I appreciate the feedback. I actually focus better when I can use fidget tools and may not always make direct eye contact, but I am fully engaged and listening carefully.",
        "Thank you for bringing this up. My fidgeting and reduced eye contact are actually strategies that help me concentrate better during meetings. I'm very engaged with the content.",
        "I understand how it might appear. These are focusing strategies that work for me - I retain information better this way and am actively participating in the discussion."
      ]
    },
    {
      id: 6,
      type: 'mcq',
      scenario: "You're at a family gathering and a relative makes a comment about you being 'antisocial' because you've stepped outside for some quiet time after feeling overwhelmed by the noise and conversations.",
      question: "What's the best way to respond?",
      options: [
        "Ignore the comment and stay outside longer",
        "Get defensive and explain all your challenges",
        "Calmly explain that you needed a short break and you're looking forward to rejoining everyone",
        "Leave the gathering entirely"
      ],
      correct: 2,
      explanation: "A calm, brief explanation normalizes taking breaks for self-care while showing you want to participate. It's educational without being defensive."
    },
    {
      id: 7,
      type: 'text',
      scenario: "You're starting a new job and want to set yourself up for success. You know you work best with clear instructions, regular check-ins, and a organized workspace.",
      question: "What would you say to your new supervisor to communicate your working style preferences?",
      sampleAnswers: [
        "I work best with clear, written instructions and regular check-ins to make sure I'm on track. Could we set up brief weekly meetings?",
        "I'm very detail-oriented and produce my best work when I have clear expectations and a structured approach. What's the best way to get clarification when I need it?",
        "I'd love to discuss what working style helps me be most productive. I do great work when I have clear guidelines and regular feedback."
      ]
    },
    {
      id: 8,
      type: 'mcq',
      scenario: "You're in a restaurant and the server brings you the wrong order. The food they brought contains ingredients you can't eat due to sensory sensitivities, but you don't want to cause a scene.",
      question: "What's the most effective approach?",
      options: [
        "Eat what you can and leave the rest",
        "Politely explain to the server that this isn't what you ordered and ask for the correct dish",
        "Ask to speak to the manager immediately",
        "Leave without saying anything"
      ],
      correct: 1,
      explanation: "Politely addressing the mistake directly with the server is appropriate and gives them a chance to fix it. Most restaurant staff want to ensure you have a good experience."
    }
  ];

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
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
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
    // Animate the selection
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
      // For text questions, we'll consider any non-empty answer as valid
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

    // Trigger success animation
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
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameComplete) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: '#6488e9' }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-100 rounded-2xl shadow-xl p-8 text-center transform transition-all duration-1000 animate-pulse">
            <div className="mb-6">
              <Star className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Fantastic Work!</h2>
              <p className="text-lg text-slate-600">You completed the Life Skills Quiz!</p>
            </div>
            
            <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
              <p className="text-2xl font-bold text-emerald-800 mb-2">
                Your Score: {score}/{questions.length}
              </p>
              <p className="text-emerald-700">
                {score === questions.length ? "Perfect! You handled all scenarios excellently!" :
                 score >= questions.length * 0.7 ? "Well done! You showed great problem-solving skills!" :
                 "Good effort! Every scenario teaches us something valuable."}
              </p>
            </div>

            <div className="text-left bg-slate-50 rounded-xl p-6 mb-6 border-2 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Key Takeaways:</h3>
              <ul className="space-y-2 text-slate-700">
                <li>• Self-advocacy is a valuable skill</li>
                <li>• It's okay to ask for accommodations</li>
                <li>• Clear communication helps everyone</li>
                <li>• Taking care of your needs benefits your relationships and work</li>
              </ul>
            </div>

            <button
              onClick={resetQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#6488e9' }}>
      <div className="max-w-3xl mx-auto">
        {/* Animated Success Overlay */}
        {showAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`transform transition-all duration-1000 ${
              animationType === 'success' ? 'animate-bounce' : 
              animationType === 'try-again' ? 'animate-pulse' : 
              'animate-ping'
            }`}>
              {animationType === 'success' && (
                <div className="bg-emerald-500 text-white p-8 rounded-full shadow-2xl">
                  <CheckCircle className="w-16 h-16" />
                </div>
              )}
              {animationType === 'try-again' && (
                <div className="bg-amber-500 text-white p-8 rounded-full shadow-2xl">
                  <span className="text-2xl font-bold">Good Try!</span>
                </div>
              )}
              {animationType === 'selection' && (
                <div className="bg-indigo-500 text-white p-6 rounded-full shadow-2xl">
                  <CheckCircle className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg mt-7">Life Skills Challenge</h1>
          <p className="text-blue-100 text-lg">Navigate real-world scenarios with confidence</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-blue-200 rounded-full h-4 mb-8 shadow-inner">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-100 rounded-2xl shadow-xl p-8 mb-6 border-2 border-slate-200 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-indigo-200 text-indigo-800 px-4 py-2 rounded-full font-semibold border border-indigo-300">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="bg-emerald-200 text-emerald-800 px-4 py-2 rounded-full font-semibold border border-emerald-300">
              Score: {score}
            </span>
          </div>

          {/* Scenario */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">Scenario:</h3>
            <p className="text-blue-700 leading-relaxed">{currentQ.scenario}</p>
          </div>

          {/* Question */}
          <h3 className="text-xl font-bold text-slate-800 mb-6">{currentQ.question}</h3>

          {/* Answer Options */}
          {currentQ.type === 'mcq' ? (
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-lg scale-102'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-25 bg-slate-50 hover:shadow-md'
                  }`}
                  disabled={showResult}
                >
                  <span className="font-semibold mr-3 text-indigo-600">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <div className="relative">
                <textarea
                  value={textAnswer}
                  onChange={handleTextChange}
                  placeholder="Type your response here... Think about how you would communicate clearly and respectfully."
                  className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none resize-none h-32 pr-16 bg-slate-50 focus:bg-white transition-all duration-300 shadow-inner"
                  disabled={showResult}
                />
                {speechSupported && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={showResult}
                      className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-slate-400'
                      }`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
              
              {speechSupported && (
                <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>
                    {isListening 
                      ? 'Listening... Speak your answer and click the mic button when done.' 
                      : 'Click the mic button to speak your answer instead of typing.'
                    }
                  </span>
                </div>
              )}
              
              {!speechSupported && (
                <div className="mt-2 text-sm text-slate-500">
                  Voice input is not supported in this browser. You can type your response above.
                </div>
              )}
              
              {currentQ.sampleAnswers && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-semibold">
                    💡 Need inspiration? Click for sample approaches
                  </summary>
                  <div className="mt-3 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                    <p className="text-sm text-amber-800 mb-2 font-semibold">Sample responses:</p>
                    {currentQ.sampleAnswers.map((sample, index) => (
                      <p key={index} className="text-amber-700 text-sm mb-2">• {sample}</p>
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
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              Submit Answer
            </button>
          )}

          {/* Result Display */}
          {showResult && (
            <div className={`mt-6 p-6 rounded-xl border-2 transition-all duration-500 transform ${
              currentQ.type === 'mcq' && selectedAnswer === currentQ.correct 
                ? 'border-emerald-300 bg-emerald-50' 
                : currentQ.type === 'text' 
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-amber-300 bg-amber-50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {currentQ.type === 'mcq' ? (
                  selectedAnswer === currentQ.correct ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-600 animate-bounce" />
                      <span className="font-bold text-emerald-800">Excellent choice!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-amber-600 animate-pulse" />
                      <span className="font-bold text-amber-800">Good effort!</span>
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 animate-bounce" />
                    <span className="font-bold text-emerald-800">Thoughtful response!</span>
                  </>
                )}
              </div>
              
              {currentQ.explanation && (
                <p className={`mb-4 ${
                  currentQ.type === 'mcq' && selectedAnswer === currentQ.correct 
                    ? 'text-emerald-700' 
                    : currentQ.type === 'text' 
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}>
                  {currentQ.explanation}
                </p>
              )}

              <button
                onClick={nextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                {currentQuestion < questions.length - 1 ? 'Next Challenge' : 'See Results'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeSkillsQuiz;