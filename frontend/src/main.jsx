import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import ReactProvider from './Components/Providers/ReactProvider'
import fixReactChildrenIssue from './utils/reactFix'

// Apply fix for "Cannot set properties of undefined (setting 'Children')" error
fixReactChildrenIssue()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Wrap the entire application with our custom ReactProvider
createRoot(document.getElementById('root')).render(
  <ReactProvider>
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>
  </ReactProvider>
)