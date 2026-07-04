import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthContext from './context/authContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import axios from 'axios'

// Set global API base URL (VITE_API_URL from .env in production, else local)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
createRoot(document.getElementById('root')).render(
  <AuthContext>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthContext>,
)
