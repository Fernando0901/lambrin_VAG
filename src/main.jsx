import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { PriceProvider } from './context/PriceContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PriceProvider>
      <App />
    </PriceProvider>
  </React.StrictMode>,
)
