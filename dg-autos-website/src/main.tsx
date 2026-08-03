import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './finishing.css'
import './finance.css'
import './portal.css'
import App from './App.tsx'
import ApprovalPortal from './ApprovalPortal.tsx'

const token = new URLSearchParams(window.location.search).get('estimate')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {token ? <ApprovalPortal token={token} /> : <App />}
  </StrictMode>,
)
