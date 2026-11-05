import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MarketplaceProvider } from './app/MarketplaceContext'
import { ToastProvider } from './app/ToastProvider'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MarketplaceProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MarketplaceProvider>
    </BrowserRouter>
  </React.StrictMode>
)
