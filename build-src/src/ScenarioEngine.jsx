import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Sprout, Server, Cloud, Cpu, Network, Hash, FileText, Users, Wrench, Info } from 'lucide-react';

// ============================================================
// Global styles: HUD layout, no page scroll
// ============================================================
const CSS = `
  * { box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #444; }
  input[type=range] { accent-color: #c4956a; cursor: pointer; }
  input[type=range]::-webkit-slider-runnable-track { height: 3px; background: #2a2a2a; border-radius: 2px; }
  input[type=range]::-webkit-slider-thumb { width: 14px; height: 14px; margin-top: -5.5px; border-radius: 50%; background: #c4956a; }
  input[type=text] { background: rgba(0,0,0,0.25); border: 1px solid #2a2a2a; border-radius: 6px; padding: 8px 10px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c8c8c8; width: 100%; outline: none; transition: border-color 0.2s; }
  input[type=text]:focus { border-color: rgba(196,149,106,0.4); }
  input[type=text]::placeholder { color: #444; }
`;

// ============================================================
// Design tokens from the co-op.us design system
// ============================================================
const t = {
  bg: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceDeep: 'rgba(0,0,0,0.25)',
  border: '#2a2a2a',
  terra: '#c4956a',
  terraDim: 'rgba(196,149,106,0.12)',
  terraGlow: 'rgba(196,149,106,0.05)',
  terraBorder: 'rgba(196,149,106,0.22)',
  white: '#e8e0d8',
  text: '#c8c8c8',
  muted: '#888888',
  faint: '#555555',
  green: '#7fb56a',
  amber: '#c4956a',
  red: '#b56a6a',
  serif: "'Libre Baskerville', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

// ============================================================
// Labor taxonomy: FMV rates per role (USD / hour)
// ============================================================
const ROLES = {
  design:    { name: 'Design',           rate: 165, blurb: 'Information architecture, interaction design, visual system.' },
  frontend:  { name: 'Frontend',         rate: 175, blurb: 'HTML, CSS, JavaScript — the visible surface.' },
  backend:   { name: 'Backend',          rate: 195, blurb: 'Application logic, database, authentication.' },
  devops:    { name: 'DevOps',           rate: 210, blurb: 'Deployment, monitoring, incident response.' },
  data:      { name: 'Data engineering', rate: 215, blurb: 'Pipelines, warehousing, schema.' },
  ml:        { name: 'ML engineering',   rate: 245, blurb: 'Model training, inference, evaluation.' },
  qa:        { name: 'Quality',          rate: 135, blurb: 'Test design, regression, accessibility.' },
  product:   { name: 'Product',          rate: 185, blurb: 'Scope, delivery rhythm, stakeholder communication.' },
  content:   { name: 'Content',          rate: 125, blurb: 'Copywriting, editorial, content operations.' },
  research:  { name: 'Research',         rate: 225, blurb: 'User research, mechanism design, structured inquiry.' },
};

// ============================================================
// Pattern library
// ============================================================
const PATTERNS = {
  static: {
    id: 'static', name: 'Static page', tagline: 'A single page or small multi-page site.',
    icon: Sprout, complexity: 'low',
    hours: { design: 18, frontend: 22, content: 8, product: 4 },
    infra: {
      lean:      [{ name: 'Static hosting (Cloudflare Pages)', monthly: 0 }, { name: 'Domain', monthly: 2 }, { name: 'Email forwarding', monthly: 0 }],
      standard:  [{ name: 'Managed hosting (Vercel)', monthly: 20 }, { name: 'Domain', monthly: 2 }, { name: 'Form handling', monthly: 10 }, { name: 'Analytics', monthly: 12 }],
      sovereign: [{ name: 'Cooperative node', monthly: 40 }, { name: 'Domain', monthly: 2 }, { name: 'Backup', monthly: 15 }, { name: 'Monitoring', monthly: 10 }],
    },
  },
  content: {
    id: 'content', name: 'Content site', tagline: 'Editorially managed, CMS-backed.',
    icon: FileText, complexity: 'low–mid',
    hours: { design: 40, frontend: 60, backend: 28, content: 24, devops: 12, product: 10, qa: 8 },
    infra: {
      lean:      [{ name: 'Headless CMS (free tier)', monthly: 0 }, { name: 'Static hosting', monthly: 0 }, { name: 'Domain', monthly: 3 }, { name: 'Image CDN', monthly: 15 }],
      standard:  [{ name: 'Headless CMS (team)', monthly: 99 }, { name: 'Managed hosting', monthly: 40 }, { name: 'Image CDN', monthly: 25 }, { name: 'Analytics + search', monthly: 45 }, { name: 'Domain', monthly: 3 }],
      sovereign: [{ name: 'Self-hosted CMS on node', monthly: 85 }, { name: 'Object storage', monthly: 20 }, { name: 'CDN', monthly: 30 }, { name: 'Monitoring + backup', monthly: 25 }, { name: 'Domain', monthly: 3 }],
    },
  },
  webapp: {
    id: 'webapp', name: 'Web application', tagline: 'Authenticated, single-tenant, stateful.',
    icon: Layers, complexity: 'mid',
    hours: { design: 80, frontend: 160, backend: 140, devops: 36, qa: 28, product: 28, content: 8 },
    infra: {
      lean:      [{ name: 'Managed PaaS (free tier)', monthly: 0 }, { name: 'Managed Postgres', monthly: 25 }, { name: 'Object storage', monthly: 10 }, { name: 'Email', monthly: 15 }, { name: 'Domain', monthly: 3 }],
      standard:  [{ name: 'Managed PaaS (production)', monthly: 90 }, { name: 'Managed Postgres', monthly: 120 }, { name: 'Object storage', monthly: 25 }, { name: 'Email', monthly: 35 }, { name: 'Monitoring', monthly: 55 }, { name: 'Backup', monthly: 25 }, { name: 'Domain', monthly: 3 }],
      sovereign: [{ name: 'Cooperative node (Hetzner)', monthly: 120 }, { name: 'Postgres with replication', monthly: 45 }, { name: 'Object storage (MinIO)', monthly: 30 }, { name: 'Email relay', monthly: 25 }, { name: 'Monitoring', monthly: 20 }, { name: 'Offsite backup', monthly: 35 }, { name: 'Domain', monthly: 3 }],
    },
  },
  saas: {
    id: 'saas', name: 'SaaS platform', tagline: 'Multi-tenant, billing, admin tools.',
    icon: Server, complexity: 'mid–high',
    hours: { design: 130, frontend: 260, backend: 300, devops: 90, qa: 85, product: 65, data: 40, content: 20 },
    infra: {
      lean:      [{ name: 'Managed PaaS', monthly: 150 }, { name: 'Managed Postgres', monthly: 200 }, { name: 'Stripe (3% GMV)', monthly: 0 }, { name: 'Email at scale', monthly: 85 }, { name: 'Monitoring', monthly: 90 }, { name: 'Domain', monthly: 3 }],
      standard:  [{ name: 'Managed PaaS (scaled)', monthly: 280 }, { name: 'Managed Postgres HA', monthly: 380 }, { name: 'Redis cache', monthly: 45 }, { name: 'Email infrastructure', monthly: 145 }, { name: 'Monitoring + alerting', monthly: 165 }, { name: 'Backup + DR', monthly: 75 }, { name: 'Domain', monthly: 3 }],
      sovereign: [{ name: 'Cooperative cluster', monthly: 420 }, { name: 'Postgres HA', monthly: 120 }, { name: 'Redis + queue', monthly: 45 }, { name: 'Email relay', monthly: 65 }, { name: 'Grafana monitoring', monthly: 50 }, { name: 'Backup (encrypted)', monthly: 85 }, { name: 'Domain', monthly: 3 }],
    },
  },
  data_platform: {
    id: 'data_platform', name: 'Data platform', tagline: 'Ingestion, processing, dashboards.',
    icon: Cloud, complexity: 'high',
    hours: { design: 60, frontend: 120, backend: 140, data: 220, devops: 80, ml: 40, qa: 50, product: 45, research: 25 },
    infra: {
      lean:      [{ name: 'Managed warehouse (dev)', monthly: 80 }, { name: 'Pipeline orchestration', monthly: 40 }, { name: 'Object storage', monthly: 30 }, { name: 'Dashboard hosting', monthly: 25 }, { name: 'Domain', monthly: 3 }],
      standard:  [{ name: 'Managed warehouse (production)', monthly: 400 }, { name: 'Orchestration', monthly: 95 }, { name: 'Object storage (tiered)', monthly: 85 }, { name: 'Dashboard platform', monthly: 95 }, { name: 'Monitoring + quality', monthly: 75 }, { name: 'Domain', monthly: 3 }],
      sovereign: [{ name: 'Cooperative data node', monthly: 280 }, { name: 'Self-hosted orchestration', monthly: 35 }, { name: 'Object storage cluster', monthly: 65 }, { name: 'Metabase', monthly: 30 }, { name: 'Monitoring', monthly: 45 }, { name: 'Offsite backup', monthly: 55 }, { name: 'Domain', monthly: 3 }],
    },
  },
  distributed: {
    id: 'distributed', name: 'Distributed system', tagline: 'Multi-service, chain-adjacent, agentic.',
    icon: Network, complexity: 'high',
    hours: { design: 100, frontend: 220, backend: 340, devops: 170, data: 180, ml: 180, qa: 110, product: 85, research: 90 },
    infra: {
      lean:      [{ name: 'Container platform', monthly: 180 }, { name: 'Postgres + Redis', monthly: 220 }, { name: 'Object storage', monthly: 45 }, { name: 'Inference API', monthly: 400 }, { name: 'Base RPC', monthly: 50 }, { name: 'Monitoring', monthly: 85 }, { name: 'Domain', monthly: 3 }],
      standard:  [{ name: 'Container orchestration', monthly: 480 }, { name: 'Postgres HA + Redis', monthly: 520 }, { name: 'Object storage + CDN', monthly: 145 }, { name: 'Inference infrastructure', monthly: 1200 }, { name: 'Base RPC (redundant)', monthly: 120 }, { name: 'Observability', monthly: 220 }, { name: 'Backup + DR', monthly: 135 }, { name: 'Domain', monthly: 3 }],
      sovereign: [{ name: 'Cooperative cluster (multi-region)', monthly: 680 }, { name: 'Postgres + Redis (replicated)', monthly: 165 }, { name: 'Object storage cluster', monthly: 95 }, { name: 'GPU inference (leased)', monthly: 780 }, { name: 'Base node', monthly: 90 }, { name: 'Observability', monthly: 60 }, { name: 'Backup (encrypted)', monthly: 115 }, { name: 'Domain', monthly: 3 }],
    },
  },
};

// ============================================================
// Infrastructure tiers
// ============================================================
const TIERS = [
  { id: 'lean',      name: 'Lean',      desc: 'Free or low-tier managed. Early / experimental.' },
  { id: 'standard',  name: 'Standard',  desc: 'Production-grade managed. Real users.' },
  { id: 'sovereign', name: 'Sovereign', desc: 'Self-hosted cooperative infrastructure.' },
];

// ============================================================
// Roster: illustrative seed data.
// Authoritative source is the CIS People module.
// Replace with live roster data when the People module exposes it.
// ============================================================
const ROSTER = [
  { id: 'm1', name: 'Member one',   roles: ['backend', 'devops', 'data'],        capacityHours: 220 },
  { id: 'm2', name: 'Member two',   roles: ['frontend', 'design'],               capacityHours: 180 },
  { id: 'm3', name: 'Member three', roles: ['design', 'content', 'product'],     capacityHours: 160 },
  { id: 'm4', name: 'Member four',  roles: ['data', 'ml', 'research'],           capacityHours: 200 },
  { id: 'm5', name: 'Member five',  roles: ['frontend', 'qa', 'backend'],        capacityHours: 150 },
];

// ============================================================
// Policy parameters: indicative, not ratified.
// Isolated here so the board can adjust them in one place.
// ============================================================
const DRAW_PCT = 50;              // percent of labor value paid as current cash draw
const COORDINATION_MARGIN = 0;    // percent added to labor when billing; 0 keeps current behavior
const PROPOSED_LABOR_WEIGHT = 40; // patronage formula labor weight, proposed

// ============================================================
// Hash chain helpers
// ============================================================
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const fmtCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtHours = (n) => `${Math.round(n)} h`;
const truncateHash = (h) => (h ? `${h.slice(0, 6)}\u2026` : '');

// ============================================================
// Sub-components
// ============================================================

function PanelHeader({ children }) {
  return (
    <div style={{ padding: '10px 14px 9px', borderBottom: `1px solid ${t.border}`, fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.faint, flexShrink: 0 }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.terra, opacity: 0.7, marginBottom: 6, marginTop: 2 }}>
      {children}
    </div>
  );
}

function TableHeader({ cols }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 52px 80px', gap: 8, padding: '0 12px 4px', marginBottom: 2 }}>
      {cols.map((c, i) => (
        <span key={i} style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.faint, textAlign: i > 0 ? 'right' : 'left' }}>{c}</span>
      ))}
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, display, hint }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontFamily: t.serif, fontSize: 12, fontWeight: 700, color: t.text }}>{label}</span>
        <span style={{ fontFamily: t.mono, fontSize: 12, color: t.terra }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%' }} />
      <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginTop: 3 }}>{hint}</div>
    </div>
  );
}

function StatLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>{label}</span>
      <span style={{ fontFamily: t.mono, fontSize: 13, color: t.terra }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 7, padding: '8px 10px' }}>
      <div style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.faint, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: t.mono, fontSize: 14, color: t.white }}>{value}</div>
    </div>
  );
}

function InvoiceLine({ label, value, em }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: t.serif, fontSize: em ? 13 : 11.5, color: em ? t.white : t.text, fontWeight: em ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: t.mono, fontSize: em ? 14 : 12, color: t.terra, fontWeight: em ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function PaymentOption({ label, detail, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: active ? t.terraDim : t.surfaceDeep, border: `1px solid ${active ? t.terraBorder : t.border}`, borderRadius: 7, fontFamily: t.serif, color: t.text }}>
      <div style={{ fontFamily: t.serif, fontSize: 12, fontWeight: 700, color: t.white, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: t.mono, fontSize: 10, color: t.faint }}>{detail}</div>
    </button>
  );
}

function EconLine({ label, note, value, accent, footer }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: footer ? 'none' : `1px solid ${t.border}`, gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.serif, fontSize: footer ? 13 : 12, color: footer ? t.white : t.text, fontWeight: footer ? 700 : 400 }}>{label}</div>
        {note && <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginTop: 2, lineHeight: 1.5 }}>{note}</div>}
      </div>
      <div style={{ fontFamily: t.mono, fontSize: footer ? 14 : 12, color: accent || t.terra, whiteSpace: 'nowrap', fontWeight: footer ? 700 : 400, flexShrink: 0 }}>{value}</div>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export default function ScenarioEngine() {
  const [projectName, setProjectName] = useState('');
  const [orgName, setOrgName]         = useState('');
  const [email, setEmail]             = useState('');
  const [patternId, setPatternId]     = useState('webapp');
  const [tierId, setTierId]           = useState('standard');
  const [complexity, setComplexity]   = useState(1);
  const [horizon, setHorizon]         = useState(12);
  const [maintPct, setMaintPct]       = useState(8);
  const [chain, setChain]             = useState([]);
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [payMethod, setPayMethod]     = useState('stripe');
  const [rightTab, setRightTab]       = useState('results');
  const [midTab, setMidTab]           = useState('breakdown');

  const pattern = PATTERNS[patternId];
  const tier    = TIERS.find((x) => x.id === tierId);

  // --------------------------------------------------------
  // Buyer-facing computation
  // --------------------------------------------------------
  const computation = useMemo(() => {
    const roleRows = Object.entries(pattern.hours).map(([roleKey, baseHours]) => {
      const role = ROLES[roleKey];
      const hours = baseHours * complexity;
      const subtotal = hours * role.rate;
      return { key: roleKey, role: role.name, rate: role.rate, hours, subtotal, blurb: role.blurb };
    });
    const totalHours  = roleRows.reduce((s, r) => s + r.hours, 0);
    const laborCost   = roleRows.reduce((s, r) => s + r.subtotal, 0);
    const infraItems  = pattern.infra[tierId];
    const monthlyInfra = infraItems.reduce((s, i) => s + i.monthly, 0);
    const monthlyMaint = laborCost * maintPct / 100 / 12;
    const monthlyOngoing = monthlyInfra + monthlyMaint;
    const ongoingTotal   = monthlyOngoing * horizon;
    const grandTotal     = laborCost + ongoingTotal;
    return { roleRows, totalHours, laborCost, infraItems, monthlyInfra, monthlyMaint, monthlyOngoing, ongoingTotal, grandTotal };
  }, [patternId, tierId, complexity, horizon, maintPct]);

  // --------------------------------------------------------
  // Members' side: roster allocation and cooperative economics
  // Reads from computation; does not mutate it.
  // --------------------------------------------------------
  const memberView = useMemo(() => {
    const allocated = {};
    const remaining = {};
    ROSTER.forEach((m) => { allocated[m.id] = {}; remaining[m.id] = m.capacityHours; });

    const coveredHoursByRole = {};

    computation.roleRows.forEach((row) => {
      const eligible = ROSTER.filter((m) => m.roles.includes(row.key) && remaining[m.id] > 0);
      const totalCap = eligible.reduce((s, m) => s + remaining[m.id], 0);
      coveredHoursByRole[row.key] = 0;
      if (totalCap === 0) return;

      // Proportional pass
      eligible.forEach((m) => {
        const share = row.hours * (remaining[m.id] / totalCap);
        const take  = Math.min(share, remaining[m.id]);
        allocated[m.id][row.key] = (allocated[m.id][row.key] || 0) + take;
        remaining[m.id] -= take;
        coveredHoursByRole[row.key] += take;
      });

      // Settling pass: absorb rounding/cap residue
      let residue = row.hours - coveredHoursByRole[row.key];
      if (residue > 0.001) {
        for (const m of eligible) {
          if (residue <= 0.001) break;
          if (remaining[m.id] > 0.001) {
            const take = Math.min(residue, remaining[m.id]);
            allocated[m.id][row.key] = (allocated[m.id][row.key] || 0) + take;
            remaining[m.id] -= take;
            coveredHoursByRole[row.key] += take;
            residue -= take;
          }
        }
      }
    });

    const coveredHours   = Object.values(coveredHoursByRole).reduce((s, h) => s + h, 0);
    const uncoveredHours = Math.max(0, computation.totalHours - coveredHours);
    const coveragePct    = computation.totalHours > 0 ? coveredHours / computation.totalHours : 0;

    const perMember = ROSTER.map((m) => {
      const alloc       = allocated[m.id];
      const hours       = Object.values(alloc).reduce((s, h) => s + h, 0);
      const laborValue  = Object.entries(alloc).reduce((s, [k, h]) => s + h * ROLES[k].rate, 0);
      const rolesEngaged = Object.keys(alloc).filter((k) => (alloc[k] || 0) > 0.01);
      return { ...m, hours, laborValue, rolesEngaged };
    }).filter((m) => m.hours > 0.01);

    const memberLaborValueTotal = perMember.reduce((s, m) => s + m.laborValue, 0);

    const perMemberWithWeight = perMember.map((m) => ({
      ...m,
      laborWeightShare: memberLaborValueTotal > 0 ? m.laborValue / memberLaborValueTotal : 0,
    }));

    // Blended rate for uncovered roles
    let blendedUncoveredRate = 0;
    const uncoveredRoleHours = computation.roleRows.reduce((s, r) => {
      return s + Math.max(0, r.hours - (coveredHoursByRole[r.key] || 0));
    }, 0);
    if (uncoveredRoleHours > 0) {
      const weightedRateSum = computation.roleRows.reduce((s, r) => {
        const uncov = Math.max(0, r.hours - (coveredHoursByRole[r.key] || 0));
        return s + uncov * r.rate;
      }, 0);
      blendedUncoveredRate = weightedRateSum / uncoveredRoleHours;
    }

    const revenue        = computation.grandTotal * (1 + COORDINATION_MARGIN / 100);
    const currentDraw    = memberLaborValueTotal * (DRAW_PCT / 100);
    const heldCredit     = memberLaborValueTotal - currentDraw;
    const infraCost      = computation.ongoingTotal;
    const contractorCost = uncoveredHours * blendedUncoveredRate;
    const retainedSurplus = revenue - currentDraw - infraCost - contractorCost;

    return {
      coveredHours, uncoveredHours, coveragePct,
      perMember: perMemberWithWeight,
      memberLaborValueTotal,
      currentDraw, heldCredit, infraCost, contractorCost, retainedSurplus, revenue,
      staffedCount: perMemberWithWeight.length,
    };
  }, [computation]);

  // --------------------------------------------------------
  // Availability: derived from roster coverage
  // --------------------------------------------------------
  const availability = useMemo(() => {
    const { coveragePct, coveredHours, uncoveredHours, staffedCount } = memberView;
    if (coveragePct >= 1.0) {
      return {
        status: 'available',
        label: 'Capacity available',
        color: t.green,
        detail: `${fmtHours(coveredHours)} covered across ${staffedCount} member${staffedCount !== 1 ? 's' : ''}. Ready to begin.`,
      };
    }
    if (coveragePct >= 0.6) {
      return {
        status: 'partial',
        label: 'Partial capacity',
        color: t.amber,
        detail: `${fmtHours(uncoveredHours)} uncovered. Staged start or contractor fill required.`,
      };
    }
    return {
      status: 'queued',
      label: 'Queued pending capacity',
      color: t.red,
      detail: `${fmtHours(uncoveredHours)} unstaffed. Planning conversation required before work can begin.`,
    };
  }, [memberView]);

  // --------------------------------------------------------
  // Hash chain
  // --------------------------------------------------------
  useEffect(() => {
    const event = {
      event: 'scenario_composed',
      project: projectName || 'untitled',
      pattern: patternId, tier: tierId, complexity, horizon,
      total: computation.grandTotal,
      timestamp: new Date().toISOString(),
    };
    const prior  = chain.length > 0 ? chain[chain.length - 1].hash : 'genesis';
    const payload = JSON.stringify({ ...event, prior });
    sha256(payload).then((hash) => {
      setChain((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].payload === payload) return prev;
        return [...prev, { ...event, prior, hash, payload }].slice(-8);
      });
    });
  }, [patternId, tierId, complexity, horizon, projectName]);

  const requestInvoice = async () => {
    const event = {
      event: 'preauth_requested',
      project: projectName || 'untitled',
      customer: { organization: orgName, email },
      pattern: patternId, tier: tierId,
      total: computation.grandTotal,
      timestamp: new Date().toISOString(),
    };
    const prior  = chain.length > 0 ? chain[chain.length - 1].hash : 'genesis';
    const payload = JSON.stringify({ ...event, prior });
    const hash   = await sha256(payload);
    setChain((prev) => [...prev, { ...event, prior, hash, payload }].slice(-8));
    setInvoiceRequested(true);
    setRightTab('invoice');
  };

  const invoiceRef = useMemo(() => {
    const last = chain[chain.length - 1];
    return last ? `BUILD-${last.hash.slice(0, 6).toUpperCase()}` : 'BUILD-PENDING';
  }, [chain]);

  // --------------------------------------------------------
  // Render
  // --------------------------------------------------------
  return (
    <>
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ display: 'grid', gridTemplateRows: '48px 1fr', height: '100vh', background: t.bg, fontFamily: t.serif, color: t.text, fontSize: 14, lineHeight: 1.65, overflow: 'hidden' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: `1px solid ${t.border}`, padding: '0 0 0 20px', overflow: 'hidden' }}>
          <div style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.terra, opacity: 0.7, flexShrink: 0 }}>techne.institute / build</div>
          <div style={{ width: 1, height: 20, background: t.border, margin: '0 16px', flexShrink: 0 }} />
          <div style={{ fontFamily: t.serif, fontSize: 13, fontWeight: 700, color: t.white, flexShrink: 0 }}>Scenario Engine</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8, padding: '0 16px', alignItems: 'center', borderLeft: `1px solid ${t.border}` }}>
            <input type="text" placeholder="Project name"       value={projectName} onChange={(e) => setProjectName(e.target.value)} style={{ width: 180 }} />
            <input type="text" placeholder="Organization"       value={orgName}     onChange={(e) => setOrgName(e.target.value)}     style={{ width: 160 }} />
            <input type="text" placeholder="Email (for invoice)" value={email}      onChange={(e) => setEmail(e.target.value)}        style={{ width: 200 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderLeft: `1px solid ${t.border}`, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: availability.color, boxShadow: `0 0 8px ${availability.color}` }} />
            <span style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>{availability.label}</span>
          </div>
        </div>

        {/* ── Three-panel grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', overflow: 'hidden' }}>

          {/* ── Left: Configure ── */}
          <div style={{ borderRight: `1px solid ${t.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PanelHeader>Configure</PanelHeader>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 16px' }}>

              <SectionLabel>Pattern</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {Object.values(PATTERNS).map((p) => {
                  const active = p.id === patternId;
                  const Icon   = p.icon;
                  return (
                    <button key={p.id} onClick={() => setPatternId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: active ? t.terraDim : 'transparent', border: `1px solid ${active ? t.terraBorder : 'transparent'}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.15s, border-color 0.15s' }}>
                      <div style={{ padding: 5, borderRadius: 5, background: active ? 'rgba(196,149,106,0.18)' : t.surface, color: active ? t.terra : t.muted, display: 'flex', flexShrink: 0 }}>
                        <Icon size={13} strokeWidth={1.5} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: t.serif, fontSize: 12.5, fontWeight: 700, color: active ? t.white : t.text, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontFamily: t.mono, fontSize: 9.5, color: active ? t.terra : t.faint, opacity: active ? 0.8 : 1, letterSpacing: '0.04em' }}>{p.complexity}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <SectionLabel>Infrastructure</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {TIERS.map((tier) => {
                  const active = tier.id === tierId;
                  return (
                    <button key={tier.id} onClick={() => setTierId(tier.id)} style={{ padding: '8px 10px', textAlign: 'left', width: '100%', cursor: 'pointer', background: active ? t.terraDim : 'transparent', border: `1px solid ${active ? t.terraBorder : 'transparent'}`, borderRadius: 7, transition: 'background 0.15s' }}>
                      <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? t.terra : t.muted, marginBottom: 2 }}>{tier.name}</div>
                      <div style={{ fontFamily: t.mono, fontSize: 10, color: t.faint, lineHeight: 1.5 }}>{tier.desc}</div>
                    </button>
                  );
                })}
              </div>

              <SectionLabel>Calibration</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SliderField label="Complexity"  value={complexity} onChange={setComplexity}              min={0.8} max={1.5} step={0.05} display={`${complexity.toFixed(2)}\u00d7`} hint="0.8 = simpler \u00b7 1.5 = more involved" />
                <SliderField label="Horizon"     value={horizon}    onChange={(v) => setHorizon(parseInt(v))} min={6}   max={36} step={3}    display={`${horizon} mo`}                hint="Months of ongoing costs quoted" />
                <SliderField label="Maintenance" value={maintPct}   onChange={(v) => setMaintPct(parseInt(v))} min={4}   max={20} step={1}    display={`${maintPct}%`}                 hint="Annual maint. as % of build labor" />
              </div>
            </div>
          </div>

          {/* ── Middle: Breakdown / Members ── */}
          <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.border}` }}>
            {/* Middle tab bar */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
              {[['breakdown', 'Breakdown'], ['members', 'Members']].map(([id, label]) => (
                <button key={id} onClick={() => setMidTab(id)} style={{ flex: 1, padding: '12px 0', fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: midTab === id ? t.terra : t.faint, background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: midTab === id ? `1px solid ${t.terra}` : '1px solid transparent', marginBottom: -1, transition: 'color 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>

              {/* ── Breakdown tab ── */}
              {midTab === 'breakdown' && (
                <>
                  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: t.serif, fontSize: 13.5, fontWeight: 700, color: t.white }}>{pattern.name}</span>
                      <span style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.terra, opacity: 0.7 }}>{pattern.complexity}</span>
                    </div>
                    <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, color: t.muted }}>{pattern.tagline}</div>
                  </div>

                  <TableHeader cols={['Role', 'Rate', 'Hours', 'Subtotal']} />
                  <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                    {computation.roleRows.map((row, i) => (
                      <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 52px 80px', borderBottom: i < computation.roleRows.length - 1 ? `1px solid ${t.border}` : 'none', padding: '8px 12px', gap: 8, alignItems: 'start' }}>
                        <div>
                          <div style={{ fontFamily: t.serif, fontSize: 12.5, color: t.white }}>{row.role}</div>
                          <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, lineHeight: 1.5, marginTop: 1 }}>{row.blurb}</div>
                        </div>
                        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.muted, textAlign: 'right', paddingTop: 1 }}>${row.rate}</div>
                        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.text, textAlign: 'right', paddingTop: 1 }}>{fmtHours(row.hours)}</div>
                        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.terra, textAlign: 'right', paddingTop: 1 }}>{fmtCurrency(row.subtotal)}</div>
                      </div>
                    ))}
                  </div>

                  <SectionLabel>Infrastructure</SectionLabel>
                  <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                    {computation.infraItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: i < computation.infraItems.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.text }}>{item.name}</span>
                        <span style={{ fontFamily: t.mono, fontSize: 11, color: item.monthly === 0 ? t.faint : t.muted }}>
                          {item.monthly === 0 ? 'free' : `${fmtCurrency(item.monthly)}/mo`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, lineHeight: 1.7, padding: '10px 12px', background: t.surface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                    Complexity multiplier is applied to labor only. Infrastructure runs{' '}
                    <em style={{ color: t.text }}>kept alive</em>. Move the complexity slider to see how scope changes the total.
                  </div>
                </>
              )}

              {/* ── Members tab ── */}
              {midTab === 'members' && (
                <>
                  {/* Indicative notice */}
                  <div style={{ display: 'flex', alignItems: 'start', gap: 8, padding: '10px 12px', background: t.surfaceDeep, border: `1px solid ${t.border}`, borderRadius: 8, marginBottom: 14 }}>
                    <Info size={12} strokeWidth={1.5} style={{ color: t.terra, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontFamily: t.mono, fontSize: 10, color: t.faint, lineHeight: 1.6 }}>
                      The same scenario read from the cooperative's side. Figures are{' '}
                      <em style={{ color: t.muted }}>indicative</em>{' '}
                      pending a ratified compensation policy.
                    </div>
                  </div>

                  {/* Coverage */}
                  <SectionLabel>Coverage</SectionLabel>
                  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: t.serif, fontSize: 13, color: t.white }}>
                        {fmtHours(memberView.coveredHours)} covered of {fmtHours(computation.totalHours)}
                      </span>
                      <span style={{ fontFamily: t.mono, fontSize: 13, color: memberView.coveragePct >= 1 ? t.green : memberView.coveragePct >= 0.6 ? t.amber : t.red, fontWeight: 700 }}>
                        {Math.round(memberView.coveragePct * 100)}%
                      </span>
                    </div>
                    {memberView.uncoveredHours > 0.5 && (
                      <div style={{ fontFamily: t.mono, fontSize: 10, color: t.red, lineHeight: 1.5 }}>
                        {fmtHours(memberView.uncoveredHours)} uncovered &mdash; contractor fill or staged start required.
                      </div>
                    )}
                  </div>

                  {/* Allocation table */}
                  <SectionLabel>Allocation</SectionLabel>
                  <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${t.border}`, background: t.surfaceDeep }}>
                      {['Member', 'Roles', 'Hours', 'Labor value'].map((col, i) => (
                        <span key={col} style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.faint, textAlign: i > 0 ? 'right' : 'left' }}>{col}</span>
                      ))}
                    </div>
                    {memberView.perMember.length === 0 ? (
                      <div style={{ padding: '16px 12px', fontFamily: t.mono, fontSize: 11, color: t.faint, textAlign: 'center' }}>No roster members match this scenario's roles.</div>
                    ) : (
                      memberView.perMember.map((m, i) => (
                        <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px', gap: 8, padding: '8px 12px', borderBottom: i < memberView.perMember.length - 1 ? `1px solid ${t.border}` : 'none', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontFamily: t.serif, fontSize: 12, color: t.white }}>{m.name}</div>
                            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginTop: 1 }}>{Math.round(m.laborWeightShare * 100)}% labor weight</div>
                          </div>
                          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.muted, textAlign: 'right', paddingTop: 1, lineHeight: 1.5 }}>{m.rolesEngaged.map((r) => ROLES[r]?.name || r).join(', ')}</div>
                          <div style={{ fontFamily: t.mono, fontSize: 11, color: t.text, textAlign: 'right', paddingTop: 1 }}>{fmtHours(m.hours)}</div>
                          <div style={{ fontFamily: t.mono, fontSize: 11, color: t.terra, textAlign: 'right', paddingTop: 1 }}>{fmtCurrency(m.laborValue)}</div>
                        </div>
                      ))
                    )}
                    {/* Footer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px', gap: 8, padding: '8px 12px', borderTop: `1px solid ${t.border}`, background: t.surfaceDeep }}>
                      <span style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.muted }}>Total covered</span>
                      <span />
                      <span style={{ fontFamily: t.mono, fontSize: 11, color: t.text, textAlign: 'right' }}>{fmtHours(memberView.coveredHours)}</span>
                      <span style={{ fontFamily: t.mono, fontSize: 11, color: t.white, fontWeight: 700, textAlign: 'right' }}>{fmtCurrency(memberView.memberLaborValueTotal)}</span>
                    </div>
                  </div>

                  {/* Where the value goes */}
                  <SectionLabel>Where the value goes</SectionLabel>
                  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                    <EconLine label="Current cash draw to members" note={`${DRAW_PCT}% of covered labor value`}          value={fmtCurrency(memberView.currentDraw)}    accent={t.green} />
                    <EconLine label="Medium-term member credit held"  note="Held until balance distribution"              value={fmtCurrency(memberView.heldCredit)} />
                    <EconLine label="Infrastructure cost over horizon" note={`${horizon} months`}                         value={fmtCurrency(memberView.infraCost)} />
                    {memberView.contractorCost > 0 && (
                      <EconLine label="Contractor fill (uncovered work)" note={`${fmtHours(memberView.uncoveredHours)} at blended rate`} value={fmtCurrency(memberView.contractorCost)} accent={t.red} />
                    )}
                    <EconLine label="Retained cooperative surplus" footer value={fmtCurrency(memberView.retainedSurplus)} accent={memberView.retainedSurplus >= 0 ? t.terra : t.red} />
                  </div>
                  <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, lineHeight: 1.7, padding: '8px 12px', background: t.surfaceDeep, borderRadius: 7, border: `1px solid ${t.border}` }}>
                    <em style={{ color: t.muted }}>Indicative.</em> Patronage formula proposes a labor weight of {PROPOSED_LABOR_WEIGHT}%. Not yet ratified by the board.
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ── Right: Totals / Invoice / Audit ── */}
          <div style={{ borderLeft: `1px solid ${t.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
              {[['results', 'Totals'], ['invoice', 'Invoice'], ['chain', 'Audit']].map(([id, label]) => (
                <button key={id} onClick={() => setRightTab(id)} style={{ flex: 1, padding: '12px 0', fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: rightTab === id ? t.terra : t.faint, background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: rightTab === id ? `1px solid ${t.terra}` : '1px solid transparent', marginBottom: -1, transition: 'color 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 16px' }}>

              {/* ── Totals tab ── */}
              {rightTab === 'results' && (
                <>
                  <div style={{ background: `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})`, border: `1px solid ${t.terraBorder}`, borderRadius: 10, padding: '16px 16px 14px', marginBottom: 12 }}>
                    <StatLine label="One-time build"    value={fmtCurrency(computation.laborCost)} />
                    <div style={{ height: 1, background: t.border, margin: '10px 0' }} />
                    <StatLine label="Monthly ongoing"   value={`${fmtCurrency(computation.monthlyOngoing)}/mo`} />
                    <StatLine label={`Over ${horizon} months`} value={fmtCurrency(computation.ongoingTotal)} />
                    <div style={{ height: 1, background: t.terraBorder, margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.muted }}>Grand total</div>
                      <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 700, color: t.terra, lineHeight: 1.2 }}>{fmtCurrency(computation.grandTotal)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'start', gap: 10, padding: '12px 14px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: availability.color, boxShadow: `0 0 8px ${availability.color}`, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: availability.color, marginBottom: 3 }}>{availability.label}</div>
                      <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.muted, lineHeight: 1.6 }}>{availability.detail}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <StatCard label="Total hours"   value={fmtHours(computation.totalHours)} />
                    <StatCard label="Roles engaged" value={`${computation.roleRows.length}`} />
                    <StatCard label="Infra items"   value={`${computation.infraItems.length}`} />
                    <StatCard label="Pattern"       value={pattern.name.split(' ')[0]} />
                  </div>

                  <button onClick={requestInvoice} disabled={!projectName || !email} style={{ width: '100%', padding: '12px 16px', background: !projectName || !email ? t.surfaceDeep : t.terra, color: !projectName || !email ? t.faint : t.bg, border: `1px solid ${!projectName || !email ? t.border : t.terra}`, borderRadius: 8, fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: !projectName || !email ? 'not-allowed' : 'pointer', transition: 'background 0.2s, color 0.2s' }}>
                    {invoiceRequested ? 'Invoice requested \u2713' : 'Request pre-authorized invoice'}
                  </button>
                  {(!projectName || !email) && (
                    <div style={{ fontFamily: t.mono, fontSize: 10, color: t.faint, marginTop: 8, textAlign: 'center', letterSpacing: '0.04em' }}>Add project name and email above</div>
                  )}
                </>
              )}

              {/* ── Invoice tab ── */}
              {rightTab === 'invoice' && (
                <>
                  {invoiceRequested ? (
                    <div>
                      <div style={{ background: t.surface, border: `1px solid ${t.terraBorder}`, borderRadius: 10, padding: '16px', marginBottom: 12 }}>
                        <div style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.terra, marginBottom: 4 }}>Pre-authorized invoice</div>
                        <div style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 700, color: t.white, marginBottom: 12 }}>{invoiceRef}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
                          <div>
                            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Bill to</div>
                            <div style={{ fontFamily: t.serif, fontSize: 12.5, color: t.white }}>{orgName || projectName}</div>
                            <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.text }}>{email}</div>
                          </div>
                          <div>
                            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Scope</div>
                            <div style={{ fontFamily: t.serif, fontSize: 12.5, color: t.white }}>{pattern.name}</div>
                            <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.text }}>{tier.name} &middot; {horizon} mo</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                          <InvoiceLine label="Build labor"                      value={fmtCurrency(computation.laborCost)} />
                          <InvoiceLine label={`Infra + maintenance, ${horizon} mo`} value={fmtCurrency(computation.ongoingTotal)} />
                          <div style={{ height: 1, background: t.terraBorder, margin: '4px 0' }} />
                          <InvoiceLine label="Total due on kickoff"             value={fmtCurrency(computation.grandTotal)} em />
                        </div>
                        <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment method</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                          <PaymentOption id="stripe"  label="Stripe"      detail="Card. 3% absorbed."  active={payMethod === 'stripe'}  onClick={() => setPayMethod('stripe')} />
                          <PaymentOption id="mercury" label="Mercury ACH" detail="Direct. No fee."     active={payMethod === 'mercury'} onClick={() => setPayMethod('mercury')} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'start', gap: 8, padding: '10px 12px', background: t.surfaceDeep, border: `1px solid ${t.border}`, borderRadius: 7, fontFamily: t.mono, fontSize: 10.5, color: t.muted, lineHeight: 1.6 }}>
                          <Wrench size={13} strokeWidth={2} style={{ color: t.terra, flexShrink: 0, marginTop: 1 }} />
                          <div>Pending countersignature. Confirmation + payment link within two business days at <span style={{ color: t.text }}>{email}</span>.</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, textAlign: 'center' }}>RegenHub, LCA &middot; Boulder, Colorado &middot; Pricing locked 14 days</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                      <div style={{ fontFamily: t.mono, fontSize: 11, color: t.faint, marginBottom: 20, lineHeight: 1.7 }}>Configure your scenario and fill in the project fields, then request a pre-authorized invoice.</div>
                      <button onClick={requestInvoice} disabled={!projectName || !email} style={{ padding: '11px 20px', background: !projectName || !email ? t.surfaceDeep : t.terra, color: !projectName || !email ? t.faint : t.bg, border: `1px solid ${!projectName || !email ? t.border : t.terra}`, borderRadius: 8, fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: !projectName || !email ? 'not-allowed' : 'pointer' }}>
                        Request invoice
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── Audit / Chain tab ── */}
              {rightTab === 'chain' && (
                <>
                  <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, letterSpacing: '0.06em', lineHeight: 1.7, marginBottom: 12 }}>
                    Each configuration change writes a hash record chained to the prior. The chain cannot be silently revised. Root hashes are periodically published to Base.
                  </div>
                  <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    {chain.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontFamily: t.mono, fontSize: 11, color: t.faint }}>Awaiting configuration.</div>
                    ) : (
                      [...chain].reverse().map((entry, i) => (
                        <div key={i} style={{ padding: '10px 12px', borderBottom: i < chain.length - 1 ? `1px solid ${t.border}` : 'none', display: 'flex', alignItems: 'start', gap: 10 }}>
                          <div style={{ padding: 4, borderRadius: 5, background: t.terraDim, color: t.terra, display: 'flex', flexShrink: 0, marginTop: 1 }}>
                            <Hash size={11} strokeWidth={1.5} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: t.mono, fontSize: 9.5, letterSpacing: '0.08em', color: t.terra, textTransform: 'uppercase', marginBottom: 2 }}>{entry.event.replace(/_/g, ' ')}</div>
                            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.text, wordBreak: 'break-all', lineHeight: 1.4 }}>{entry.hash}</div>
                            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginTop: 2 }}>prior: {entry.prior === 'genesis' ? 'genesis' : truncateHash(entry.prior)} &middot; {new Date(entry.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

            </div>
            <div style={{ borderTop: `1px solid ${t.border}`, padding: '8px 16px', fontFamily: t.mono, fontSize: 9.5, color: t.faint, letterSpacing: '0.06em' }}>
              RegenHub, LCA &middot; Boulder &middot; 2026 &middot; Numbers are indicative
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
