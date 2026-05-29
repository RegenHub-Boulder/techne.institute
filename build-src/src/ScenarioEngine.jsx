import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Sprout, Server, Cloud, Cpu, Network, ChevronRight, Check, Hash, FileText, Users, Wrench } from 'lucide-react';

// ============================================================
// Design tokens from the co-op.us design system
// ============================================================
const t = {
  bg: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceDeep: 'rgba(0,0,0,0.2)',
  border: '#333333',
  terra: '#c4956a',
  terraDim: 'rgba(196,149,106,0.15)',
  terraGlow: 'rgba(196,149,106,0.06)',
  terraBorder: 'rgba(196,149,106,0.2)',
  white: '#e8e0d8',
  text: '#d4d4d4',
  muted: '#999999',
  faint: '#666666',
  serif: "'Libre Baskerville', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

// ============================================================
// Labor taxonomy: FMV rates per role (USD / hour)
// ============================================================
const ROLES = {
  design: { name: 'Design', rate: 165, blurb: 'Information architecture, interaction design, and the visual system that carries the product.' },
  frontend: { name: 'Frontend', rate: 175, blurb: 'Implementation of the visible surface in HTML, CSS, and JavaScript, with attention to accessibility and performance.' },
  backend: { name: 'Backend', rate: 195, blurb: 'Server-side application logic, database schema, authentication, and the quiet machinery underneath the surface.' },
  devops: { name: 'DevOps', rate: 210, blurb: 'Deployment pipelines, monitoring, incident response, and the operational discipline that keeps a system alive.' },
  data: { name: 'Data engineering', rate: 215, blurb: 'Pipelines, warehousing, schema design, and the standing work of moving data from source to use.' },
  ml: { name: 'ML engineering', rate: 245, blurb: 'Model training, inference infrastructure, and the evaluation loops that keep model behavior honest.' },
  qa: { name: 'Quality', rate: 135, blurb: 'Test design, regression coverage, and accessibility verification across the delivery lifecycle.' },
  product: { name: 'Product', rate: 185, blurb: 'Scope shepherding, stakeholder communication, and the delivery rhythm that brings the engagement through to completion.' },
  content: { name: 'Content', rate: 125, blurb: 'Copywriting, editorial review, and the content operations that shape how a system is read.' },
  research: { name: 'Research', rate: 225, blurb: 'User research, mechanism design, and the structured inquiry that grounds design decisions in evidence.' },
};

// ============================================================
// Pattern library: each pattern defines baseline labor hours per role
// and an infrastructure profile
// ============================================================
const PATTERNS = {
  static: {
    id: 'static',
    name: 'Static page',
    tagline: 'A single page or a small multi-page site.',
    description: 'Informational, no database, no authenticated users. Suited for announcements, portfolios, single-purpose landing pages. Fast to build, inexpensive to operate, graceful in its limits.',
    icon: Sprout,
    complexity: 'low',
    hours: { design: 18, frontend: 22, content: 8, product: 4 },
    infra: {
      lean: [{ name: 'Static hosting (Cloudflare Pages)', monthly: 0 }, { name: 'Domain registration', monthly: 2 }, { name: 'Email forwarding', monthly: 0 }],
      standard: [{ name: 'Managed hosting (Vercel)', monthly: 20 }, { name: 'Domain registration', monthly: 2 }, { name: 'Form handling service', monthly: 10 }, { name: 'Analytics', monthly: 12 }],
      sovereign: [{ name: 'Cooperative node (Boulder)', monthly: 40 }, { name: 'Domain registration', monthly: 2 }, { name: 'Backup and snapshots', monthly: 15 }, { name: 'Monitoring', monthly: 10 }],
    },
  },
  content: {
    id: 'content',
    name: 'Content site',
    tagline: 'Editorially managed, CMS-backed.',
    description: 'A site whose content changes regularly, maintained by non-developers. Suited for publications, organizational websites, program archives. The ongoing work shifts from engineering to editorial, which the infrastructure has to support.',
    icon: FileText,
    complexity: 'low-mid',
    hours: { design: 40, frontend: 60, backend: 28, content: 24, devops: 12, product: 10, qa: 8 },
    infra: {
      lean: [{ name: 'Headless CMS (free tier)', monthly: 0 }, { name: 'Static hosting', monthly: 0 }, { name: 'Domain + DNS', monthly: 3 }, { name: 'Image CDN', monthly: 15 }],
      standard: [{ name: 'Headless CMS (team tier)', monthly: 99 }, { name: 'Managed hosting', monthly: 40 }, { name: 'Image CDN', monthly: 25 }, { name: 'Analytics and search', monthly: 45 }, { name: 'Domain + DNS', monthly: 3 }],
      sovereign: [{ name: 'Cooperative node with self-hosted CMS', monthly: 85 }, { name: 'Object storage', monthly: 20 }, { name: 'CDN layer', monthly: 30 }, { name: 'Monitoring and backup', monthly: 25 }, { name: 'Domain + DNS', monthly: 3 }],
    },
  },
  webapp: {
    id: 'webapp',
    name: 'Web application',
    tagline: 'Authenticated, single-tenant, stateful.',
    description: 'Users have accounts, data persists across sessions, and the experience is more than a document. Suited for internal tools, member portals, purpose-built applications for a defined user group. The ongoing work covers real operational concerns: uptime, security, data integrity.',
    icon: Layers,
    complexity: 'mid',
    hours: { design: 80, frontend: 160, backend: 140, devops: 36, qa: 28, product: 28, content: 8 },
    infra: {
      lean: [{ name: 'Managed PaaS (free tier)', monthly: 0 }, { name: 'Managed Postgres (small)', monthly: 25 }, { name: 'Object storage', monthly: 10 }, { name: 'Email service', monthly: 15 }, { name: 'Domain + SSL', monthly: 3 }],
      standard: [{ name: 'Managed PaaS (production)', monthly: 90 }, { name: 'Managed Postgres (medium)', monthly: 120 }, { name: 'Object storage', monthly: 25 }, { name: 'Email service', monthly: 35 }, { name: 'Monitoring + logging', monthly: 55 }, { name: 'Backup tier', monthly: 25 }, { name: 'Domain + SSL', monthly: 3 }],
      sovereign: [{ name: 'Cooperative node (Hetzner dedicated)', monthly: 120 }, { name: 'Self-hosted Postgres with replication', monthly: 45 }, { name: 'Object storage (MinIO)', monthly: 30 }, { name: 'Self-hosted email relay', monthly: 25 }, { name: 'Monitoring stack', monthly: 20 }, { name: 'Offsite backup', monthly: 35 }, { name: 'Domain + SSL', monthly: 3 }],
    },
  },
  saas: {
    id: 'saas',
    name: 'SaaS platform',
    tagline: 'Multi-tenant, billing, admin tools.',
    description: 'Customers are organizations, not individuals. Billing integrates with Stripe, administrative tools support customer success, and the infrastructure carries traffic from many tenants at once. The operational discipline required is substantially higher than a single-tenant application.',
    icon: Network,
    complexity: 'mid-high',
    hours: { design: 130, frontend: 260, backend: 300, devops: 90, qa: 85, product: 65, data: 40, content: 20 },
    infra: {
      lean: [{ name: 'Managed PaaS', monthly: 150 }, { name: 'Managed Postgres (production)', monthly: 200 }, { name: 'Stripe integration (3% of GMV)', monthly: 0 }, { name: 'Email at scale', monthly: 85 }, { name: 'Monitoring and logs', monthly: 90 }, { name: 'Domain + SSL', monthly: 3 }],
      standard: [{ name: 'Managed PaaS (scaled)', monthly: 280 }, { name: 'Managed Postgres (HA)', monthly: 380 }, { name: 'Redis cache', monthly: 45 }, { name: 'Email infrastructure', monthly: 145 }, { name: 'Monitoring, logging, alerting', monthly: 165 }, { name: 'Backup and disaster recovery', monthly: 75 }, { name: 'Domain + SSL', monthly: 3 }],
      sovereign: [{ name: 'Cooperative cluster (multi-node)', monthly: 420 }, { name: 'Self-hosted Postgres HA', monthly: 120 }, { name: 'Redis and queue infrastructure', monthly: 45 }, { name: 'Email relay with authentication', monthly: 65 }, { name: 'Self-hosted monitoring (Grafana stack)', monthly: 50 }, { name: 'Offsite backup with encryption', monthly: 85 }, { name: 'Domain + SSL', monthly: 3 }],
    },
  },
  data: {
    id: 'data',
    name: 'Data platform',
    tagline: 'Ingestion, processing, dashboards.',
    description: 'Data arrives on schedules or in streams, gets processed and enriched, and surfaces as dashboards, reports, or APIs. Suited for organizations whose work is organized around data: research programs, civic analytics, internal intelligence. The labor pool shifts toward data engineering and analytics.',
    icon: Cpu,
    complexity: 'high',
    hours: { design: 60, frontend: 120, backend: 140, data: 220, devops: 80, ml: 40, qa: 50, product: 45, research: 25 },
    infra: {
      lean: [{ name: 'Managed warehouse (dev tier)', monthly: 80 }, { name: 'Pipeline orchestration', monthly: 40 }, { name: 'Object storage for raw data', monthly: 30 }, { name: 'Dashboard hosting', monthly: 25 }, { name: 'Domain + SSL', monthly: 3 }],
      standard: [{ name: 'Managed warehouse (production)', monthly: 400 }, { name: 'Orchestration (Airflow or Prefect)', monthly: 95 }, { name: 'Object storage (tiered)', monthly: 85 }, { name: 'Dashboard platform', monthly: 95 }, { name: 'Monitoring and data quality', monthly: 75 }, { name: 'Domain + SSL', monthly: 3 }],
      sovereign: [{ name: 'Cooperative data node', monthly: 280 }, { name: 'Self-hosted orchestration', monthly: 35 }, { name: 'Object storage cluster', monthly: 65 }, { name: 'Self-hosted dashboard (Metabase)', monthly: 30 }, { name: 'Monitoring stack', monthly: 45 }, { name: 'Offsite backup', monthly: 55 }, { name: 'Domain + SSL', monthly: 3 }],
    },
  },
  distributed: {
    id: 'distributed',
    name: 'Distributed system',
    tagline: 'Multi-service, possibly multi-modal, chain-adjacent.',
    description: 'Several services working together, possibly with AI inference, on-chain settlement, or real-time coordination. Suited for mechanism-design work, agentic systems, or platforms where the coordination is itself the product. Requires senior judgment across the full stack.',
    icon: Server,
    complexity: 'high',
    hours: { design: 100, frontend: 220, backend: 340, devops: 170, data: 180, ml: 180, qa: 110, product: 85, research: 90 },
    infra: {
      lean: [{ name: 'Container platform (managed)', monthly: 180 }, { name: 'Managed Postgres and Redis', monthly: 220 }, { name: 'Object storage', monthly: 45 }, { name: 'Inference API (pay-per-use)', monthly: 400 }, { name: 'Base RPC and chain tooling', monthly: 50 }, { name: 'Monitoring', monthly: 85 }, { name: 'Domain + SSL', monthly: 3 }],
      standard: [{ name: 'Container orchestration (scaled)', monthly: 480 }, { name: 'Managed Postgres HA and Redis', monthly: 520 }, { name: 'Object storage and CDN', monthly: 145 }, { name: 'Inference infrastructure', monthly: 1200 }, { name: 'Base RPC with redundancy', monthly: 120 }, { name: 'Observability stack', monthly: 220 }, { name: 'Backup and disaster recovery', monthly: 135 }, { name: 'Domain + SSL', monthly: 3 }],
      sovereign: [{ name: 'Cooperative cluster (multi-region)', monthly: 680 }, { name: 'Self-hosted Postgres and Redis with replication', monthly: 165 }, { name: 'Object storage cluster', monthly: 95 }, { name: 'Self-hosted inference (GPU leased)', monthly: 780 }, { name: 'Self-hosted Base node', monthly: 90 }, { name: 'Observability stack', monthly: 60 }, { name: 'Offsite backup with encryption', monthly: 115 }, { name: 'Domain + SSL', monthly: 3 }],
    },
  },
};

const TIERS = [
  { id: 'lean', name: 'Lean', description: 'Managed services at free or low tiers. Suited for early, lightly-trafficked, or experimental systems.' },
  { id: 'standard', name: 'Standard', description: 'Production-grade managed services. Suited for real users and real uptime expectations.' },
  { id: 'sovereign', name: 'Sovereign', description: 'Self-hosted on cooperative infrastructure. Suited for organizations that want to own what they run.' },
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
const DRAW_PCT = 50;            // percent of labor value paid as current cash draw
const COORDINATION_MARGIN = 0;  // percent added to labor when billing; 0 keeps current behavior
const PROPOSED_LABOR_WEIGHT = 40; // patronage formula labor weight, proposed

// ============================================================
// Hash chain: append-only log of scenario events.
// Uses SubtleCrypto for real SHA-256 in the browser.
// ============================================================
async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================
// Helpers
// ============================================================
const fmtCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtHours = (h) => `${Math.round(h)} h`;
const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : '';

// ============================================================
// Presentational primitives
// ============================================================
const Label = ({ children }) => (
  <span style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.terra, opacity: 0.85 }}>
    {children}
  </span>
);

const Rule = () => (
  <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${t.terra}, transparent)`, margin: '18px 0 28px' }} />
);

const SectionHeading = ({ number, label, title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <Label>{number} · {label}</Label>
    <Rule />
    <h2 style={{ fontFamily: t.serif, fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: t.white, marginBottom: 12 }}>
      {title}
    </h2>
    {children && <p style={{ color: t.muted, fontSize: 14.5, lineHeight: 1.75 }}>{children}</p>}
  </div>
);

// ============================================================
// Main component
// ============================================================
export default function ScenarioEngine() {
  const [projectName, setProjectName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [patternId, setPatternId] = useState('webapp');
  const [tierId, setTierId] = useState('standard');
  const [complexity, setComplexity] = useState(1.0);
  const [horizon, setHorizon] = useState(12);
  const [maintenancePct, setMaintenancePct] = useState(8);
  const [chain, setChain] = useState([]);
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [paymentRail, setPaymentRail] = useState('stripe');

  const pattern = PATTERNS[patternId];
  const tier = TIERS.find((x) => x.id === tierId);

  // --------------------------------------------------------
  // Derived computation (buyer-facing)
  // --------------------------------------------------------
  const computation = useMemo(() => {
    const roleRows = Object.entries(pattern.hours).map(([roleKey, baseHours]) => {
      const role = ROLES[roleKey];
      const adjustedHours = baseHours * complexity;
      const subtotal = adjustedHours * role.rate;
      return { key: roleKey, role: role.name, rate: role.rate, hours: adjustedHours, subtotal, blurb: role.blurb };
    });
    const totalHours = roleRows.reduce((s, r) => s + r.hours, 0);
    const laborCost = roleRows.reduce((s, r) => s + r.subtotal, 0);
    const infraItems = pattern.infra[tierId];
    const monthlyInfra = infraItems.reduce((s, x) => s + x.monthly, 0);
    const monthlyMaintenance = (laborCost * maintenancePct) / 100 / 12;
    const monthlyOngoing = monthlyInfra + monthlyMaintenance;
    const ongoingOverHorizon = monthlyOngoing * horizon;
    const grandTotal = laborCost + ongoingOverHorizon;
    return { roleRows, totalHours, laborCost, infraItems, monthlyInfra, monthlyMaintenance, monthlyOngoing, ongoingOverHorizon, grandTotal };
  }, [patternId, tierId, complexity, horizon, maintenancePct]);

  // --------------------------------------------------------
  // Members' side: roster allocation and cooperative economics
  // Reads from computation; does not mutate it.
  // --------------------------------------------------------
  const memberView = useMemo(() => {
    // -- Allocation --
    const allocated = {};  // memberId -> { roleKey -> hours }
    const remaining = {};  // memberId -> remaining capacity

    ROSTER.forEach((m) => {
      allocated[m.id] = {};
      remaining[m.id] = m.capacityHours;
    });

    const coveredHoursByRole = {};

    computation.roleRows.forEach((row) => {
      const eligible = ROSTER.filter((m) => m.roles.includes(row.key) && remaining[m.id] > 0);
      const totalEligibleCap = eligible.reduce((s, m) => s + remaining[m.id], 0);
      coveredHoursByRole[row.key] = 0;

      if (totalEligibleCap === 0) return;

      // Proportional pass
      eligible.forEach((m) => {
        const share = row.hours * (remaining[m.id] / totalEligibleCap);
        const take = Math.min(share, remaining[m.id]);
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

    // -- Derived figures --
    const coveredHours = Object.values(coveredHoursByRole).reduce((s, h) => s + h, 0);
    const uncoveredHours = Math.max(0, computation.totalHours - coveredHours);
    const coveragePct = computation.totalHours > 0 ? coveredHours / computation.totalHours : 0;

    const perMember = ROSTER.map((m) => {
      const memberAlloc = allocated[m.id];
      const hours = Object.values(memberAlloc).reduce((s, h) => s + h, 0);
      const laborValue = Object.entries(memberAlloc).reduce((s, [roleKey, h]) => {
        return s + h * ROLES[roleKey].rate;
      }, 0);
      const rolesEngaged = Object.keys(memberAlloc).filter((k) => (memberAlloc[k] || 0) > 0.01);
      return { ...m, hours, laborValue, rolesEngaged };
    }).filter((m) => m.hours > 0.01);

    const memberLaborValueTotal = perMember.reduce((s, m) => s + m.laborValue, 0);

    const perMemberWithWeight = perMember.map((m) => ({
      ...m,
      laborWeightShare: memberLaborValueTotal > 0 ? m.laborValue / memberLaborValueTotal : 0,
    }));

    // -- Blended rate for uncovered roles --
    let blendedUncoveredRate = 0;
    const uncoveredRoleHours = computation.roleRows.reduce((s, r) => {
      return s + Math.max(0, r.hours - (coveredHoursByRole[r.key] || 0));
    }, 0);
    if (uncoveredRoleHours > 0) {
      const weightedRateSum = computation.roleRows.reduce((s, r) => {
        const uh = Math.max(0, r.hours - (coveredHoursByRole[r.key] || 0));
        return s + r.rate * uh;
      }, 0);
      blendedUncoveredRate = weightedRateSum / uncoveredRoleHours;
    }

    // -- Cooperative economics (indicative) --
    const revenue = computation.grandTotal * (1 + COORDINATION_MARGIN / 100);
    const currentDraw = memberLaborValueTotal * (DRAW_PCT / 100);
    const heldCredit = memberLaborValueTotal - currentDraw;
    const infraCost = computation.ongoingOverHorizon;
    const contractorCost = uncoveredHours * blendedUncoveredRate;
    const retainedSurplus = revenue - currentDraw - infraCost - contractorCost;

    return {
      coveredHours,
      uncoveredHours,
      coveragePct,
      perMember: perMemberWithWeight,
      memberLaborValueTotal,
      currentDraw,
      heldCredit,
      infraCost,
      contractorCost,
      retainedSurplus,
      revenue,
    };
  }, [computation]);

  // --------------------------------------------------------
  // Availability: roster-derived, replacing the prior mock
  // --------------------------------------------------------
  const availability = useMemo(() => {
    const { coveragePct, coveredHours, uncoveredHours, perMember } = memberView;
    const staffedCount = perMember.length;
    const totalHours = computation.totalHours;

    if (coveragePct >= 1.0) {
      return {
        status: 'available',
        label: 'Capacity available',
        detail: `${fmtHours(coveredHours)} covered across ${staffedCount} member${staffedCount !== 1 ? 's' : ''}. The current roster can staff this engagement without additional hiring.`,
      };
    }
    if (coveragePct >= 0.6) {
      return {
        status: 'partial',
        label: 'Partial capacity',
        detail: `${fmtHours(coveredHours)} of ${fmtHours(totalHours)} covered by ${staffedCount} member${staffedCount !== 1 ? 's' : ''}. ${fmtHours(uncoveredHours)} would require additional staffing or a staged timeline.`,
      };
    }
    return {
      status: 'queued',
      label: 'Queued pending capacity',
      detail: `${fmtHours(uncoveredHours)} of ${fmtHours(totalHours)} are not covered by the current roster. A planning conversation would establish a workable start window.`,
    };
  }, [memberView, computation.totalHours]);

  const availabilityColor = availability.status === 'available' ? '#7fb56a' : availability.status === 'partial' ? t.terra : '#b56a6a';

  // --------------------------------------------------------
  // Chain: append a hash each time the scenario materially changes
  // --------------------------------------------------------
  useEffect(() => {
    const record = {
      event: 'scenario_composed',
      project: projectName || 'untitled',
      pattern: patternId,
      tier: tierId,
      complexity,
      horizon,
      total: computation.grandTotal,
      timestamp: new Date().toISOString(),
    };
    const prior = chain.length > 0 ? chain[chain.length - 1].hash : 'genesis';
    const payload = JSON.stringify({ ...record, prior });
    sha256(payload).then((hash) => {
      setChain((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].payload === payload) return prev;
        const entry = { ...record, prior, hash, payload };
        const next = [...prev, entry];
        return next.slice(-8);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternId, tierId, complexity, horizon, projectName]);

  // --------------------------------------------------------
  // Request pre-authorized invoice
  // --------------------------------------------------------
  const requestInvoice = async () => {
    const record = {
      event: 'preauth_requested',
      project: projectName || 'untitled',
      customer: { organization, email },
      pattern: patternId,
      tier: tierId,
      total: computation.grandTotal,
      timestamp: new Date().toISOString(),
    };
    const prior = chain.length > 0 ? chain[chain.length - 1].hash : 'genesis';
    const payload = JSON.stringify({ ...record, prior });
    const hash = await sha256(payload);
    setChain((prev) => [...prev, { ...record, prior, hash, payload }].slice(-8));
    setInvoiceRequested(true);
  };

  const invoiceNumber = useMemo(() => {
    const last = chain[chain.length - 1];
    return last ? `BUILD-${last.hash.slice(0, 6).toUpperCase()}` : 'BUILD-PENDING';
  }, [chain]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: t.serif, color: t.text, fontSize: 15.5, lineHeight: 1.75 }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;1,300;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 128px' }}>

        {/* ================= HEADER ================= */}
        <header style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.08em', color: t.muted, marginBottom: 24 }}>
            techne.institute / build
          </div>
          <Label>Digital tool builder</Label>
          <Rule />
          <h1 style={{ fontFamily: t.serif, fontSize: 'clamp(32px, 6vw, 46px)', fontWeight: 700, lineHeight: 1.15, color: t.white, marginBottom: 20, letterSpacing: '-0.01em' }}>
            Estimate the labor and infrastructure of building a digital thing.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: t.muted }}>
            A working model of how a cooperative of practitioners would shape, price, and commit to the construction of your project. Configure a scenario below. The totals update as you move. When the shape is right, request a pre-authorized invoice.
          </p>
        </header>

        {/* ================= PROJECT INPUT ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="01" label="Your project" title="Tell us what you are building.">
            Three plain fields. Nothing is committed until you request an invoice.
          </SectionHeading>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28 }}>
            <FieldGroup>
              <Field label="Project name" placeholder="A working title is fine" value={projectName} onChange={setProjectName} />
              <Field label="Organization (optional)" placeholder="Who is commissioning the work" value={organization} onChange={setOrganization} />
              <Field label="Email (for the invoice)" placeholder="name@organization" value={email} onChange={setEmail} />
            </FieldGroup>
          </div>
        </section>

        {/* ================= PATTERN SELECTION ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="02" label="Pattern" title="Choose the shape of the system.">
            Six patterns cover most of what the cooperative builds. If your project does not fit any of these, keep configuring; we will route unusual scenarios through a planning conversation at the end.
          </SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {Object.values(PATTERNS).map((p) => {
              const active = p.id === patternId;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setPatternId(p.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})` : t.surface,
                    border: `1px solid ${active ? t.terraBorder : t.border}`,
                    borderRadius: 12,
                    padding: '22px 22px',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s ease, background 0.3s ease',
                    fontFamily: t.serif,
                    color: t.text,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ padding: 8, borderRadius: 8, background: t.terraDim, color: t.terra, display: 'flex' }}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.terra, opacity: 0.75 }}>
                      {p.complexity}
                    </div>
                  </div>
                  <div style={{ fontFamily: t.serif, fontSize: 17, fontWeight: 700, color: t.white, marginBottom: 6 }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 13, color: t.muted, marginBottom: 10 }}>
                    {p.tagline}
                  </div>
                  <div style={{ fontFamily: t.mono, fontSize: 11.5, lineHeight: 1.7, color: t.text }}>
                    {p.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= CONFIGURATION ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="03" label="Calibration" title="Tune the scope.">
            Three dials. Complexity adjusts the baseline hours for your project's specific shape. Infrastructure tier chooses how the system runs. Horizon sets how long the ongoing costs accumulate against the total.
          </SectionHeading>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 16 }}>
            <SliderRow
              label="Complexity multiplier"
              monoHint="0.8 = simpler than baseline · 1.5 = substantially more involved"
              value={complexity}
              onChange={setComplexity}
              min={0.8}
              max={1.5}
              step={0.05}
              displayValue={`${complexity.toFixed(2)}×`}
            />
            <SliderRow
              label="Ongoing horizon (months)"
              monoHint="How long we quote the ongoing costs against the total. Doesn't commit you to the term."
              value={horizon}
              onChange={(v) => setHorizon(parseInt(v))}
              min={6}
              max={36}
              step={3}
              displayValue={`${horizon} mo`}
            />
            <SliderRow
              label="Maintenance allocation"
              monoHint="Annual maintenance labor as a percentage of build labor. Covers bug fixes, small improvements, security updates."
              value={maintenancePct}
              onChange={(v) => setMaintenancePct(parseInt(v))}
              min={4}
              max={20}
              step={1}
              displayValue={`${maintenancePct}%`}
              last
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {TIERS.map((x) => {
              const active = x.id === tierId;
              return (
                <button
                  key={x.id}
                  onClick={() => setTierId(x.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})` : t.surface,
                    border: `1px solid ${active ? t.terraBorder : t.border}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s ease',
                    fontFamily: t.serif,
                    color: t.text,
                  }}
                >
                  <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.terra, opacity: 0.75, marginBottom: 8 }}>
                    Infrastructure · {x.name}
                  </div>
                  <div style={{ fontFamily: t.mono, fontSize: 11.5, lineHeight: 1.7, color: t.text }}>
                    {x.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= AVAILABILITY ================= */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            background: `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})`,
            border: `1px solid ${t.terraBorder}`,
            borderRadius: 14,
            padding: '26px 28px',
            display: 'flex',
            alignItems: 'start',
            gap: 18,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: availabilityColor, marginTop: 8, flexShrink: 0,
              boxShadow: `0 0 12px ${availabilityColor}`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.terra, opacity: 0.85, marginBottom: 6 }}>
                Member capacity
              </div>
              <div style={{ fontFamily: t.serif, fontSize: 17, color: t.white, fontWeight: 700, marginBottom: 6 }}>
                {availability.label}
              </div>
              <div style={{ fontFamily: t.mono, fontSize: 12.5, lineHeight: 1.7, color: t.text }}>
                {availability.detail}
              </div>
            </div>
          </div>
        </section>

        {/* ================= COST BREAKDOWN ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="04" label="Breakdown" title="Where the money goes.">
            The labor table shows the roles and hours that go into building your project at the current configuration. The infrastructure table shows the line items that keep it running. Both are illustrative commitments, not estimates from the outside.
          </SectionHeading>

          {/* Labor table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 10 }}>
              Labor (one-time build)
            </div>
            <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden', background: t.surface }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.mono, fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: 'rgba(196,149,106,0.03)', borderBottom: `1px solid ${t.terraBorder}` }}>
                    <TH>Role</TH>
                    <TH align="right">Rate</TH>
                    <TH align="right">Hours</TH>
                    <TH align="right">Subtotal</TH>
                  </tr>
                </thead>
                <tbody>
                  {computation.roleRows.map((r) => (
                    <tr key={r.key} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: '11px 14px', color: t.text }}>
                        <div style={{ color: t.white }}>{r.role}</div>
                        <div style={{ fontSize: 11, color: t.faint, marginTop: 2, lineHeight: 1.5 }}>{r.blurb}</div>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', color: t.text, whiteSpace: 'nowrap' }}>${r.rate}/hr</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', color: t.text, whiteSpace: 'nowrap' }}>{fmtHours(r.hours)}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', color: t.terra, whiteSpace: 'nowrap' }}>{fmtCurrency(r.subtotal)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(196,149,106,0.05)' }}>
                    <td style={{ padding: '14px', color: t.white, fontWeight: 700 }}>Labor total</td>
                    <td></td>
                    <td style={{ padding: '14px', textAlign: 'right', color: t.white, whiteSpace: 'nowrap' }}>{fmtHours(computation.totalHours)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', color: t.terra, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtCurrency(computation.laborCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Infrastructure table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 10 }}>
              Infrastructure ({tier.name} tier, monthly)
            </div>
            <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden', background: t.surface }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.mono, fontSize: 12.5 }}>
                <tbody>
                  {computation.infraItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                      <td style={{ padding: '11px 14px', color: t.text }}>{item.name}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', color: t.terra, whiteSpace: 'nowrap' }}>{item.monthly === 0 ? 'free tier' : `${fmtCurrency(item.monthly)}/mo`}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '11px 14px', color: t.text, fontStyle: 'italic' }}>
                      <div style={{ color: t.white, fontStyle: 'normal' }}>Ongoing maintenance labor</div>
                      <div style={{ fontSize: 11, color: t.faint, marginTop: 2, fontStyle: 'normal', lineHeight: 1.5 }}>
                        {maintenancePct}% of build labor, distributed across the year.
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: t.terra, whiteSpace: 'nowrap' }}>{fmtCurrency(computation.monthlyMaintenance)}/mo</td>
                  </tr>
                  <tr style={{ background: 'rgba(196,149,106,0.05)' }}>
                    <td style={{ padding: '14px', color: t.white, fontWeight: 700 }}>Monthly ongoing</td>
                    <td style={{ padding: '14px', textAlign: 'right', color: t.terra, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtCurrency(computation.monthlyOngoing)}/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= TOTALS ================= */}
        <section style={{ marginBottom: 56 }}>
          <div style={{
            background: `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})`,
            border: `1px solid ${t.terraBorder}`,
            borderRadius: 16,
            padding: '32px 30px',
          }}>
            <Label>Scenario total</Label>
            <Rule />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, marginTop: 8 }}>
              <TotalTile label="One-time build" value={fmtCurrency(computation.laborCost)} />
              <TotalTile label="Ongoing monthly" value={`${fmtCurrency(computation.monthlyOngoing)}/mo`} />
              <TotalTile label={`Over ${horizon} months`} value={fmtCurrency(computation.ongoingOverHorizon)} />
              <TotalTile label="Grand total" value={fmtCurrency(computation.grandTotal)} emphasis />
            </div>
          </div>
        </section>

        {/* ================= MEMBERS' SIDE ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="05" label="The members' side" title="Who does the work, and what it returns.">
            The same scenario read from the cooperative's side. These figures are <em>indicative</em>, pending a ratified compensation policy.
          </SectionHeading>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* -- Coverage -- */}
            <div>
              <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 14 }}>
                Coverage
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{
                  fontFamily: t.mono,
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: memberView.coveragePct >= 1.0 ? '#7fb56a' : memberView.coveragePct >= 0.6 ? t.terra : '#b56a6a',
                }}>
                  {Math.round(memberView.coveragePct * 100)}%
                </div>
                <div>
                  <div style={{ fontFamily: t.serif, fontSize: 15, color: t.white, fontWeight: 700 }}>
                    {fmtHours(memberView.coveredHours)} covered of {fmtHours(computation.totalHours)} total
                  </div>
                  {memberView.uncoveredHours > 0.5 ? (
                    <div style={{ fontFamily: t.mono, fontSize: 12, color: '#b56a6a', marginTop: 4 }}>
                      {fmtHours(memberView.uncoveredHours)} not covered by current roster
                    </div>
                  ) : (
                    <div style={{ fontFamily: t.mono, fontSize: 12, color: '#7fb56a', marginTop: 4 }}>
                      Full roster coverage at current configuration
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: t.border }} />

            {/* -- Allocation table -- */}
            <div>
              <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 14 }}>
                Allocation
              </div>
              {memberView.perMember.length === 0 ? (
                <div style={{ fontFamily: t.mono, fontSize: 12.5, color: t.faint, padding: '14px 0', lineHeight: 1.65 }}>
                  No roster members are eligible for the roles in this scenario.
                </div>
              ) : (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.mono, fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: 'rgba(196,149,106,0.03)', borderBottom: `1px solid ${t.terraBorder}` }}>
                        <TH>Member</TH>
                        <TH>Roles</TH>
                        <TH align="right">Hours</TH>
                        <TH align="right">Labor value</TH>
                        <TH align="right">Labor weight</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {memberView.perMember.map((m) => (
                        <tr key={m.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: '11px 14px', color: t.white, whiteSpace: 'nowrap' }}>{m.name}</td>
                          <td style={{ padding: '11px 14px', color: t.text, fontSize: 11.5, lineHeight: 1.5 }}>
                            {m.rolesEngaged.map((k) => ROLES[k].name).join(', ')}
                          </td>
                          <td style={{ padding: '11px 14px', textAlign: 'right', color: t.text, whiteSpace: 'nowrap' }}>
                            {fmtHours(m.hours)}
                          </td>
                          <td style={{ padding: '11px 14px', textAlign: 'right', color: t.terra, whiteSpace: 'nowrap' }}>
                            {fmtCurrency(m.laborValue)}
                          </td>
                          <td style={{ padding: '11px 14px', textAlign: 'right', color: t.muted, whiteSpace: 'nowrap' }}>
                            {Math.round(m.laborWeightShare * 100)}%
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(196,149,106,0.05)' }}>
                        <td style={{ padding: '14px', color: t.white, fontWeight: 700 }} colSpan={3}>
                          Covered labor total
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', color: t.terra, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {fmtCurrency(memberView.memberLaborValueTotal)}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', color: t.muted }}>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ height: 1, background: t.border }} />

            {/* -- Where the value goes -- */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted }}>
                  Where the value goes
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.faint, fontStyle: 'italic' }}>
                  Indicative. Labor weight proposed at {PROPOSED_LABOR_WEIGHT}%, not ratified.
                </div>
              </div>
              <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <EconLine
                  label="Current cash draw to members"
                  note={`${DRAW_PCT}% of covered labor value, paid on delivery`}
                  value={fmtCurrency(memberView.currentDraw)}
                />
                <EconLine
                  label="Medium-term credit held"
                  note={`${100 - DRAW_PCT}% retained as member credit`}
                  value={fmtCurrency(memberView.heldCredit)}
                />
                <EconLine
                  label="Infrastructure cost"
                  note={`${horizon}-month horizon`}
                  value={fmtCurrency(memberView.infraCost)}
                />
                {memberView.contractorCost > 0 && (
                  <EconLine
                    label="Contractor cost for uncovered work"
                    note={`${fmtHours(memberView.uncoveredHours)} at blended rate`}
                    value={fmtCurrency(memberView.contractorCost)}
                    accent="#b56a6a"
                  />
                )}
                <EconLine
                  label="Retained cooperative surplus"
                  note="Revenue minus draw, infrastructure, and contractor"
                  value={fmtCurrency(memberView.retainedSurplus)}
                  accent={memberView.retainedSurplus >= 0 ? '#7fb56a' : '#b56a6a'}
                  footer
                />
              </div>
            </div>

          </div>
        </section>

        {/* ================= PRE-AUTHORIZATION ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="06" label="Pre-authorization" title="Commit the scenario to paper.">
            When the shape is right, request a pre-authorized invoice. Operations staff will verify member availability and countersign within two business days. The invoice is paid through Stripe or Mercury after final approval.
          </SectionHeading>

          {!invoiceRequested ? (
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, textAlign: 'center' }}>
              <button
                onClick={requestInvoice}
                disabled={!projectName || !email}
                style={{
                  background: (!projectName || !email) ? t.surfaceDeep : t.terra,
                  color: (!projectName || !email) ? t.faint : t.bg,
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 28px',
                  fontFamily: t.mono,
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: (!projectName || !email) ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  transition: 'opacity 0.2s',
                }}
              >
                Request pre-authorized invoice
              </button>
              {(!projectName || !email) && (
                <div style={{ fontFamily: t.mono, fontSize: 11, color: t.faint, marginTop: 14, letterSpacing: '0.05em' }}>
                  Add a project name and email above to continue.
                </div>
              )}
            </div>
          ) : (
            <InvoicePreview
              invoiceNumber={invoiceNumber}
              projectName={projectName}
              organization={organization}
              email={email}
              pattern={pattern}
              tier={tier}
              computation={computation}
              horizon={horizon}
              paymentRail={paymentRail}
              setPaymentRail={setPaymentRail}
            />
          )}
        </section>

        {/* ================= MERKLE CHAIN ================= */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeading number="07" label="Audit chain" title="Every configuration writes a hash.">
            Each material change writes an append-only record whose hash depends on the hash of the prior record. The chain cannot be silently revised. Root hashes are periodically published to Base for public verifiability.
          </SectionHeading>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '4px 0', overflow: 'hidden' }}>
            {chain.length === 0 && (
              <div style={{ padding: 28, textAlign: 'center', fontFamily: t.mono, fontSize: 12, color: t.faint }}>
                Awaiting configuration.
              </div>
            )}
            {chain.map((entry, i) => (
              <div key={i} style={{ padding: '16px 22px', borderBottom: i === chain.length - 1 ? 'none' : `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ padding: 6, borderRadius: 6, background: t.terraDim, color: t.terra, display: 'flex', flexShrink: 0 }}>
                  <Hash size={14} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.08em', color: t.terra, marginBottom: 3, textTransform: 'uppercase' }}>
                    {entry.event.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontFamily: t.mono, fontSize: 11.5, color: t.text, wordBreak: 'break-all' }}>
                    {entry.hash}
                  </div>
                  <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.faint, marginTop: 3 }}>
                    prior: {entry.prior === 'genesis' ? 'genesis' : shortHash(entry.prior)} · {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= LEARNER ================= */}
        <section style={{ marginBottom: 32 }}>
          <SectionHeading number="08" label="Why it costs this" title="How to read the numbers.">
            A note for anyone using this engine to learn rather than commission.
          </SectionHeading>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28 }}>
            <p style={{ marginBottom: 18 }}>
              Software costs what it costs because building it requires hours of attention from people with specific training, and running it requires the quiet expense of servers, storage, and services. The engine makes both visible. When you move the complexity slider, you are adjusting how much attention the project will require. When you change the infrastructure tier, you are choosing between rented convenience and self-hosted control.
            </p>
            <p style={{ marginBottom: 18 }}>
              Most digital products you use were built by teams organized along the same role lines the engine uses here. The rates are what senior independent practitioners charge on the Front Range in 2026. Different markets have different rates; the shape of the labor is broadly consistent.
            </p>
            <p>
              The ongoing cost is the part most new commissioners underestimate. A website is not built and finished; it is built and <em>kept alive</em>. The maintenance allocation accounts for this honestly. A project budgeted without it tends to quietly degrade over the year after it launches.
            </p>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer style={{ marginTop: 72, paddingTop: 24, borderTop: `1px solid ${t.border}`, textAlign: 'center', fontFamily: t.mono, fontSize: 11, letterSpacing: '0.05em', color: t.faint }}>
          <div style={{ marginBottom: 6 }}>techne.institute / build · RegenHub, LCA · Boulder, Colorado · 2026</div>
          <div>A working model. Numbers are indicative. Engagements are priced in writing.</div>
        </footer>

      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function Field({ label, placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 8 }}>
        {label}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: t.surfaceDeep,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: '12px 14px',
          fontFamily: t.mono,
          fontSize: 13,
          color: t.text,
          outline: 'none',
        }}
        onFocus={(e) => e.target.style.borderColor = t.terraBorder}
        onBlur={(e) => e.target.style.borderColor = t.border}
      />
    </div>
  );
}

function FieldGroup({ children }) {
  return <div>{children}</div>;
}

function SliderRow({ label, monoHint, value, onChange, min, max, step, displayValue, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 22, paddingBottom: last ? 0 : 22, borderBottom: last ? 'none' : `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: t.serif, fontSize: 14.5, color: t.white, fontWeight: 700 }}>{label}</div>
        <div style={{ fontFamily: t.mono, fontSize: 13, color: t.terra }}>{displayValue}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: t.terra,
          height: 4,
        }}
      />
      <div style={{ fontFamily: t.mono, fontSize: 11, color: t.faint, marginTop: 6, lineHeight: 1.65 }}>
        {monoHint}
      </div>
    </div>
  );
}

function TotalTile({ label, value, emphasis }) {
  return (
    <div style={{
      padding: '4px 0',
    }}>
      <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        fontFamily: t.serif,
        fontSize: emphasis ? 26 : 20,
        fontWeight: 700,
        color: emphasis ? t.terra : t.white,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  );
}

function TH({ children, align }) {
  return (
    <th style={{
      padding: '12px 14px',
      textAlign: align || 'left',
      fontFamily: t.mono,
      fontSize: 10.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: t.muted,
      fontWeight: 400,
    }}>
      {children}
    </th>
  );
}

function EconLine({ label, note, value, accent, footer }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: footer ? 'none' : `1px solid ${t.border}`,
      background: footer ? 'rgba(196,149,106,0.03)' : 'transparent',
      gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.serif, fontSize: 14, color: footer ? t.white : t.text, fontWeight: footer ? 700 : 400 }}>
          {label}
        </div>
        {note && (
          <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.faint, marginTop: 2, lineHeight: 1.5 }}>
            {note}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: t.mono,
        fontSize: footer ? 15 : 13,
        color: accent || t.terra,
        whiteSpace: 'nowrap',
        fontWeight: footer ? 700 : 400,
        flexShrink: 0,
      }}>
        {value}
      </div>
    </div>
  );
}

function InvoicePreview({ invoiceNumber, projectName, organization, email, pattern, tier, computation, horizon, paymentRail, setPaymentRail }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.terraBorder}`, borderRadius: 14, padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: '0.14em', color: t.terra, marginBottom: 6, textTransform: 'uppercase' }}>
            Pre-authorized invoice
          </div>
          <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 700, color: t.white }}>
            {invoiceNumber}
          </div>
        </div>
        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.muted, textAlign: 'right' }}>
          RegenHub, LCA<br />
          Boulder, Colorado<br />
          Pricing locked 14 days
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${t.border}` }}>
        <div>
          <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.1em', color: t.muted, textTransform: 'uppercase', marginBottom: 4 }}>Bill to</div>
          <div style={{ fontFamily: t.serif, fontSize: 14.5, color: t.white }}>{organization || projectName}</div>
          <div style={{ fontFamily: t.mono, fontSize: 12, color: t.text }}>{email}</div>
        </div>
        <div>
          <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.1em', color: t.muted, textTransform: 'uppercase', marginBottom: 4 }}>Scope</div>
          <div style={{ fontFamily: t.serif, fontSize: 14.5, color: t.white }}>{pattern.name}</div>
          <div style={{ fontFamily: t.mono, fontSize: 12, color: t.text }}>{tier.name} infrastructure · {horizon}-month horizon</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <InvoiceLine label="Build labor" value={fmtCurrency(computation.laborCost)} />
        <InvoiceLine label={`Infrastructure and maintenance, ${horizon} months`} value={fmtCurrency(computation.ongoingOverHorizon)} />
        <div style={{ height: 1, background: t.terraBorder, margin: '10px 0' }} />
        <InvoiceLine label="Total due on kickoff" value={fmtCurrency(computation.grandTotal)} emphasis />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: '0.14em', color: t.muted, textTransform: 'uppercase', marginBottom: 10 }}>
          Payment method
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <PaymentOption id="stripe" label="Stripe" detail="Card or on-chain. 3% premium absorbed." active={paymentRail === 'stripe'} onClick={() => setPaymentRail('stripe')} />
          <PaymentOption id="mercury" label="Mercury ACH" detail="Direct debit. No fee premium." active={paymentRail === 'mercury'} onClick={() => setPaymentRail('mercury')} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: t.surfaceDeep, border: `1px solid ${t.border}`, borderRadius: 8, fontFamily: t.mono, fontSize: 12, color: t.muted, lineHeight: 1.6 }}>
        <Check size={16} strokeWidth={1.5} style={{ color: t.terra, flexShrink: 0 }} />
        <div>
          Pending countersignature from operations staff. You will receive confirmation and a payment link at <span style={{ color: t.white }}>{email}</span> within two business days.
        </div>
      </div>
    </div>
  );
}

function InvoiceLine({ label, value, emphasis }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: t.serif, fontSize: emphasis ? 16 : 14, color: emphasis ? t.white : t.text, fontWeight: emphasis ? 700 : 400 }}>
        {label}
      </div>
      <div style={{ fontFamily: t.mono, fontSize: emphasis ? 18 : 13, color: t.terra, fontWeight: emphasis ? 700 : 400 }}>
        {value}
      </div>
    </div>
  );
}

function PaymentOption({ label, detail, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `linear-gradient(135deg, ${t.surface}, ${t.terraGlow})` : t.surfaceDeep,
        border: `1px solid ${active ? t.terraBorder : t.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: t.serif,
        color: t.text,
      }}
    >
      <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 700, color: t.white, marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: t.mono, fontSize: 11, color: t.muted, lineHeight: 1.5 }}>{detail}</div>
    </button>
  );
}
