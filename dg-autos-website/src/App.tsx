import { useEffect, useState, type FormEvent } from "react";

const phoneDisplay = "(832) 203-2136";
const phoneNumber = "8322032136";
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "https://qrxyyguimdppdbvwtnuk.supabase.co").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz").trim();
const financingEndpoint = `${supabaseUrl}/functions/v1/create-financing-checkout`;
const apiHeaders = { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

const services = [
  { icon: "◆", title: "Collision Repair", text: "Body repair, panel replacement, dent repair, structural correction, and professional refinishing." },
  { icon: "◈", title: "Paint & Body", text: "Color matching, panel refinishing, complete paint work, bumper repair, and cosmetic restoration." },
  { icon: "⚙", title: "Mechanical Repair", text: "Diagnostics, brakes, suspension, cooling systems, maintenance, and general mechanical repairs." },
  { icon: "✦", title: "Paint Correction", text: "Swirl removal, oxidation correction, gloss restoration, polishing, and finish protection." },
];
const appointmentServices = ["Estimate / Inspection", "Collision Repair", "Paint & Body", "Mechanical Repair", "Paint Correction", "Other"];
const process = [
  ["01", "Free estimate", "Send photos or bring the vehicle in so we can inspect the damage or concern."],
  ["02", "Clear repair plan", "We explain the recommended work, expected price, and realistic completion timeline."],
  ["03", "Professional repair", "Our team completes the repair with attention to fit, finish, safety, and quality."],
  ["04", "Final inspection", "We inspect the work with you and make sure the vehicle is ready before delivery."],
];
const highlights = ["Body, paint, and mechanical work in one shop", "Free estimates with straightforward recommendations", "Insurance and customer-pay repairs welcome", "Financing options for qualified customers", "English and Spanish service", "Locally owned Houston repair shop"];
function localDateOffset(days = 0) { const date = new Date(); date.setDate(date.getDate() + days); const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
function displaySlot(value: string) { const [hourText, minute] = value.split(":"); const hour = Number(hourText); const suffix = hour >= 12 ? "PM" : "AM"; const displayHour = hour % 12 || 12; return `${displayHour}:${minute} ${suffix}`; }

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [financingMessage, setFinancingMessage] = useState("");
  const [financingError, setFinancingError] = useState("");
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("financing");
    if (result === "success") setFinancingMessage("Payment completed successfully. DG Autos will confirm the payment with your repair estimate.");
    if (result === "cancelled") setFinancingMessage("Checkout was cancelled. No payment was completed.");
  }, []);

  useEffect(() => {
    if (!appointmentDate) { setAvailableSlots([]); return; }
    let active = true;
    async function loadSlots() {
      setLoadingSlots(true); setAppointmentError(""); setAppointmentMessage("");
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_available_appointment_slots`, { method: "POST", headers: apiHeaders, body: JSON.stringify({ p_date: appointmentDate }) });
        const result = await response.json().catch(() => []);
        if (!response.ok) throw new Error(result?.message || "Could not load appointment times.");
        if (active) setAvailableSlots((Array.isArray(result) ? result : []).map((item: { slot?: string }) => String(item.slot || "")).filter(Boolean));
      } catch (error) { if (active) setAppointmentError(error instanceof Error ? error.message : "Could not load appointment times."); }
      finally { if (active) setLoadingSlots(false); }
    }
    void loadSlots(); return () => { active = false; };
  }, [appointmentDate]);

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get("name") || "").trim(); const phone = String(data.get("phone") || "").trim(); const vehicle = String(data.get("vehicle") || "").trim(); const repair = String(data.get("repair") || "").trim();
    const body = `Hi DG Autos, my name is ${name}. My phone number is ${phone}. Vehicle: ${vehicle}. Repair needed: ${repair}`;
    window.location.href = `sms:${phoneNumber}?&body=${encodeURIComponent(body)}`; setMessage("Your phone's message app should open with the estimate request ready to send.");
  }

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAppointmentError(""); setAppointmentMessage("");
    const form = event.currentTarget; const data = new FormData(form); if (String(data.get("company") || "")) return;
    const appointmentTime = String(data.get("appointmentTime") || "");
    if (!appointmentDate || !appointmentTime) { setAppointmentError("Choose an available date and time."); return; }
    setBooking(true);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_book_appointment`, { method: "POST", headers: apiHeaders, body: JSON.stringify({
        p_customer_name: String(data.get("appointmentName") || "").trim(), p_phone: String(data.get("appointmentPhone") || "").trim(), p_email: String(data.get("appointmentEmail") || "").trim(), p_vehicle: String(data.get("appointmentVehicle") || "").trim(), p_service_type: String(data.get("appointmentService") || ""), p_appointment_date: appointmentDate, p_appointment_time: appointmentTime, p_notes: String(data.get("appointmentNotes") || "").trim(),
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not book this appointment.");
      setAppointmentMessage(`Your ${displaySlot(appointmentTime)} slot is reserved. DG Autos will contact you to confirm the appointment.`);
      form.reset(); setAppointmentDate(""); setAvailableSlots([]);
    } catch (error) { setAppointmentError(error instanceof Error ? error.message : "Could not book this appointment."); }
    finally { setBooking(false); }
  }

  async function submitFinancing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFinancingError(""); setFinancingMessage(""); const data = new FormData(event.currentTarget); const customer = String(data.get("financeName") || "").trim(); const vehicle = String(data.get("financeVehicle") || "").trim(); const estimateNumber = String(data.get("estimateNumber") || "").trim(); const amount = Number(data.get("financeAmount"));
    if (!customer || !vehicle || !estimateNumber || !Number.isFinite(amount) || amount < 50) { setFinancingError("Enter your name, vehicle, estimate number, and an approved repair amount of at least $50."); return; }
    setCreatingCheckout(true);
    try {
      const response = await fetch(financingEndpoint, { method: "POST", headers: apiHeaders, body: JSON.stringify({ invoiceId: `website-${estimateNumber}-${Date.now()}`, invoiceNumber: estimateNumber, customer, vehicle, amount, returnUrl: window.location.origin }) });
      const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result?.error || `Unable to start financing checkout (${response.status}).`); if (!result?.url) throw new Error("Stripe did not return a checkout link."); window.location.assign(String(result.url));
    } catch (error) { setFinancingError(error instanceof Error ? error.message : "Unable to start financing checkout."); } finally { setCreatingCheckout(false); }
  }

  return <div className="site-shell">
    <header className="navbar"><a className="brand" href="#home" aria-label="DG Autos home"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Body • Paint • Mechanical</small></span></a><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button><nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>{["home", "services", "about", "work", "booking", "financing", "contact"].map(item => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item === "work" ? "Our Work" : item === "booking" ? "Book Appointment" : item}</a>)}<a className="nav-cta" href={`tel:${phoneNumber}`}>Call Now</a></nav></header>
    <main>
      <section id="home" className="hero"><div className="hero-overlay"/><div className="hero-content container"><p className="eyebrow">Houston auto body & repair shop</p><h1>Repair it right.<br/><span>Drive it proud.</span></h1><p className="hero-copy">From collision repair and paintwork to mechanical service, DG Autos gives Houston drivers one dependable place to restore, repair, and maintain their vehicles.</p><div className="hero-actions"><a className="button button-primary" href="#booking">Book an Appointment</a><a className="button button-secondary" href="#contact">Get a Free Estimate</a><a className="button button-secondary" href="#financing">Apply for Financing</a><a className="button button-secondary" href={`tel:${phoneNumber}`}>Call {phoneDisplay}</a></div><div className="trust-row"><span><strong>Free</strong> estimates</span><span><strong>Online</strong> appointment booking</span><span><strong>Houston</strong> locally owned</span></div></div></section>
      <section id="services" className="section section-dark"><div className="container"><div className="section-heading"><p className="eyebrow">What we do</p><h2>Complete automotive repair under one roof</h2><p>Whether the vehicle needs cosmetic restoration, collision repair, or mechanical attention, our team can build a practical repair plan around your needs and budget.</p></div><div className="service-grid">{services.map(service => <article className="service-card" key={service.title}><span>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><a href="#booking">Book service →</a></article>)}</div></div></section>
      <section id="about" className="section section-split"><div className="container split-grid"><div className="shop-image" role="img" aria-label="Automotive technician working in a repair shop"><div className="image-badge"><strong>DG Autos</strong><span>Houston, Texas</span></div></div><div className="about-copy"><p className="eyebrow">Why DG Autos</p><h2>Direct communication. Honest recommendations. Quality work.</h2><p>We built DG Autos to make repairs easier to understand. You get clear communication, a practical estimate, and one team that can coordinate body, paint, and mechanical work without sending you to multiple shops.</p><div className="highlight-list">{highlights.map(item => <div key={item}><span>✓</span>{item}</div>)}</div><a className="button button-primary" href="#booking">Schedule a Visit</a></div></div></section>
      <section id="work" className="section section-work"><div className="container"><div className="section-heading"><p className="eyebrow">Our work</p><h2>Built around the result that matters</h2><p>Clean body lines, accurate color, dependable repairs, and a vehicle you feel confident driving again.</p></div><div className="work-grid"><article className="work-card work-card-one"><div><span>Collision</span><h3>Body restoration</h3><p>Repairing damaged panels and restoring proper fit and finish.</p></div></article><article className="work-card work-card-two"><div><span>Refinish</span><h3>Paint & color match</h3><p>Professional preparation, blending, and refinishing inside an automotive paint environment.</p></div></article><article className="work-card work-card-three"><div><span>Mechanical</span><h3>Repair & maintenance</h3><p>Diagnostics and repairs that keep the vehicle safe and dependable.</p></div></article></div></div></section>
      <section className="section process-section"><div className="container"><div className="section-heading"><p className="eyebrow">Simple process</p><h2>From estimate to finished repair</h2></div><div className="process-grid">{process.map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section id="booking" className="section booking-section"><div className="container booking-grid"><div className="booking-copy"><p className="eyebrow">Online scheduling</p><h2>Book your visit to DG Autos</h2><p>Choose what the vehicle needs, then select an open appointment time. Your slot is reserved immediately and our team will contact you to confirm the visit.</p><div className="booking-points"><div><strong>1</strong><span>Choose your service</span></div><div><strong>2</strong><span>Select an available time</span></div><div><strong>3</strong><span>We confirm your appointment</span></div></div><small>Appointments are available Monday–Saturday, 9:00 AM–5:00 PM. Drop-off and repair completion times vary by job.</small></div><form className="appointment-form" onSubmit={submitAppointment}><div className="form-row"><label>Name<input name="appointmentName" required autoComplete="name" placeholder="Your name"/></label><label>Phone<input name="appointmentPhone" required type="tel" autoComplete="tel" placeholder="Best contact number"/></label></div><label>Email <span>(optional)</span><input name="appointmentEmail" type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Vehicle<input name="appointmentVehicle" required placeholder="Year, make, and model"/></label><label>Service<select name="appointmentService" required defaultValue="Estimate / Inspection">{appointmentServices.map(service => <option key={service}>{service}</option>)}</select></label><div className="form-row"><label>Date<input name="appointmentDate" required type="date" min={localDateOffset()} max={localDateOffset(90)} value={appointmentDate} onChange={event => setAppointmentDate(event.target.value)}/></label><label>Available time<select name="appointmentTime" required defaultValue="" disabled={!appointmentDate || loadingSlots}><option value="">{loadingSlots ? "Loading times…" : !appointmentDate ? "Choose a date first" : availableSlots.length ? "Choose a time" : "No times available"}</option>{availableSlots.map(slot => <option key={slot} value={slot}>{displaySlot(slot)}</option>)}</select></label></div><label>What should we look at? <span>(optional)</span><textarea name="appointmentNotes" rows={4} placeholder="Damage, symptoms, concerns, insurance claim, or anything else we should know"/></label><input className="booking-honeypot" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true"/><button className="button button-primary" type="submit" disabled={booking || loadingSlots || !availableSlots.length}>{booking ? "Reserving appointment…" : "Reserve Appointment"}</button>{appointmentMessage && <p className="appointment-success">{appointmentMessage}</p>}{appointmentError && <p className="appointment-error">{appointmentError}</p>}<small>Booking reserves an intake/inspection time. DG Autos will contact you if anything about the requested visit needs to change.</small></form></div></section>
      <section id="financing" className="finance-banner"><div className="container financing-grid"><div className="finance-copy"><p className="eyebrow">Repair financing</p><h2>Use your approved repair estimate to check out securely</h2><p>Enter the exact amount approved by DG Autos. Stripe will show card payment and Affirm when the transaction and customer are eligible. Approval and payment terms are provided by Affirm through Stripe.</p><ul><li>Use the estimate number provided by DG Autos</li><li>Enter the exact approved repair total</li><li>Complete payment or financing securely on Stripe</li></ul></div><form className="finance-form" onSubmit={submitFinancing}><div className="form-row"><label>Name<input name="financeName" required placeholder="Customer name"/></label><label>Estimate number<input name="estimateNumber" required placeholder="Example: EST-1042"/></label></div><label>Vehicle<input name="financeVehicle" required placeholder="Year, make, and model"/></label><label>Approved repair amount<input name="financeAmount" required type="number" min="50" step="0.01" inputMode="decimal" placeholder="Example: 2850.00"/></label><button className="button button-light" type="submit" disabled={creatingCheckout}>{creatingCheckout ? "Opening secure checkout…" : "Continue to Payment & Affirm"}</button>{financingMessage && <p className="finance-success">{financingMessage}</p>}{financingError && <p className="finance-error">{financingError}</p>}<small>Only use an amount confirmed by DG Autos. Financing is subject to eligibility and approval.</small></form></div></section>
      <section id="contact" className="section contact-section"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow">Free estimate</p><h2>Tell us what your vehicle needs</h2><p>Not ready to schedule? Send us the basic information below. The form opens a prefilled text message so you can contact the shop directly.</p><div className="contact-details"><a href={`tel:${phoneNumber}`}><small>Phone</small><strong>{phoneDisplay}</strong></a><a href="https://maps.google.com/?q=7574+Dillon+St+Houston+TX+77061" target="_blank" rel="noreferrer"><small>Address</small><strong>7574 Dillon St<br/>Houston, TX 77061</strong></a><div><small>Appointment Hours</small><strong>Monday–Saturday<br/>9:00 AM–5:00 PM</strong></div></div></div><form className="estimate-form" onSubmit={submitEstimate}><div className="form-row"><label>Name<input name="name" required placeholder="Your name"/></label><label>Phone<input name="phone" required type="tel" placeholder="Best contact number"/></label></div><label>Vehicle<input name="vehicle" required placeholder="Year, make, and model"/></label><label>Repair needed<textarea name="repair" required rows={5} placeholder="Describe the damage, repair, or service needed"/></label><button className="button button-primary" type="submit">Text My Estimate Request</button>{message && <p className="form-message">{message}</p>}<small>Standard text messaging rates may apply.</small></form></div></section>
    </main>
    <footer><div className="container footer-inner"><div className="brand"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Body • Paint • Mechanical</small></span></div><p>© {new Date().getFullYear()} DG Autos. Houston, Texas.</p><div><a href={`tel:${phoneNumber}`}>Call</a><a href="#booking">Book</a><a href="#financing">Financing</a><a href="#contact">Estimate</a><a href="#home">Back to top</a></div></div></footer><a className="mobile-call" href="#booking">Book Appointment</a>
  </div>;
}
export default App;
