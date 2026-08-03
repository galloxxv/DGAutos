import { useEffect, useMemo, useState } from "react";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "https://qrxyyguimdppdbvwtnuk.supabase.co").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_v4pF36D-wDZCt_KDunc-EA_g4irwilz").trim();
const portalEndpoint = `${supabaseUrl}/functions/v1/estimate-approval-portal`;
const financingEndpoint = `${supabaseUrl}/functions/v1/create-financing-checkout`;
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

type Line = { type: string; description: string; quantity: number; unitPrice: number; laborHours: number; laborRate: number; taxable: boolean; notes: string };
type PortalEstimate = { estimateNumber: string; customerName: string; vehicle: string; status: string; subtotal: number; tax: number; discount: number; deposit: number; total: number; balanceDue: number; lines: Line[]; customerNotes: string; terms: string; decision?: "Approved" | "Declined"; decisionName?: string; decisionAt?: string };

function lineTotal(line: Line) {
  return line.type === "Labor" ? line.laborHours * line.laborRate : line.quantity * line.unitPrice;
}

export default function ApprovalPortal({ token }: { token: string }) {
  const [estimate, setEstimate] = useState<PortalEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [financing, setFinancing] = useState(false);
  const decided = Boolean(estimate?.decision);
  const canFinance = estimate?.decision === "Approved" && (estimate?.balanceDue || 0) >= 50;

  const decisionDate = useMemo(() => estimate?.decisionAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(estimate.decisionAt)) : "", [estimate?.decisionAt]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${portalEndpoint}?token=${encodeURIComponent(token)}`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load this estimate.");
        if (active) setEstimate(result);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load this estimate.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [token]);

  async function decide(decision: "Approved" | "Declined") {
    if (!name.trim()) { setError("Type your full name before submitting your decision."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`${portalEndpoint}?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({ decision, name: name.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to record your decision.");
      setEstimate(current => current ? { ...current, status: decision, decision, decisionName: result.decisionName, decisionAt: result.decisionAt } : current);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to record your decision."); }
    finally { setSubmitting(false); }
  }

  async function openFinancing() {
    if (!estimate) return;
    setFinancing(true); setError("");
    try {
      const response = await fetch(financingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({ invoiceNumber: estimate.estimateNumber, customer: estimate.customerName, returnUrl: window.location.origin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to open financing checkout.");
      window.location.assign(result.url);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to open financing checkout."); setFinancing(false); }
  }

  if (loading) return <main className="portal-shell"><div className="portal-card portal-state"><div className="portal-logo">DG</div><h1>Loading your estimate…</h1></div></main>;
  if (error && !estimate) return <main className="portal-shell"><div className="portal-card portal-state"><div className="portal-logo">DG</div><h1>Estimate unavailable</h1><p>{error}</p><a href="tel:8322032136">Call DG Autos</a></div></main>;
  if (!estimate) return null;

  return <main className="portal-shell">
    <section className="portal-card">
      <header className="portal-header"><div className="portal-brand"><div className="portal-logo">DG</div><div><strong>DG AUTOS</strong><span>Estimate Approval Portal</span></div></div><a href="tel:8322032136">(832) 203-2136</a></header>
      <div className="portal-title"><div><span>Estimate {estimate.estimateNumber}</span><h1>{estimate.vehicle}</h1><p>Prepared for {estimate.customerName}</p></div><span className={`portal-status portal-${(estimate.decision || estimate.status).toLowerCase()}`}>{estimate.decision || estimate.status}</span></div>

      <div className="portal-lines">
        <div className="portal-line portal-line-head"><span>Description</span><span>Qty / Hours</span><span>Amount</span></div>
        {estimate.lines.map((line, index) => <div className="portal-line" key={`${line.description}-${index}`}><span><strong>{line.description}</strong><small>{line.type}{line.notes ? ` · ${line.notes}` : ""}</small></span><span>{line.type === "Labor" ? `${line.laborHours} hrs` : line.quantity}</span><span>{money(lineTotal(line))}</span></div>)}
      </div>

      <div className="portal-summary"><div><span>Subtotal</span><strong>{money(estimate.subtotal)}</strong></div><div><span>Tax</span><strong>{money(estimate.tax)}</strong></div>{estimate.discount > 0 && <div><span>Discount</span><strong>-{money(estimate.discount)}</strong></div>}<div><span>Estimate total</span><strong>{money(estimate.total)}</strong></div>{estimate.deposit > 0 && <div><span>Deposit</span><strong>-{money(estimate.deposit)}</strong></div>}<div className="portal-balance"><span>Balance due</span><strong>{money(estimate.balanceDue)}</strong></div></div>

      {estimate.customerNotes && <div className="portal-notes"><h2>Repair notes</h2><p>{estimate.customerNotes}</p></div>}
      {estimate.terms && <div className="portal-notes"><h2>Terms</h2><p>{estimate.terms}</p></div>}
      {error && <p className="portal-error">{error}</p>}

      {!decided ? <div className="portal-decision"><h2>Approve or decline this estimate</h2><p>Type your full name. Selecting Approve confirms authorization for DG Autos to proceed with the work listed above, subject to the estimate terms.</p><label>Full name<input value={name} onChange={event => setName(event.target.value)} placeholder="Type your full legal name" /></label><div><button className="portal-approve" disabled={submitting} onClick={() => void decide("Approved")}>{submitting ? "Submitting…" : "Approve Estimate"}</button><button className="portal-decline" disabled={submitting} onClick={() => void decide("Declined")}>Decline</button></div></div> : <div className={`portal-decision-result portal-result-${estimate.decision?.toLowerCase()}`}><h2>Estimate {estimate.decision?.toLowerCase()}</h2><p>Recorded for {estimate.decisionName}{decisionDate ? ` on ${decisionDate}` : ""}.</p>{canFinance && <button className="portal-approve" disabled={financing} onClick={() => void openFinancing()}>{financing ? "Opening secure checkout…" : "Pay or Apply with Affirm"}</button>}</div>}
      <footer className="portal-footer">DG Autos · 7574 Dillon St, Houston, TX 77061 · Monday–Saturday, 9:00 AM–5:00 PM</footer>
    </section>
  </main>;
}
