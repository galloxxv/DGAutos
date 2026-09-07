import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './finishing.css'
import './finance.css'
import './booking.css'
import './paint-focus.css'
import './portal.css'
import App from './App.tsx'
import ApprovalPortal from './ApprovalPortal.tsx'

const token = new URLSearchParams(window.location.search).get('estimate')
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || 'https://qrxyyguimdppdbvwtnuk.supabase.co').trim()
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz').trim()

// Preserve the existing SMS estimate-request experience while also recording every
// website inquiry in the DG Autos OS. keepalive lets this finish if the SMS app opens.
document.addEventListener('submit', (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement) || !form.classList.contains('estimate-form')) return
  const data = new FormData(form)
  const customerName = String(data.get('name') || '').trim()
  const phone = String(data.get('phone') || '').trim()
  const vehicle = String(data.get('vehicle') || '').trim()
  const inquiry = String(data.get('repair') || '').trim()
  if (!customerName || !phone || !vehicle || !inquiry) return
  void fetch(`${supabaseUrl}/rest/v1/rpc/website_submit_inquiry`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    body: JSON.stringify({ p_customer_name: customerName, p_phone: phone, p_email: '', p_vehicle: vehicle, p_inquiry: inquiry }),
  }).catch((error) => console.error('Could not save website inquiry to DG Autos OS.', error))
}, true)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {token ? <ApprovalPortal token={token} /> : <App />}
  </StrictMode>,
)
