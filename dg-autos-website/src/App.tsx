import { useEffect, useState, type FormEvent } from "react";

const phoneDisplay = "(832) 203-2136";
const phoneNumber = "8322032136";
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "https://qrxyyguimdppdbvwtnuk.supabase.co").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz").trim();
const financingEndpoint = `${supabaseUrl}/functions/v1/create-financing-checkout`;
const apiHeaders = { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

const services = [
  { icon: "◈", title: "Full Body Paint", text: "Our specialty. Same-color repaints, complete color changes, restoration refinishing, and full exterior paint projects built around the finish you want.", primary: true },
  { icon: "◆", title: "Collision & Body Repair", text: "Selected collision repairs, dent and panel repair, replacement panels, body correction, and refinishing when needed." },
  { icon: "⚙", title: "Mechanical Repair", text: "Diagnostics, brakes, suspension, cooling systems, maintenance, and general mechanical repairs are still available." },
  { icon: "✦", title: "Paint Correction", text: "For vehicles that do not need repainting: oxidation correction, polishing, gloss restoration, and finish improvement." },
];

const paintProjects = [
  { title: "Same-Color Repaint", label: "Refresh the vehicle", text: "Keep the current color while correcting faded, peeling, oxidized, or tired paint. Bodywork and prep are scoped during the consultation." },
  { title: "Full Color Change", label: "Change the look", text: "Transform the exterior with a new color. Jambs, edges, trim removal, bodywork, and additional detail are quoted according to the finish level you want." },
  { title: "Restoration / Custom Refinish", label: "Build the finish", text: "For older cars, project vehicles, custom colors, pearl/metallic finishes, or jobs that need more body preparation before paint." },
];

const appointmentServices = ["Full Body Paint Consultation", "Collision Repair", "Mechanical Repair", "Paint Correction", "Estimate / Inspection", "Other"];
const process = [
  ["01", "Paint consultation", "We inspect the vehicle, talk through the color and finish you want, and identify the bodywork or prep needed before paint."],
  ["02", "Scope & estimate", "You receive a clear project scope covering prep, body correction, paint, finish details, timeline, and the approved total."],
  ["03", "Prep & refinish", "The vehicle moves through disassembly as needed, surface preparation, body correction, masking, refinishing, and reassembly."],
  ["04", "Finish & delivery", "We inspect the finish, address final details, and review the completed vehicle with you before delivery."],
];
const highlights = ["Full-body paint jobs are now our specialty", "Same-color repaints and full color changes", "Body preparation and paint handled together", "Financing available on approved paint estimates for eligible customers", "Mechanical and selected collision work still available", "English and Spanish service"];

function localDateOffset(days = 0) { const date = new Date(); date.setDate(date.getDate() + days); const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
function displaySlot(value: string) { const [hourText, minute] = value.split(":"); const hour = Number(hourText); const suffix = hour >= 12 ? "PM" : "AM"; const displayHour = hour % 12 || 12; return `${displayHour}:${minute} ${suffix}`; }

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [financingMessage, setFinancingMessage] = useState("");
  const [financingError, setFinancingError] = useState("");
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentService, setAppointmentService] = useState("Full Body Paint Consultation");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("financing");
    if (result === "success") setFinancingMessage("Payment completed successfully. DG Autos will confirm the payment with your paint or repair estimate.");
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
    const body = `Hi DG Autos, my name is ${name}. My phone number is ${phone}. Vehicle: ${vehicle}. Project: ${repair}`;
    window.location.href = `sms:${phoneNumber}?&body=${encodeURIComponent(body)}`; setMessage("Your phone's message app should open with the estimate request ready to send.");
  }

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAppointmentError(""); setAppointmentMessage("");
    const form = event.currentTarget; const data = new FormData(form); if (String(data.get("company") || "")) return;
    const appointmentTime = String(data.get("appointmentTime") || "");
    if (!appointmentDate || !appointmentTime) { setAppointmentError("Choose an available date and time."); return; }
    const serviceType = String(data.get("appointmentService") || "");
    const customerNotes = String(data.get("appointmentNotes") || "").trim();
    const notes = serviceType === "Full Body Paint Consultation" ? [
      `Paint project: ${String(data.get("paintProject") || "Not sure")}`,
      `Current paint/body condition: ${String(data.get("paintCondition") || "Not specified")}`,
      `Color / finish direction: ${String(data.get("paintColorGoal") || "Not specified")}`,
      `Financing interest: ${String(data.get("paintFinancingInterest") || "Not specified")}`,
      customerNotes ? `Customer notes: ${customerNotes}` : "",
    ].filter(Boolean).join(" | ") : customerNotes;
    setBooking(true);
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/website_book_appointment`, { method: "POST", headers: apiHeaders, body: JSON.stringify({
        p_customer_name: String(data.get("appointmentName") || "").trim(), p_phone: String(data.get("appointmentPhone") || "").trim(), p_email: String(data.get("appointmentEmail") || "").trim(), p_vehicle: String(data.get("appointmentVehicle") || "").trim(), p_service_type: serviceType, p_appointment_date: appointmentDate, p_appointment_time: appointmentTime, p_notes: notes,
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not book this appointment.");
      setAppointmentMessage(serviceType === "Full Body Paint Consultation" ? `Your ${displaySlot(appointmentTime)} full-body paint consultation is reserved. DG Autos will contact you to confirm the visit.` : `Your ${displaySlot(appointmentTime)} slot is reserved. DG Autos will contact you to confirm the appointment.`);
      form.reset(); setAppointmentService("Full Body Paint Consultation"); setAppointmentDate(""); setAvailableSlots([]);
    } catch (error) { setAppointmentError(error instanceof Error ? error.message : "Could not book this appointment."); }
    finally { setBooking(false); }
  }

  async function submitFinancing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFinancingError(""); setFinancingMessage(""); const data = new FormData(event.currentTarget); const customer = String(data.get("financeName") || "").trim(); const vehicle = String(data.get("financeVehicle") || "").trim(); const estimateNumber = String(data.get("estimateNumber") || "").trim(); const amount = Number(data.get("financeAmount"));
    if (!customer || !vehicle || !estimateNumber || !Number.isFinite(amount) || amount < 50) { setFinancingError("Enter your name, vehicle, estimate number, and the approved amount shown on your DG Autos estimate."); return; }
    setCreatingCheckout(true);
    try {
      const response = await fetch(financingEndpoint, { method: "POST", headers: apiHeaders, body: JSON.stringify({ invoiceId: `website-${estimateNumber}-${Date.now()}`, invoiceNumber: estimateNumber, customer, vehicle, amount, returnUrl: window.location.origin }) });
      const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result?.error || `Unable to start financing checkout (${response.status}).`); if (!result?.url) throw new Error("Stripe did not return a checkout link."); window.location.assign(String(result.url));
    } catch (error) { setFinancingError(error instanceof Error ? error.message : "Unable to start financing checkout."); } finally { setCreatingCheckout(false); }
  }

  return <div className="site-shell">
    <header className="navbar"><a className="brand" href="#home" aria-label="DG Autos home"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Full Paint • Body • Mechanical</small></span></a><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button><nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>{["home", "paint", "services", "work", "booking", "financing", "contact"].map(item => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item === "paint" ? "Full Paint Jobs" : item === "work" ? "Our Work" : item === "booking" ? "Book Paint Consultation" : item}</a>)}<a className="nav-cta" href={`tel:${phoneNumber}`}>Call Now</a></nav></header>
    <main>
      <section id="home" className="hero"><div className="hero-overlay"/><div className="hero-content container"><p className="eyebrow">Houston full-body automotive paint specialist</p><h1>Give the whole car<br/><span>a new finish.</span></h1><p className="hero-copy">DG Autos now specializes in full-body paint jobs—from same-color repaints to complete color changes and restoration refinishing. We still handle mechanical repairs and selected collision work, but complete paint projects are now the center of what we do.</p><div className="hero-actions"><a className="button button-primary" href="#booking">Book a Paint Consultation</a><a className="button button-secondary" href="#paint">Explore Full Paint Jobs</a><a className="button button-secondary" href="#financing">Paint Job Financing</a><a className="button button-secondary" href={`tel:${phoneNumber}`}>Call {phoneDisplay}</a></div><div className="trust-row"><span><strong>Full-body</strong> paint specialty</span><span><strong>Color change</strong> & repaint projects</span><span><strong>Financing</strong> on approved estimates</span></div></div></section>

      <section id="paint" className="section paint-focus-section"><div className="container"><div className="section-heading paint-heading"><p className="eyebrow">Full-body paint projects</p><h2>Choose the result. We build the paint plan.</h2><p>Every complete paint job starts with an in-person consultation because prep, body condition, color choice, trim removal, jamb work, and finish expectations change the scope. These are the three main directions we build around.</p></div><div className="paint-options-grid">{paintProjects.map((project,index) => <article className={`paint-option-card ${index===1?"paint-option-featured":""}`} key={project.title}><span>{String(index+1).padStart(2,"0")}</span><small>{project.label}</small><h3>{project.title}</h3><p>{project.text}</p><a href="#booking">Start with a consultation →</a></article>)}</div><div className="paint-scope-strip"><span>Body prep</span><span>Surface correction</span><span>Color & finish planning</span><span>Refinish</span><span>Reassembly</span><span>Final inspection</span></div></div></section>

      <section id="services" className="section section-dark"><div className="container"><div className="section-heading"><p className="eyebrow">What we do</p><h2>Paint first. Repair support when you need it.</h2><p>Full-body paint is our main specialty. Mechanical work and selected collision/body repairs remain available so we can handle the supporting work a project may need.</p></div><div className="service-grid">{services.map(service => <article className={`service-card ${service.primary?"service-card-primary":""}`} key={service.title}><span>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><a href={service.primary?"#booking":"#contact"}>{service.primary?"Book paint consultation →":"Ask about service →"}</a></article>)}</div></div></section>

      <section id="about" className="section section-split"><div className="container split-grid"><div className="shop-image paint-shop-image" role="img" aria-label="Vehicle in an automotive paint environment"><div className="image-badge"><strong>DG Autos</strong><span>Houston, Texas</span></div></div><div className="about-copy"><p className="eyebrow">Why DG Autos</p><h2>A paint project should be planned around the finished car.</h2><p>We are shifting the shop around complete paint work because the best results come from treating preparation, body condition, color, refinishing, and final assembly as one project—not a collection of unrelated panels.</p><div className="highlight-list">{highlights.map(item => <div key={item}><span>✓</span>{item}</div>)}</div><a className="button button-primary" href="#booking">Plan Your Paint Job</a></div></div></section>

      <section id="work" className="section section-work paint-work-section"><div className="container"><div className="section-heading"><p className="eyebrow">Project focus</p><h2>From tired paint to a complete transformation</h2><p>The scope changes by vehicle, but the goal stays the same: preparation that supports the finish, clean body lines, consistent color, and a vehicle that looks complete when it leaves.</p></div><div className="work-grid"><article className="work-card work-card-one"><div><span>Full Repaint</span><h3>Complete exterior refinish</h3><p>For faded, peeling, oxidized, or worn finishes that need more than panel-by-panel repair.</p></div></article><article className="work-card work-card-two"><div><span>Color Change</span><h3>A completely different look</h3><p>Color-change projects scoped around the amount of disassembly, edges, jambs, bodywork, and finish detail you want.</p></div></article><article className="work-card work-card-three"><div><span>Repair Support</span><h3>Body & mechanical work</h3><p>Selected collision/body and mechanical repairs remain available when the vehicle needs more than paint.</p></div></article></div></div></section>

      <section className="section process-section"><div className="container"><div className="section-heading"><p className="eyebrow">Full paint process</p><h2>From consultation to finished car</h2></div><div className="process-grid">{process.map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section id="booking" className="section booking-section paint-booking-section"><div className="container booking-grid"><div className="booking-copy"><p className="eyebrow">Paint consultation booking</p><h2>Start your full-body paint job here</h2><p>Reserve a consultation so we can see the vehicle in person, understand the finish you want, and build the right scope before quoting the project.</p><div className="booking-points"><div><strong>1</strong><span>Tell us the paint direction</span></div><div><strong>2</strong><span>Choose an inspection time</span></div><div><strong>3</strong><span>Receive your project scope & estimate</span></div></div><div className="paint-consultation-note"><strong>Thinking about financing?</strong><span>Mark it on the form. Once the paint scope and approved amount are ready, we can direct you to the financing/payment section.</span></div><small>Appointments are available Monday–Saturday, 9:00 AM–5:00 PM. The appointment is for consultation/intake; paint-project completion time is quoted separately.</small></div><form className="appointment-form" onSubmit={submitAppointment}><div className="form-row"><label>Name<input name="appointmentName" required autoComplete="name" placeholder="Your name"/></label><label>Phone<input name="appointmentPhone" required type="tel" autoComplete="tel" placeholder="Best contact number"/></label></div><label>Email <span>(optional)</span><input name="appointmentEmail" type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Vehicle<input name="appointmentVehicle" required placeholder="Year, make, and model"/></label><label>Service<select name="appointmentService" required value={appointmentService} onChange={event=>setAppointmentService(event.target.value)}>{appointmentServices.map(service => <option key={service}>{service}</option>)}</select></label>{appointmentService==="Full Body Paint Consultation"&&<div className="paint-intake"><div className="paint-intake-header"><span>Full-body paint details</span><small>These answers help us prepare for your consultation.</small></div><label>Paint project<select name="paintProject" defaultValue="Same-color repaint"><option>Same-color repaint</option><option>Full color change</option><option>Restoration / custom refinish</option><option>Not sure — I want recommendations</option></select></label><label>Current paint / body condition<select name="paintCondition" defaultValue="Faded / oxidized / clear coat failure"><option>Faded / oxidized / clear coat failure</option><option>Peeling / flaking paint</option><option>Dents / body damage before paint</option><option>Previous bodywork / mixed paint condition</option><option>Good body — mainly changing color</option><option>Not sure</option></select></label><label>Color / finish direction <span>(optional)</span><input name="paintColorGoal" placeholder="Keep factory color, black, pearl white, custom color, not sure..."/></label><label>Interested in financing?<select name="paintFinancingInterest" defaultValue="Maybe — show me options after the estimate"><option>Yes — I want financing options</option><option>Maybe — show me options after the estimate</option><option>No — not right now</option></select></label></div>}<div className="form-row"><label>Date<input name="appointmentDate" required type="date" min={localDateOffset()} max={localDateOffset(90)} value={appointmentDate} onChange={event=>setAppointmentDate(event.target.value)}/></label><label>Available time<select name="appointmentTime" required defaultValue="" disabled={!appointmentDate||loadingSlots}><option value="">{loadingSlots?"Loading times…":!appointmentDate?"Choose a date first":availableSlots.length?"Choose a time":"No times available"}</option>{availableSlots.map(slot => <option key={slot} value={slot}>{displaySlot(slot)}</option>)}</select></label></div><label>Anything else we should know? <span>(optional)</span><textarea name="appointmentNotes" rows={4} placeholder={appointmentService==="Full Body Paint Consultation"?"Body damage, peeling areas, trim concerns, custom ideas, deadline, or anything else about the paint project":"Damage, symptoms, concerns, insurance claim, or anything else we should know"}/></label><input className="booking-honeypot" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true"/><button className="button button-primary" type="submit" disabled={booking||loadingSlots||!availableSlots.length}>{booking?"Reserving consultation…":appointmentService==="Full Body Paint Consultation"?"Reserve Paint Consultation":"Reserve Appointment"}</button>{appointmentMessage&&<p className="appointment-success">{appointmentMessage}</p>}{appointmentError&&<p className="appointment-error">{appointmentError}</p>}<small>Booking reserves an intake/consultation time. DG Autos will contact you if anything about the requested visit needs to change.</small></form></div></section>

      <section id="financing" className="finance-banner paint-finance-banner"><div className="container financing-grid"><div className="finance-copy"><p className="eyebrow">Full-body paint financing</p><h2>Turn your approved paint estimate into a payment plan when eligible</h2><p>After your consultation, use the exact DG Autos estimate number and approved paint-project amount below. Secure checkout will show the payment methods available for that transaction, including Affirm when eligible.</p><ul><li>Start with a full-body paint consultation and approved scope</li><li>Use the exact estimate number and approved project total</li><li>Review available payment or financing options securely at checkout</li></ul><div className="finance-secondary-note"><strong>Mechanical or collision estimate?</strong><span>We can still process other approved DG Autos estimates; this page is simply centered around our full-body paint specialty.</span></div></div><form className="finance-form" onSubmit={submitFinancing}><span className="finance-form-kicker">Approved DG Autos paint estimate</span><div className="form-row"><label>Name<input name="financeName" required placeholder="Customer name"/></label><label>Estimate number<input name="estimateNumber" required placeholder="Example: EST-1042"/></label></div><label>Vehicle<input name="financeVehicle" required placeholder="Year, make, and model"/></label><label>Approved paint / repair amount<input name="financeAmount" required type="number" min="50" step="0.01" inputMode="decimal" placeholder="Enter the exact approved total"/></label><button className="button button-light" type="submit" disabled={creatingCheckout}>{creatingCheckout?"Opening secure checkout…":"Continue to Payment & Financing"}</button>{financingMessage&&<p className="finance-success">{financingMessage}</p>}{financingError&&<p className="finance-error">{financingError}</p>}<small>Use only an amount confirmed by DG Autos. Financing availability, approval, and terms are determined by the payment provider.</small></form></div></section>

      <section id="contact" className="section contact-section"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow">Free project estimate</p><h2>Not ready to book? Tell us what you want to do with the car.</h2><p>Send the basics and your phone will open a prefilled text message to DG Autos. For full-body paint jobs, tell us whether you want the same color, a color change, or a restoration/custom finish.</p><div className="contact-details"><a href={`tel:${phoneNumber}`}><small>Phone</small><strong>{phoneDisplay}</strong></a><a href="https://maps.google.com/?q=7574+Dillon+St+Houston+TX+77061" target="_blank" rel="noreferrer"><small>Address</small><strong>7574 Dillon St<br/>Houston, TX 77061</strong></a><div><small>Appointment Hours</small><strong>Monday–Saturday<br/>9:00 AM–5:00 PM</strong></div></div></div><form className="estimate-form" onSubmit={submitEstimate}><div className="form-row"><label>Name<input name="name" required placeholder="Your name"/></label><label>Phone<input name="phone" required type="tel" placeholder="Best contact number"/></label></div><label>Vehicle<input name="vehicle" required placeholder="Year, make, and model"/></label><label>What do you want done?<textarea name="repair" required rows={5} placeholder="Example: full same-color repaint, complete color change to black, faded clear coat, bodywork before paint, mechanical repair..."/></label><button className="button button-primary" type="submit">Text My Estimate Request</button>{message&&<p className="form-message">{message}</p>}<small>Standard text messaging rates may apply.</small></form></div></section>
    </main>
    <footer><div className="container footer-inner"><div className="brand"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Full Paint • Body • Mechanical</small></span></div><p>© {new Date().getFullYear()} DG Autos. Houston, Texas.</p><div><a href={`tel:${phoneNumber}`}>Call</a><a href="#paint">Full Paint</a><a href="#booking">Book</a><a href="#financing">Financing</a><a href="#contact">Estimate</a><a href="#home">Back to top</a></div></div></footer><a className="mobile-call" href="#booking">Book Paint Consultation</a>
  </div>;
}
export default App;
