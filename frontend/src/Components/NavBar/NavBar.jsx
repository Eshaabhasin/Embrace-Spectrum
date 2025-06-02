import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import CalmModeToggle from '../CalmMode/CalmModeToggle';
import { useCalmMode } from '../Providers/CalmModeContext';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { isCalmMode } = useCalmMode();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
        <div className="hidden md:flex md:items-center md:space-x-6">
          <ul className="flex space-x-6 font-bold lg:text-lg text-base text-white items-center">
            <li><Link to="/" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Home</Link></li>
            <li><Link to="/ChatBot" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Solace</Link></li>
            <li><Link to="/Geminilive" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Talk Coach</Link></li>
            <li><Link to="/FeelReader" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Feel Reader</Link></li>
            <li><Link to="/SketchTales" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Sketch Tales</Link></li>
            <li><Link to="/Journalboard" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Journal</Link></li>
            <li><Link to="/jobs" className={`${isCalmMode ? '' : 'hover:text-[#fffccf]'}`}>Job & Community Hub</Link></li>
          </ul>
          <div className="flex items-center space-x-3">
            <CalmModeToggle />
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className={`ml-4 bg-blue-600 ${isCalmMode ? '' : 'hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-lg transition`}>
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col space-y-4 font-bold text-white text-lg">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/ChatBot" onClick={() => setIsMenuOpen(false)}>Solace</Link></li>
            <li><Link to="/Geminilive" onClick={() => setIsMenuOpen(false)}>Talk Coach</Link></li>
            <li><Link to="/FeelReader" onClick={() => setIsMenuOpen(false)}>Feel Reader</Link></li>
            <li><Link to="/SketchTales" onClick={() => setIsMenuOpen(false)}>Sketch Tales</Link></li>
            <li><Link to="/Journalboard" onClick={() => setIsMenuOpen(false)}>Journal</Link></li>
            <li><Link to="/jobs" onClick={() => setIsMenuOpen(false)}>Job & Community Hub</Link></li>
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