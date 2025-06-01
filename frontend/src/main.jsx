// Import React first to ensure we can modify it
import React from 'react';
// Import our fixes before anything else
import './reactShim.js';
import { ensureReactChildren } from './reactFix.js';

// Apply the fix immediately
ensureReactChildren();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Double-check React.Children is defined before rendering
if (!React.Children) {
  console.warn('React.Children is still undefined after fixes. Applying emergency fix.');
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>
);