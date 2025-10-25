import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ImageUploader } from './ImageUploader.tsx'
import { DraggableItem } from './DraggableItem.tsx'
import { CameraModal } from './CameraModal.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
