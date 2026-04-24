import React from 'react'
import { createRoot } from 'react-dom/client'
import ScenarioEngine from './ScenarioEngine.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ScenarioEngine />
  </React.StrictMode>
)
