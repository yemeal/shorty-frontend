import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
/** Side effect: mutates EMOJI_CATEGORIES with e[2]/e[3] labels + RU search tokens before any direct emojiData import. */
import './shared/lib/emojiUtils'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
