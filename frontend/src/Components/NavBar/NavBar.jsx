import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import CalmModeToggle from '../CalmMode/CalmModeToggle';
import AudioDescriptionToggle from '../AudioDescription/AudioDescriptionToggle';
import { useCalmMode } from '../Providers/CalmModeContext';
import { useAudioDescription } from '../AudioDescription/AudioDescriptionContext';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const { isSignedIn } = useUser();
  const { isCalmMode } = useCalmMode();
  const { isAudioDescriptionEnabled, speakText } = useAudioDescription();
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  
  const showTooltip = (tooltip) => {
    setActiveTooltip(tooltip);
  };
  
  const hideTooltip = () => {
    setActiveTooltip(null);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-[97vw] ml-4 rounded-[1.3vw] fixed top-5 z-[999] backdrop-blur-lg bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] shadow-lg">
      <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/Embrace Spectrum White.png" className="h-10" alt="Embrace Spectrum Logo" />
        </a>

        {/* Mobile Menu Controls - Only visible on small screens */}
        <div className="hidden items-center">
          <div className="mr-2">
            <CalmModeToggle />
          </div>
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg"
            aria-controls="navbar-menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        {/* Desktop Menu + Auth Button - Only visible on medium screens and up */}
        <div className="hidden md:flex md:items-center md:space-x-6" ref={dropdownRef}>
          <ul className="flex space-x-6 font-bold lg:text-lg text-base text-white items-center">
            <li className="relative">
              <div 
                onMouseEnter={() => showTooltip('home')}
                onMouseLeave={hideTooltip}
              >
                <Link 
                  to="/" 
                  className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Home page")}
                >Home</Link>
                {activeTooltip === 'home' && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                    <div className="relative">
                      <p>Welcome to Embrace Spectrum's homepage</p>
                      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -top-1.5"></div>
                    </div>
                  </div>
                )}
              </div>
            </li>
            
            {/* MindSpace Dropdown */}
            <li className="relative">
              <div 
                onMouseEnter={() => showTooltip('mindspace')}
                onMouseLeave={hideTooltip}
              >
                <button 
                  onClick={() => toggleDropdown('mindspace')} 
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("MindSpace menu for mental wellness tools")}
                  className={`flex items-center ${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}
                  aria-label="MindSpace menu for mental wellness tools"
                >
                  MindSpace
                  <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'mindspace' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {activeTooltip === 'mindspace' && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                    <div className="relative">
                      <p>Tools for mental wellness and communication</p>
                      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -top-1.5"></div>
                    </div>
                  </div>
                )}
              </div>
              {activeDropdown === 'mindspace' && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out origin-top-left">
                  <div className="py-1 animate-fadeIn">
                    <div className="relative" onMouseEnter={() => showTooltip('solace')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/ChatBot" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Solace AI chatbot for emotional support")}
                      >Solace</Link>
                      {activeTooltip === 'solace' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>AI chatbot for emotional support</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('talkcoach')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/Geminilive" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Talk Coach for practicing conversations")}
                      >Talk Coach</Link>
                      {activeTooltip === 'talkcoach' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Practice conversations and social skills</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('speechcoach')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/SpeechCoach" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Speech Coach for improving speech clarity")}
                      >Speech Coach</Link>
                      {activeTooltip === 'speechcoach' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Improve speech clarity and expression</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
            
            {/* InsightHub Dropdown */}
            <li className="relative">
              <div 
                onMouseEnter={() => showTooltip('insighthub')}
                onMouseLeave={hideTooltip}
              >
                <button 
                  onClick={() => toggleDropdown('insighthub')} 
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("InsightHub menu for emotional tracking tools")}
                  className={`flex items-center ${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}
                  aria-label="InsightHub menu for emotional tracking tools"
                >
                  InsightHub
                  <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'insighthub' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {activeTooltip === 'insighthub' && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                    <div className="relative">
                      <p>Track and analyze your emotional journey</p>
                      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -top-1.5"></div>
                    </div>
                  </div>
                )}
              </div>
              {activeDropdown === 'insighthub' && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out origin-top-left">
                  <div className="py-1 animate-fadeIn">
                    <div className="relative" onMouseEnter={() => showTooltip('journal')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/Journalboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Journal for documenting thoughts and feelings")}
                      >Journal</Link>
                      {activeTooltip === 'journal' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Document your thoughts and feelings</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('tracker')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/Tracker" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Tracker for monitoring emotional patterns")}
                      >Tracker</Link>
                      {activeTooltip === 'tracker' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Monitor your emotional patterns over time</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('learningpaths')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/learn" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Learning Paths for personalized skill development")}
                      >Growth Journey</Link>
                      {activeTooltip === 'learningpaths' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Personalized paths for skill development</p>
                        </div>
                      )}
                    </div>                    
                    <div className="relative" onMouseEnter={() => showTooltip('feelreader')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/FeelReader" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Feel Reader for analyzing emotions in text")}
                      >Feel Reader</Link>
                      {activeTooltip === 'feelreader' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Analyze and understand your emotions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
            
            {/* Playground Dropdown */}
            <li className="relative">
              <div 
                onMouseEnter={() => showTooltip('playground')}
                onMouseLeave={hideTooltip}
              >
                <button 
                  onClick={() => toggleDropdown('playground')} 
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Playground menu for creative activities")}
                  className={`flex items-center ${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}
                  aria-label="Playground menu for creative activities"
                >
                  Playground
                  <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'playground' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {activeTooltip === 'playground' && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                    <div className="relative">
                      <p>Fun activities to boost creativity and learning</p>
                      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -top-1.5"></div>
                    </div>
                  </div>
                )}
              </div>
              {activeDropdown === 'playground' && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out origin-top-left">
                  <div className="py-1 animate-fadeIn">
                    <div className="relative" onMouseEnter={() => showTooltip('sketchtales')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/SketchTales" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Sketch Tales for creating stories through drawing")}
                      >Sketch Tales</Link>
                      {activeTooltip === 'sketchtales' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Create stories through drawing</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('games')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/Games" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Interactive games for all abilities")}
                      >Games</Link>
                      {activeTooltip === 'games' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Fun interactive games for all abilities</p>
                        </div>
                      )}
                    </div>
                    <div className="relative" onMouseEnter={() => showTooltip('quiz')} onMouseLeave={hideTooltip}>
                      <Link 
                        to="/Quiz" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onMouseEnter={() => isAudioDescriptionEnabled && speakText("Quiz to test your knowledge")}
                      >Quiz</Link>
                      {activeTooltip === 'quiz' && (
                        <div className="absolute left-full ml-2 top-0 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                          <p>Test your knowledge in a fun way</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
            
            {/* LifeForge Link */}
            <li className="relative">
              <div 
                onMouseEnter={() => showTooltip('lifeforge')}
                onMouseLeave={hideTooltip}
              >
                <Link 
                  to="/jobs" 
                  className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Jobs and employment opportunities")}
                >Jobs</Link>
                {activeTooltip === 'lifeforge' && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 animate-fadeIn z-50">
                    <div className="relative">
                      <p>Find inclusive job opportunities and community resources</p>
                      <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -top-1.5"></div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          </ul>
          <div className="flex items-center space-x-3">
            <CalmModeToggle />
            <AudioDescriptionToggle />
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button 
                  className={`ml-4 bg-blue-600 ${isCalmMode ? '' : 'hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-lg transition`}
                  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Sign in to your account")}
                >
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <div onMouseEnter={() => isAudioDescriptionEnabled && speakText("Access your user profile")}>
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col space-y-4 font-bold text-white text-lg">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            
            {/* MindSpace Mobile Dropdown */}
            <li>
              <button 
                onClick={() => toggleDropdown('mobile-mindspace')} 
                className="flex items-center justify-between w-full"
              >
                MindSpace
                <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'mobile-mindspace' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {activeDropdown === 'mobile-mindspace' && (
                <div className="mt-2 pl-4 border-l border-gray-300 animate-fadeIn">
                  <ul className="space-y-2">
                    <li><Link to="/ChatBot" onClick={() => setIsMenuOpen(false)}>Solace</Link></li>
                    <li><Link to="/Geminilive" onClick={() => setIsMenuOpen(false)}>Talk Coach</Link></li>
                    <li><Link to="/SpeechCoach" onClick={() => setIsMenuOpen(false)}>Speech Coach</Link></li>
                  </ul>
                </div>
              )}
            </li>
            
            {/* InsightHub Mobile Dropdown */}
            <li>
              <button 
                onClick={() => toggleDropdown('mobile-insighthub')} 
                className="flex items-center justify-between w-full"
              >
                InsightHub
                <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'mobile-insighthub' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {activeDropdown === 'mobile-insighthub' && (
                <div className="mt-2 pl-4 border-l border-gray-300 animate-fadeIn">
                  <ul className="space-y-2">
                    <li><Link to="/Journalboard" onClick={() => setIsMenuOpen(false)}>Journal</Link></li>
                    <li><Link to="/Tracker" onClick={() => setIsMenuOpen(false)}>Tracker</Link></li>
                    <li><Link to="/FeelReader" onClick={() => setIsMenuOpen(false)}>Feel Reader</Link></li>
                  </ul>
                </div>
              )}
            </li>
            
            {/* Playground Mobile Dropdown */}
            <li>
              <button 
                onClick={() => toggleDropdown('mobile-playground')} 
                className="flex items-center justify-between w-full"
              >
                Playground
                <svg className={`w-4 h-4 ml-1 transition-transform ${activeDropdown === 'mobile-playground' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {activeDropdown === 'mobile-playground' && (
                <div className="mt-2 pl-4 border-l border-gray-300 animate-fadeIn">
                  <ul className="space-y-2">
                    <li><Link to="/SketchTales" onClick={() => setIsMenuOpen(false)}>Sketch Tales</Link></li>
                    <li><Link to="/Games" onClick={() => setIsMenuOpen(false)}>Games</Link></li>
                    <li><Link to="/Quiz" onClick={() => setIsMenuOpen(false)}>Quiz</Link></li>
                  </ul>
                </div>
              )}
            </li>
            
            {/* LifeForge Link */}
            <li><Link to="/jobs" onClick={() => setIsMenuOpen(false)}>LifeForge</Link></li>
            
            <li>
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition">
                    Sign In
                  </button>
                </SignInButton>
              ) : (
                <div className="mt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavBar;