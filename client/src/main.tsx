import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import 'leaflet/dist/leaflet.css';

export const authService = import.meta.env.VITE_AUTH_SERVER_URL;
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVER_URL;
export const utilsService = import.meta.env.VITE_UTILS_SERVER_URL;

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={`${googleClientId}`}>
      <AppProvider>
          <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
