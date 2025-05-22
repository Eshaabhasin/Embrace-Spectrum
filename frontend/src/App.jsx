import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUser, ClerkProvider } from '@clerk/clerk-react';
import Home from './Components/Home/Home';
import Chatbot from './Components/Chatbot/Chatbot';
import SentimentAnalyser from './Components/SentimentAnalysis/SentimentAnalyser';
import GeminiLive from './Components/GeminiLive/GeminiLive';
import JobSearchComponent from './Components/JobSearch/JobSearch'
import JournalBoard from './Components/JournalBoard/JournalBoard';
import PaintAndStory from './Components/StoryGenerator/StoryGeneratorComponent';
import OnboardingForm from './Components/OnboardingForm/OnboardingForm';
import LifeSkillsTracker from './Components/LifeSkillTracker/LifeSkillTracker';
import LearnPath from './Components/LearningPath/AllLearnpath';
import LifeSkillsQuiz from './Components/Quiz/LifeSkillsQuiz';
import './App.css';

// Auth wrapper component to handle redirect to onboarding
const AuthWrapper = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const location = useLocation();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check onboarding status once Clerk is loaded and user is signed in
    if (isLoaded) {
      if (isSignedIn && user) {
        // Check if user has completed onboarding
        const onboardingCompleted = localStorage.getItem(`onboarding-${user.id}`);
        setHasCompletedOnboarding(!!onboardingCompleted);
      }
      setIsChecking(false);
    }
  }, [isLoaded, isSignedIn, user]);

  // Listen for changes to localStorage (when form is submitted)
  useEffect(() => {
    const handleStorageChange = () => {
      if (isSignedIn && user) {
        const onboardingCompleted = localStorage.getItem(`onboarding-${user.id}`);
        setHasCompletedOnboarding(!!onboardingCompleted);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (as a backup)
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

  // Don't render anything while we're checking auth state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is signed in but hasn't completed onboarding, and isn't already on the onboarding page
  if (isSignedIn && !hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // If on onboarding page but already completed or not signed in
  if (location.pathname === "/onboarding") {
    if (!isSignedIn) {
      return <Navigate to="/" replace />;
    }
    if (hasCompletedOnboarding) {
      return <Navigate to="/" replace />;
    }
  }

  // For protected routes, redirect if not signed in or onboarding not completed
  const protectedRoutes = ['/chatbot', '/sketchTales', '/feelReader', '/geminiLive', '/journalboard', '/jobs' , '/quiz'];
  if (protectedRoutes.includes(location.pathname)) {
    if (!isSignedIn) {
      return <Navigate to="/" replace />;
    }
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return null;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <>
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
              <Route path="/quiz" element={<LifeSkillsQuiz/>} />
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;