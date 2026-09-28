import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { HRMSProvider } from './context/HRMSContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <HRMSProvider>
          <App />
        </HRMSProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
)
