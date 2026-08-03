import { useEffect, useState, type FormEvent } from "react";

const phoneDisplay = "(832) 203-2136";
const phoneNumber = "8322032136";
const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "https://qrxyyguimdppdbvwtnuk.supabase.co").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz").trim();
const financingEndpoint = `${supabaseUrl}/functions/v1/create-financing-checkout`;

const services = [
  { icon: "◆", title: "Collision Repair", text: "Body repair, panel replacement, dent repair, structural correction, and professional refinishing." },
  { icon: "◈", title: "Paint & Body", text: "Color matching, panel refinishing, complete paint work, bumper repair, and cosmetic restoration." },
  { icon: "⚙", title: "Mechanical Repair", text: "Diagnostics, brakes, suspension, cooling systems, maintenance, and general mechanical repairs." },
  { icon: "✦", title: "Paint Correction", text: "Swirl removal, oxidation correction, gloss restoration, polishing, and finish protection." },
];

const process = [
  ["01", "Free estimate", "Send photos or bring the vehicle in so we can inspect the damage or concern."],
  ["02", "Clear repair plan", "We explain the recommended work, expected price, and realistic completion timeline."],
  ["03", "Professional repair", "Our team completes the repair with attention to fit, finish, safety, and quality."],
  ["04", "Final inspection", "We inspect the work with you and make sure the vehicle is ready before delivery."],
];

const highlights = [
  "Body, paint, and mechanical work in one shop",
  "Free estimates with straightforward recommendations",
  "Insurance and customer-pay repairs welcome",
  "Financing options for qualified customers",
  "English and Spanish service",
  "Locally owned Houston repair shop",
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [financingMessage, setFinancingMessage] = useState("");
  const [financingError, setFinancingError] = useState("");
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("financing");
    if (result === "success") setFinancingMessage("Payment completed successfully. DG Autos will confirm the payment with your repair estimate.");
    if (result === "cancelled") setFinancingMessage("Checkout was cancelled. No payment was completed.");
  }, []);

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const vehicle = String(data.get("vehicle") || "").trim();
    const repair = String(data.get("repair") || "").trim();
    const body = `Hi DG Autos, my name is ${name}. My phone number is ${phone}. Vehicle: ${vehicle}. Repair needed: ${repair}`;
    window.location.href = `sms:${phoneNumber}?&body=${encodeURIComponent(body)}`;
    setMessage("Your phone's message app should open with the estimate request ready to send.");
  }

  async function submitFinancing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFinancingError("");
    setFinancingMessage("");

    const data = new FormData(event.currentTarget);
    const customer = String(data.get("financeName") || "").trim();
    const vehicle = String(data.get("financeVehicle") || "").trim();
    const estimateNumber = String(data.get("estimateNumber") || "").trim();
    const amount = Number(data.get("financeAmount"));

    if (!customer || !vehicle || !estimateNumber || !Number.isFinite(amount) || amount < 50) {
      setFinancingError("Enter your name, vehicle, estimate number, and an approved repair amount of at least $50.");
      return;
    }

    setCreatingCheckout(true);
    try {
      const response = await fetch(financingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          invoiceId: `website-${estimateNumber}-${Date.now()}`,
          invoiceNumber: estimateNumber,
          customer,
          vehicle,
          amount,
          returnUrl: window.location.origin,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || `Unable to start financing checkout (${response.status}).`);
      if (!result?.url) throw new Error("Stripe did not return a checkout link.");

      window.location.assign(String(result.url));
    } catch (error) {
      setFinancingError(error instanceof Error ? error.message : "Unable to start financing checkout.");
    } finally {
      setCreatingCheckout(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="DG Autos home">
          <span className="brand-mark">DG</span>
          <span><strong>DG AUTOS</strong><small>Body • Paint • Mechanical</small></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
          {["home", "services", "about", "work", "financing", "contact"].map((item) => (
            <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item === "work" ? "Our Work" : item}</a>
          ))}
          <a className="nav-cta" href={`tel:${phoneNumber}`}>Call Now</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-overlay" />
          <div className="hero-content container">
            <p className="eyebrow">Houston auto body & repair shop</p>
            <h1>Repair it right.<br/><span>Drive it proud.</span></h1>
            <p className="hero-copy">From collision repair and paintwork to mechanical service, DG Autos gives Houston drivers one dependable place to restore, repair, and maintain their vehicles.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">Get a Free Estimate</a>
              <a className="button button-secondary" href="#financing">Apply for Financing</a>
              <a className="button button-secondary" href={`tel:${phoneNumber}`}>Call {phoneDisplay}</a>
            </div>
            <div className="trust-row">
              <span><strong>Free</strong> estimates</span>
              <span><strong>Financing</strong> options available</span>
              <span><strong>Houston</strong> locally owned</span>
            </div>
          </div>
        </section>

        <section id="services" className="section section-dark">
          <div className="container">
            <div className="section-heading"><p className="eyebrow">What we do</p><h2>Complete automotive repair under one roof</h2><p>Whether the vehicle needs cosmetic restoration, collision repair, or mechanical attention, our team can build a practical repair plan around your needs and budget.</p></div>
            <div className="service-grid">{services.map((service) => <article className="service-card" key={service.title}><span>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><a href="#contact">Request estimate →</a></article>)}</div>
          </div>
        </section>

        <section id="about" className="section section-split">
          <div className="container split-grid">
            <div className="shop-image" role="img" aria-label="Automotive technician working in a repair shop"><div className="image-badge"><strong>DG Autos</strong><span>Houston, Texas</span></div></div>
            <div className="about-copy"><p className="eyebrow">Why DG Autos</p><h2>Direct communication. Honest recommendations. Quality work.</h2><p>We built DG Autos to make repairs easier to understand. You get clear communication, a practical estimate, and one team that can coordinate body, paint, and mechanical work without sending you to multiple shops.</p><div className="highlight-list">{highlights.map((item) => <div key={item}><span>✓</span>{item}</div>)}</div><a className="button button-primary" href="#contact">Talk to Our Team</a></div>
          </div>
        </section>

        <section id="work" className="section section-work">
          <div className="container">
            <div className="section-heading"><p className="eyebrow">Our work</p><h2>Built around the result that matters</h2><p>Clean body lines, accurate color, dependable repairs, and a vehicle you feel confident driving again.</p></div>
            <div className="work-grid">
              <article className="work-card work-card-one"><div><span>Collision</span><h3>Body restoration</h3><p>Repairing damaged panels and restoring proper fit and finish.</p></div></article>
              <article className="work-card work-card-two"><div><span>Refinish</span><h3>Paint & color match</h3><p>Professional preparation, blending, and refinishing inside an automotive paint environment.</p></div></article>
              <article className="work-card work-card-three"><div><span>Mechanical</span><h3>Repair & maintenance</h3><p>Diagnostics and repairs that keep the vehicle safe and dependable.</p></div></article>
            </div>
          </div>
        </section>

        <section className="section process-section"><div className="container"><div className="section-heading"><p className="eyebrow">Simple process</p><h2>From estimate to finished repair</h2></div><div className="process-grid">{process.map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section id="financing" className="finance-banner">
          <div className="container financing-grid">
            <div className="finance-copy"><p className="eyebrow">Repair financing</p><h2>Use your approved repair estimate to check out securely</h2><p>Enter the exact amount approved by DG Autos. Stripe will show card payment and Affirm when the transaction and customer are eligible. Approval and payment terms are provided by Affirm through Stripe.</p><ul><li>Use the estimate number provided by DG Autos</li><li>Enter the exact approved repair total</li><li>Complete payment or financing securely on Stripe</li></ul></div>
            <form className="finance-form" onSubmit={submitFinancing}>
              <div className="form-row"><label>Name<input name="financeName" required placeholder="Customer name" /></label><label>Estimate number<input name="estimateNumber" required placeholder="Example: EST-1042" /></label></div>
              <label>Vehicle<input name="financeVehicle" required placeholder="Year, make, and model" /></label>
              <label>Approved repair amount<input name="financeAmount" required type="number" min="50" step="0.01" inputMode="decimal" placeholder="Example: 2850.00" /></label>
              <button className="button button-light" type="submit" disabled={creatingCheckout}>{creatingCheckout ? "Opening secure checkout…" : "Continue to Payment & Affirm"}</button>
              {financingMessage && <p className="finance-success">{financingMessage}</p>}
              {financingError && <p className="finance-error">{financingError}</p>}
              <small>Only use an amount confirmed by DG Autos. Financing is subject to eligibility and approval.</small>
            </form>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="container contact-grid">
            <div className="contact-copy"><p className="eyebrow">Free estimate</p><h2>Tell us what your vehicle needs</h2><p>Send us the basic information below. The form opens a prefilled text message so you can contact the shop directly without waiting on an email system.</p><div className="contact-details"><a href={`tel:${phoneNumber}`}><small>Phone</small><strong>{phoneDisplay}</strong></a><a href="https://maps.google.com/?q=7574+Dillon+St+Houston+TX+77061" target="_blank" rel="noreferrer"><small>Address</small><strong>7574 Dillon St<br/>Houston, TX 77061</strong></a><div><small>Hours</small><strong>Monday–Saturday<br/>8:00 AM–6:00 PM</strong></div></div></div>
            <form className="estimate-form" onSubmit={submitEstimate}><div className="form-row"><label>Name<input name="name" required placeholder="Your name" /></label><label>Phone<input name="phone" required type="tel" placeholder="Best contact number" /></label></div><label>Vehicle<input name="vehicle" required placeholder="Year, make, and model" /></label><label>Repair needed<textarea name="repair" required rows={5} placeholder="Describe the damage, repair, or service needed" /></label><button className="button button-primary" type="submit">Text My Estimate Request</button>{message && <p className="form-message">{message}</p>}<small>Standard text messaging rates may apply.</small></form>
          </div>
        </section>
      </main>

      <footer><div className="container footer-inner"><div className="brand"><span className="brand-mark">DG</span><span><strong>DG AUTOS</strong><small>Body • Paint • Mechanical</small></span></div><p>© {new Date().getFullYear()} DG Autos. Houston, Texas.</p><div><a href={`tel:${phoneNumber}`}>Call</a><a href="#financing">Financing</a><a href="#contact">Estimate</a><a href="#home">Back to top</a></div></div></footer>
      <a className="mobile-call" href={`tel:${phoneNumber}`}>Call DG Autos</a>
    </div>
  );
}

export default App;
