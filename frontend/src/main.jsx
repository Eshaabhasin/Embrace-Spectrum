import React from "react"
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { CalmModeProvider } from './Components/Providers/CalmModeContext';
import { AudioDescriptionProvider } from './Components/AudioDescription/AudioDescriptionContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <CalmModeProvider>
        <AudioDescriptionProvider>
          <App />
        </AudioDescriptionProvider>
      </CalmModeProvider>
    </ClerkProvider>
  </StrictMode>
);