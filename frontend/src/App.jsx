import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

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
import { ReactProvider } from './Components/Providers';

import './App.css';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
  return (
    <ReactProvider>
      <Router>
        <AuthWrapper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<OnboardingForm />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/sketchTales" element={<PaintAndStory />} />
          <Route path="/feelReader" element={<SentimentAnalyser />} />
          <Route path="/geminiLive" element={<GeminiLive />} />
          <Route path="/journalboard" element={<JournalBoard />} />
          <Route path="/jobs" element={<JobSearchComponent />} />
          <Route path="/tracker" element={<LifeSkillsTracker />} />
          <Route path="/learn" element={<LearnPath />} />
          <Route path="/quiz" element={<LifeSkillsQuiz />} />
          <Route path="/SpeechCoach" element={<SpeechCoach />} />
      
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ReactProvider>
  );
}

export default App;