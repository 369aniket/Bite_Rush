import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';

export const authService = import.meta.env.SERVER_URL;

const googleClientId = import.meta.env.GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={`${googleClientId}`}>
      <AppProvider>
          <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
