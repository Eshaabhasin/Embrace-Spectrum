import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCalmMode } from './Components/Providers/CalmModeContext';
import withCalmMode from './Components/CalmMode/withCalmMode';
import NavBar from './Components/NavBar/NavBar';

import Home from './Components/Home/Home';
import Chatbot from './Components/Chatbot/Chatbot';
import SentimentAnalyser from './Components/SentimentAnalysis/SentimentAnalyser';
import GeminiLive from './Components/GeminiLive/GeminiLive';
import JobSearchComponent from './Components/JobSearch/JobSearch';
import JournalBoard from './Components/JournalBoard/JournalBoard';
import PaintAndStory from './Components/StoryGenerator/StoryGeneratorComponent';
import OnboardingForm from './Components/OnboardingForm/OnboardingForm';
import LifeSkillsTracker from './Components/LifeSkillTracker/LifeSkillTracker';
import LearnPath from './Components/LearningPath/AllLearnpath';
import LifeSkillsQuiz from './Components/Quiz/LifeSkillsQuiz';
import SpeechCoach from './Components/SpeechCoach/SpeechCoach';

import './App.css';

// Create wrapped components
const CalmOnboarding = withCalmMode(OnboardingForm);
const CalmChatbot = withCalmMode(Chatbot);
const CalmPaintAndStory = withCalmMode(PaintAndStory);
const CalmSentimentAnalyser = withCalmMode(SentimentAnalyser);
const CalmGeminiLive = withCalmMode(GeminiLive);
const CalmJournalBoard = withCalmMode(JournalBoard);
const CalmJobSearchComponent = withCalmMode(JobSearchComponent);
const CalmLifeSkillsTracker = withCalmMode(LifeSkillsTracker);
const CalmLearnPath = withCalmMode(LearnPath);
const CalmLifeSkillsQuiz = withCalmMode(LifeSkillsQuiz);
const CalmSpeechCoach = withCalmMode(SpeechCoach);

// Ensure React.Children exists
if (!React.Children) {
  console.warn('React.Children is undefined in App.jsx. Applying fix.');
  React.Children = {
    map: (children, fn) => Array.isArray(children) ? children.map(fn) : (children ? [fn(children)] : []),
    forEach: (children, fn) => { if (Array.isArray(children)) children.forEach(fn); else if (children) fn(children); },
    count: (children) => Array.isArray(children) ? children.length : (children ? 1 : 0),
    only: (children) => {
      if (!children) throw new Error('React.Children.only expected to receive a single React element child.');
      return Array.isArray(children) ? children[0] : children;
    },
    toArray: (children) => Array.isArray(children) ? children : (children ? [children] : [])
  };
}

const AuthWrapper = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const location = useLocation();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { isCalmMode } = useCalmMode();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        const onboardingCompleted = localStorage.getItem(`onboarding-${user.id}`);
        setHasCompletedOnboarding(!!onboardingCompleted);
      }
      setIsChecking(false);
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (isSignedIn && user) {
        const onboardingCompleted = localStorage.getItem(`onboarding-${user.id}`);
        setHasCompletedOnboarding(!!onboardingCompleted);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(() => {
      if (isSignedIn && user) {
        const onboardingCompleted = localStorage.getItem(`onboarding-${user.id}`);
        if (!!onboardingCompleted !== hasCompletedOnboarding) {
          setHasCompletedOnboarding(!!onboardingCompleted);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [isSignedIn, user, hasCompletedOnboarding]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center content-area">
        <div className={`${isCalmMode ? 'animate-none' : 'animate-spin'} rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500`}></div>
      </div>
    );
  }

  const protectedRoutes = [
    '/chatbot',
    '/sketchTales',
    '/feelReader',
    '/GeminiLive',
    '/journalboard',
    '/jobs',
    '/quiz',
  ];

  if (isSignedIn && !hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (location.pathname === '/onboarding') {
    if (!isSignedIn) return <Navigate to="/" replace />;
    if (hasCompletedOnboarding) return <Navigate to="/" replace />;
  }

  if (protectedRoutes.includes(location.pathname)) {
    if (!isSignedIn) return <Navigate to="/" replace />;
    if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;
  }

  return null;
};

function App() {
  const { isCalmMode } = useCalmMode();
  
  return (
    <div className={isCalmMode ? 'calm-mode' : ''}>
      <Router>
        <NavBar />
        <AuthWrapper />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<CalmOnboarding />} />
            <Route path="/chatbot" element={<CalmChatbot />} />
            <Route path="/sketchTales" element={<CalmPaintAndStory />} />
            <Route path="/feelReader" element={<CalmSentimentAnalyser />} />
            <Route path="/geminiLive" element={<CalmGeminiLive />} />
            <Route path="/journalboard" element={<CalmJournalBoard />} />
            <Route path="/jobs" element={<CalmJobSearchComponent />} />
            <Route path="/tracker" element={<CalmLifeSkillsTracker />} />
            <Route path="/learn" element={<CalmLearnPath />} />
            <Route path="/quiz" element={<CalmLifeSkillsQuiz />} />
            <Route path="/SpeechCoach" element={<CalmSpeechCoach />} />
        
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;