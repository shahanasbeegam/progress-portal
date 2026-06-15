import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-right" toastOptions={{
      style: { borderRadius: '10px', background: '#1E3A5F', color: '#fff', fontSize: '14px' },
      success: { iconTheme: { primary: '#0EA5B0', secondary: '#fff' } },
    }} />
  </React.StrictMode>
)
