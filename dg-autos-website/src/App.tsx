import { useEffect, useState, type FormEvent } from "react";

const phoneDisplay = "(832) 203-2136";
const phoneNumber = "8322032136";
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "https://qrxyyguimdppdbvwtnuk.supabase.co").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz").trim();
const apiHeaders = { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
const financingEndpoint = `${supabaseUrl}/functions/v1/create-financing-checkout`;

const services = [
  { icon: "◈", title: "Mobile Body & Paint Repair", text: "Bumper damage, scuffs, scratches, minor dents, and localized paint repairs assessed at your vehicle's location.", primary: true },
  { icon: "◆", title: "Bumper & Panel Repair", text: "Cosmetic bumper and panel damage, surface preparation, and refinishing recommendations tailored to the damage." },
  { icon: "✦", title: "Paint Touch-Ups & Correction", text: "Localized finish repair, scuff correction, and polishing where the condition and worksite permit." },
  { icon: "◇", title: "Dent & Cosmetic Damage", text: "Selected minor dents and cosmetic body damage assessed for a practical mobile repair plan." },
];
const repairTypes = [
  { number: "01", title: "Bumper scuffs & scratches", text: "Parking-lot scrapes, cosmetic bumper damage, and paint marks. Send the location and damage details for an assessment." },
  { number: "02", title: "Minor dents & panel damage", text: "Selected smaller body repairs and panel correction, subject to inspection and the repair location." },
  { number: "03", title: "Localized paint & finish work", text: "Touch-ups, spot repairs, and paint correction when conditions allow. Not every refinishing job is suitable for on-site work." },
];
const process = [
  ["01", "Tell us about the damage", "Share your vehicle, ZIP code, and the area that needs repair. You can text photos to help us assess it."],
  ["02", "Request a visit window", "Choose a preferred date and time. We'll review your location and repair needs before confirming a visit."],
  ["03", "We assess the worksite", "We confirm access, weather and site suitability, repair scope, and whether the work can be completed on-site."],
  ["04", "Approve the repair", "We provide the scope and price for approval before work begins. Larger or unsuitable jobs may require a different arrangement."],
];
const appointmentServices = [
  { value: "Paint & Body", label: "Mobile body & paint assessment" },
  { value: "Collision Repair", label: "Mobile collision damage assessment" },
  { value: "Paint Correction", label: "Mobile paint correction request" },
  { value: "Estimate / Inspection", label: "Mobile estimate / inspection" },
  { value: "Other Body or Paint", label: "Other body or paint work" },
];
function localDateOffset(days = 0) { const date = new Date(); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function displaySlot(value: string) { const [hours, minutes] = value.split(":"); const hour = Number(hours); return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`; }

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentService, setAppointmentService] = useState("Paint & Body");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [smsDraft, setSmsDraft] = useState("");
  const [financingMessage, setFinancingMessage] = useState("");
  const [financingError, setFinancingError] = useState("");
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("financing");
    if (result === "success") setFinancingMessage("Payment completed successfully. DG Autos will confirm the payment with your approved estimate.");
    if (result === "cancelled") setFinancingMessage("Checkout was cancelled. No payment was completed.");
  }, []);

  useEffect(() => {
    if (!appointmentDate) { setAvailableSlots([]); return; }
    let active = true;
    async function loadSlots() {
      setLoadingSlots(true); setAppointmentError(""); setAppointmentMessage(""); setAvailableSlots([]);
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_available_appointment_slots`, { method: "POST", headers: apiHeaders, body: JSON.stringify({ p_date: appointmentDate }) });
        const result = await response.json().catch(() => []);
        if (!response.ok) throw new Error(result?.message || "Could not load available times.");
        if (active) setAvailableSlots((Array.isArray(result) ? result : []).map((slot: { slot?: string }) => String(slot.slot || "")).filter(Boolean));
      } catch (error) { if (active) setAppointmentError(error instanceof Error ? error.message : "Could not load available times."); }
      finally { if (active) setLoadingSlots(false); }
    }
    void loadSlots(); return () => { active = false; };
  }, [appointmentDate]);

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAppointmentError(""); setAppointmentMessage("");
    const form = event.currentTarget; const data = new FormData(form); if (String(data.get("company") || "")) return;
    const appointmentTime = String(data.get("appointmentTime") || "");
    if (!appointmentDate || !appointmentTime || !availableSlots.includes(appointmentTime)) { setAppointmentError("Please select an available date and time."); return; }
    const service = String(data.get("appointmentService") || "Paint & Body");
    const zip = String(data.get("serviceZip") || "").trim();
    if (!/^\d{5}$/.test(zip)) { setAppointmentError("Enter a valid 5-digit service ZIP code."); return; }
    const notes = [
      "Mobile service request — visit and on-site repair subject to confirmation",
      `Customer service ZIP: ${zip}`,
      `Requested location / cross streets: ${String(data.get("serviceLocation") || "Not provided").trim() || "Not provided"}`,
      `Parking / access: ${String(data.get("vehicleAccess") || "Not specified")}`,
      `Damage / service area: ${String(data.get("damageArea") || "Not specified")}`,
      `Customer's repair goal: ${String(data.get("repairGoal") || "Not specified")}`,
      `Damage description: ${String(data.get("appointmentNotes") || "No additional details").trim() || "No additional details"}`,
    ].join(" | ");
    setBooking(true);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_book_appointment`, { method: "POST", headers: apiHeaders, body: JSON.stringify({
        p_customer_name: String(data.get("appointmentName") || "").trim(),
        p_phone: String(data.get("appointmentPhone") || "").trim(),
        p_email: String(data.get("appointmentEmail") || "").trim(),
        p_vehicle: String(data.get("appointmentVehicle") || "").trim(),
        p_service_type: service,
        p_appointment_date: appointmentDate,
        p_appointment_time: appointmentTime,
        p_notes: notes,
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not submit your visit request.");
      setAppointmentMessage(`Your request for ${displaySlot(appointmentTime)} has been received. DG Autos will contact you to confirm service availability, location, and the visit details.`);
      form.reset(); setAppointmentService("Paint & Body"); setAppointmentDate(""); setAvailableSlots([]);
    } catch (error) { setAppointmentError(error instanceof Error ? error.message : "Could not submit your visit request."); }
    finally { setBooking(false); }
  }

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setInquiryError(""); setInquiryMessage(""); setSmsDraft("");
    const form = event.currentTarget; const data = new FormData(form); if (String(data.get("company") || "")) return;
    const name = String(data.get("name") || "").trim(); const phone = String(data.get("phone") || "").trim();
    const vehicle = String(data.get("vehicle") || "").trim(); const zip = String(data.get("zip") || "").trim();
    const repair = String(data.get("repair") || "").trim();
    if (!/^\d{5}$/.test(zip)) { setInquiryError("Enter a valid 5-digit service ZIP code."); return; }
    const inquiry = `Mobile service ZIP: ${zip} | Preferred location / cross streets: ${String(data.get("location") || "Not provided").trim() || "Not provided"} | Requested repair: ${repair}`;
    setInquiryBusy(true);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_submit_inquiry`, { method: "POST", headers: apiHeaders, body: JSON.stringify({ p_customer_name: name, p_phone: phone, p_email: String(data.get("email") || "").trim(), p_vehicle: vehicle, p_inquiry: inquiry }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not send your request.");
      setInquiryMessage("Your mobile repair inquiry is in. DG Autos will contact you to discuss the repair and confirm service availability.");
      setSmsDraft(`Hi DG Autos, I submitted a mobile repair inquiry. Name: ${name}. Vehicle: ${vehicle}. ZIP: ${zip}. Repair: ${repair}. I can send photos of the damage.`);
      form.reset();
    } catch (error) { setInquiryError(error instanceof Error ? error.message : "Could not send your request."); }
    finally { setInquiryBusy(false); }
  }

  async function submitFinancing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFinancingError(""); setFinancingMessage("");
    const data = new FormData(event.currentTarget);
    const customer = String(data.get("financeName") || "").trim(); const vehicle = String(data.get("financeVehicle") || "").trim();
    const estimateNumber = String(data.get("estimateNumber") || "").trim(); const amount = Number(data.get("financeAmount"));
    if (!customer || !vehicle || !estimateNumber || !Number.isFinite(amount) || amount < 50) { setFinancingError("Enter your name, vehicle, estimate number, and the exact approved amount on your DG Autos estimate."); return; }
    setCreatingCheckout(true);
    try {
      const response = await fetch(financingEndpoint, { method: "POST", headers: apiHeaders, body: JSON.stringify({ invoiceId: `website-${estimateNumber}-${Date.now()}`, invoiceNumber: estimateNumber, customer, vehicle, amount, returnUrl: window.location.origin }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Unable to open checkout.");
      if (!result?.url) throw new Error("Secure checkout did not return a link.");
      window.location.assign(String(result.url));
    } catch (error) { setFinancingError(error instanceof Error ? error.message : "Unable to open checkout."); }
    finally { setCreatingCheckout(false); }
  }

  return <div className="site-shell mobile-service-site">
    <header className="navbar"><a className="brand" href="#home" aria-label="DG Autos home"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Mobile Body & Paint</small></span></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button><nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>{[{id:"home",label:"Home"},{id:"services",label:"Mobile Repairs"},{id:"how-it-works",label:"How It Works"},{id:"booking",label:"Request a Visit"},{id:"financing",label:"Financing"},{id:"contact",label:"Get an Estimate"}].map(item=><a key={item.id} href={`#${item.id}`} onClick={()=>setMenuOpen(false)}>{item.label}</a>)}<a className="nav-cta" href={`tel:${phoneNumber}`}>Call Now</a></nav></header>
    <main>
      <section id="home" className="hero mobile-hero"><div className="hero-overlay"/><div className="hero-content container"><p className="eyebrow">Mobile body & paint repairs · Houston area</p><h1>We bring the<br/><span>repair to you.</span></h1><p className="hero-copy">From bumper scuffs and scratches to selected minor dents and localized paint repairs, DG Autos comes to your vehicle for an assessment. Tell us where the car is and what it needs—we'll confirm the right repair plan.</p><div className="hero-actions"><a className="button button-primary" href="#booking">Request a Mobile Visit</a><a className="button button-secondary" href="#contact">Get a Repair Estimate</a><a className="button button-secondary" href={`tel:${phoneNumber}`}>Call {phoneDisplay}</a></div><div className="trust-row"><span><strong>We come to you</strong>Subject to location & availability</span><span><strong>Body & paint</strong>Localized repair assessments</span><span><strong>Clear scope</strong>Quote before repair work</span></div></div><div className="mobile-hero-stamp" aria-hidden="true"><span>DG AUTOS</span><strong>MOBILE</strong><small>BODY + PAINT</small></div></section>

      <section id="services" className="section section-dark"><div className="container"><div className="section-heading"><p className="eyebrow">Our mobile service</p><h2>Body and paint repair that works around your schedule.</h2><p>We focus on smaller cosmetic and body repairs at your home, workplace, or another suitable location. We'll assess damage and site conditions before confirming what can be safely performed on-site.</p></div><div className="service-grid">{services.map(service=><article className={`service-card ${service.primary?"service-card-primary":""}`} key={service.title}><span>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><a href="#booking">{service.primary?"Request mobile service →":"Ask about availability →"}</a></article>)}</div></div></section>

      <section id="repairs" className="section mobile-repairs-section"><div className="container"><div className="section-heading"><p className="eyebrow">What to request</p><h2>Tell us what happened. We’ll assess the repair.</h2><p>These are examples of repairs to ask us about, not a promise that every job can be completed at every location.</p></div><div className="mobile-repair-grid">{repairTypes.map(item=><article className="mobile-repair-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#contact">Get an assessment →</a></article>)}</div><div className="mobile-scope-notice"><strong>Not every paint or collision job can be done mobile.</strong><p>Repair size, weather, ventilation, dust control, property rules, and local requirements affect whether on-site work is appropriate. If the job needs a controlled facility or extensive structural work, we'll explain the options before scheduling repairs.</p></div></div></section>

      <section id="how-it-works" className="section process-section"><div className="container"><div className="section-heading"><p className="eyebrow">Simple mobile service</p><h2>From request to repair plan</h2></div><div className="process-grid">{process.map(([number,title,text])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="section section-split"><div className="container split-grid"><div className="mobile-visual-card"><div className="mobile-visual-road"/><div className="mobile-visual-copy"><span>HOUSTON AREA</span><strong>YOUR VEHICLE.<br/>YOUR LOCATION.</strong><small>Mobile estimates • Body & paint assessments</small></div></div><div className="about-copy"><p className="eyebrow">A more convenient way to get started</p><h2>Skip the unnecessary trip for the first look.</h2><p>Tell us the ZIP code, where the vehicle is parked, and what needs attention. We'll review your request, confirm travel availability and worksite suitability, and help decide on the right next step.</p><div className="highlight-list"><div><span>✓</span>Mobile estimates and repair assessments</div><div><span>✓</span>Home, workplace, or another suitable location</div><div><span>✓</span>Direct contact with DG Autos about your repair</div><div><span>✓</span>Focused exclusively on body and paint work</div></div><a className="button button-primary" href="#booking">Request a Visit</a></div></div></section>

      <section id="booking" className="section booking-section"><div className="container booking-grid"><div className="booking-copy"><p className="eyebrow">Mobile appointment request</p><h2>Where is the car? What needs fixing?</h2><p>Tell us about the vehicle and the proposed service location, then choose a preferred visit window. We'll contact you to confirm travel availability and whether the repair can be done there.</p><div className="booking-points"><div><strong>1</strong><span>Describe the damage and desired result</span></div><div><strong>2</strong><span>Share your ZIP and parking/access details</span></div><div><strong>3</strong><span>Request a time for our assessment</span></div></div><div className="mobile-booking-note"><strong>Visit requests are not automatically confirmed.</strong><span>The selected time is a request for an assessment, not a guaranteed arrival or repair appointment. We will confirm your location, schedule, and the appropriate repair plan with you.</span></div><small>Requested visit windows: Monday–Saturday, 9:00 AM–5:00 PM. Service area and on-site work depend on the ZIP code and repair conditions.</small></div><form className="appointment-form" onSubmit={submitAppointment}><div className="form-row"><label>Name<input name="appointmentName" required autoComplete="name" minLength={2} maxLength={100} placeholder="Your name"/></label><label>Phone<input name="appointmentPhone" required type="tel" autoComplete="tel" placeholder="Best contact number"/></label></div><label>Email <span>(optional)</span><input name="appointmentEmail" type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Vehicle<input name="appointmentVehicle" required maxLength={120} placeholder="Year, make, and model"/></label><label>Requested service<select name="appointmentService" value={appointmentService} onChange={event=>setAppointmentService(event.target.value)} required>{appointmentServices.map(service=><option key={service.value} value={service.value}>{service.label}</option>)}</select></label><div className="mobile-intake"><strong>Where we would come to you</strong><div className="form-row"><label>Service ZIP code<input name="serviceZip" required inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} placeholder="77061"/></label><label>Parking / access<select name="vehicleAccess" defaultValue="Driveway / private parking"><option>Driveway / private parking</option><option>Workplace / business lot</option><option>Garage / covered parking</option><option>Street parking</option><option>Other / not sure</option></select></label></div><label>Service location or nearby cross streets <span>(optional)</span><input name="serviceLocation" autoComplete="street-address" maxLength={180} placeholder="Where the vehicle is parked (not the shop address)"/></label><label>Area that needs attention<select name="damageArea" defaultValue="Bumper"><option>Bumper</option><option>Door / fender / quarter</option><option>Hood / trunk / roof</option><option>Several areas</option><option>Paint finish / scuffs</option><option>Other body / paint area</option></select></label><label>What result are you looking for?<select name="repairGoal" defaultValue="Clean daily-driver repair"><option>Clean daily-driver repair</option><option>Resale / trade-in appearance</option><option>Closest practical color / finish match</option><option>Need DG Autos to recommend an approach</option></select></label></div><div className="form-row"><label>Preferred date<input type="date" required min={localDateOffset()} max={localDateOffset(90)} value={appointmentDate} onChange={event=>setAppointmentDate(event.target.value)}/></label><label>Preferred visit window<select key={appointmentDate} name="appointmentTime" required defaultValue="" disabled={!appointmentDate||loadingSlots}><option value="">{loadingSlots?"Loading times…":!appointmentDate?"Choose a date first":availableSlots.length?"Choose a time":"No times available"}</option>{availableSlots.map(slot=><option key={slot} value={slot}>{displaySlot(slot)}</option>)}</select></label></div><label>Describe the damage <span>(optional; photos can be texted afterward)</span><textarea name="appointmentNotes" rows={4} maxLength={1200} placeholder="What is damaged? How large is the area? Any peeling paint, dents, previous repair, or access concerns?"/></label><input className="booking-honeypot" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true"/><button className="button button-primary" type="submit" disabled={booking||loadingSlots||!availableSlots.length}>{booking?"Sending request…":"Request a Mobile Visit"}</button>{appointmentMessage&&<p className="appointment-success" role="status">{appointmentMessage}</p>}{appointmentError&&<p className="appointment-error" role="alert">{appointmentError}</p>}<small>We review your request before confirming a mobile visit. The inspection determines repair feasibility and final pricing.</small></form></div></section>

      <section id="financing" className="finance-banner mobile-finance-section"><div className="container financing-grid"><div className="finance-copy"><p className="eyebrow">Approved repair estimates</p><h2>Payment and financing options for your repair</h2><p>After DG Autos confirms your repair scope and amount, secure checkout will display available payment options for that transaction, including financing if you qualify.</p><ul><li>Request an assessment and receive an approved DG Autos estimate</li><li>Use the exact estimate number and approved total</li><li>Review the payment methods and any eligible financing terms at secure checkout</li></ul></div><form className="finance-form" onSubmit={submitFinancing}><span className="finance-form-kicker">Approved DG Autos estimate</span><div className="form-row"><label>Name<input name="financeName" required placeholder="Customer name"/></label><label>Estimate number<input name="estimateNumber" required placeholder="Example: EST-1042"/></label></div><label>Vehicle<input name="financeVehicle" required placeholder="Year, make, and model"/></label><label>Exact approved amount<input name="financeAmount" required type="number" min="50" step="0.01" inputMode="decimal" placeholder="Amount from your approved estimate"/></label><button className="button button-light" type="submit" disabled={creatingCheckout}>{creatingCheckout?"Opening secure checkout…":"Continue to Secure Checkout"}</button>{financingMessage&&<p className="finance-success" role="status">{financingMessage}</p>}{financingError&&<p className="finance-error" role="alert">{financingError}</p>}<small>Financing is not guaranteed. Availability, approval, and terms are determined by the payment provider. Do not enter a package estimate or an unapproved amount.</small></form></div></section>

      <section id="contact" className="section contact-section"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow">Get a mobile repair estimate</p><h2>Not ready to book? Send us the details.</h2><p>Tell us where the vehicle is and what needs fixing. Your request goes directly to the DG Autos OS so we can follow up. You can also text photos of the damage after submitting.</p><div className="contact-details"><a href={`tel:${phoneNumber}`}><small>Call or text</small><strong>{phoneDisplay}</strong></a><div><small>Service area</small><strong>Houston and surrounding areas<br/>Availability confirmed by ZIP code</strong></div><div><small>Request windows</small><strong>Monday–Saturday<br/>9:00 AM–5:00 PM</strong></div></div></div><form className="estimate-form" onSubmit={submitInquiry}><div className="form-row"><label>Name<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your name"/></label><label>Phone<input name="phone" required type="tel" autoComplete="tel" placeholder="Best contact number"/></label></div><div className="form-row"><label>Vehicle<input name="vehicle" required maxLength={120} placeholder="Year, make, and model"/></label><label>Service ZIP code<input name="zip" required pattern="[0-9]{5}" maxLength={5} inputMode="numeric" autoComplete="postal-code" placeholder="77061"/></label></div><label>Email <span>(optional)</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Service location or nearby cross streets <span>(optional)</span><input name="location" autoComplete="street-address" maxLength={180} placeholder="Home, workplace, or other location"/></label><label>What needs repairing?<textarea name="repair" required minLength={5} maxLength={1200} rows={5} placeholder="For example: scuffed front bumper, small dent in driver's door, scratched or peeling paint..."/></label><input className="booking-honeypot" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true"/><button className="button button-primary" disabled={inquiryBusy} type="submit">{inquiryBusy?"Sending request…":"Send My Repair Inquiry"}</button>{inquiryMessage&&<p className="form-message" role="status">{inquiryMessage}</p>}{inquiryError&&<p className="appointment-error" role="alert">{inquiryError}</p>}{smsDraft&&<a className="button button-secondary mobile-text-photos" href={`sms:${phoneNumber}?&body=${encodeURIComponent(smsDraft)}`}>Text Us Photos of the Damage</a>}<small>Service availability and final repair pricing are confirmed after we review your request.</small></form></div></section>
    </main>
    <footer><div className="container footer-inner"><div className="brand"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Mobile Body & Paint</small></span></div><p>© {new Date().getFullYear()} DG Autos · Serving the Houston area</p><div><a href={`tel:${phoneNumber}`}>Call</a><a href="#services">Repairs</a><a href="#booking">Request a Visit</a><a href="#financing">Financing</a><a href="#contact">Estimate</a><a href="#home">Top</a></div></div></footer><a className="mobile-call" href="#booking">Request Mobile Service</a>
  </div>;
}
