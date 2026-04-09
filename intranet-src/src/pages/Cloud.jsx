import { useState } from 'react'

// ---------------------------------------------------------------------------
// Scenario data
// ---------------------------------------------------------------------------
const SCENARIOS = {
  seed: {
    id: 'seed',
    label: 'Scenario A',
    name: 'Seed Array',
    tagline: 'Proof of concept — minimal viable cooperative cloud',
    hardware: [
      { item: 'Mac Mini M4 Pro (12-core, 48 GB RAM)', qty: 3, unitCost: 1399 },
      { item: 'Synology DS1823xs+ NAS (8-bay, 16 TB usable)', qty: 1, unitCost: 1200 },
      { item: '10 GbE managed switch', qty: 1, unitCost: 300 },
      { item: 'Rack, cables, UPS', qty: 1, unitCost: 600 },
    ],
    compute: { vcpu: 36, ramGb: 144, storageTb: 16 },
    power: { avgWatts: 75, monthlyKwh: 54 },
    solar: { roofPct: 2.2, fullyOffset: true, surplusKwh: 0 },
    cloudOutput: 8000,       // CLOUD credits/month at 70% utilization
    serviceValueUsd: 800,    // USD/month equivalent
    lca: {
      patronageClass: 'Service Patronage — Compute',
      allocationMethod: 'Pro-rata by redemption volume',
      taxTreatment: 'Subchapter T / IRC 1385 — patronage dividend',
      safeHarborNote: 'Service claim; not a financial instrument',
    },
  },
  growth: {
    id: 'growth',
    label: 'Scenario B',
    name: 'Growth Array',
    tagline: 'Full member services — compute, storage, AI inference',
    hardware: [
      { item: 'Mac Mini M4 Pro (12-core, 48 GB RAM)', qty: 10, unitCost: 1399 },
      { item: 'Synology DS1823xs+ NAS (8-bay, 20 TB usable)', qty: 2, unitCost: 1400 },
      { item: '10 GbE managed switch (48-port)', qty: 1, unitCost: 800 },
      { item: 'Rack, cables, UPS', qty: 1, unitCost: 1100 },
    ],
    compute: { vcpu: 120, ramGb: 480, storageTb: 40 },
    power: { avgWatts: 280, monthlyKwh: 202 },
    solar: { roofPct: 8.2, fullyOffset: true, surplusKwh: 0 },
    cloudOutput: 28000,
    serviceValueUsd: 2800,
    lca: {
      patronageClass: 'Service Patronage — Compute + Storage',
      allocationMethod: 'Pro-rata by redemption volume, quarterly',
      taxTreatment: 'Subchapter T / IRC 1385',
      safeHarborNote: 'Service claim; intersects R9 GENIUS Act analysis',
    },
  },
  roof: {
    id: 'roof',
    label: 'Scenario C',
    name: 'Full Roof Array',
    tagline: 'Solar-native maximum capacity — compute + export surplus',
    hardware: [
      { item: 'Mac Mini M4 Pro (12-core, 48 GB RAM)', qty: 40, unitCost: 1399 },
      { item: 'Synology RS3621xs+ 2U NAS (20 TB usable)', qty: 8, unitCost: 2200 },
      { item: '25 GbE managed switch (48-port)', qty: 2, unitCost: 2400 },
      { item: 'Rooftop solar (15 kW, 36 panels)', qty: 1, unitCost: 30000 },
      { item: 'Rack buildout, UPS, cooling', qty: 1, unitCost: 5400 },
    ],
    compute: { vcpu: 480, ramGb: 1920, storageTb: 160 },
    power: { avgWatts: 1100, monthlyKwh: 792 },
    solar: { roofPct: 100, fullyOffset: true, surplusKwh: 1683 },
    cloudOutput: 110000,
    serviceValueUsd: 11000,
    lca: {
      patronageClass: 'Service Patronage — Full Stack (Compute + Storage + Network)',
      allocationMethod: 'Pro-rata by redemption volume; solar surplus as additional patronage',
      taxTreatment: 'Subchapter T / IRC 1385; solar surplus may qualify as energy patronage',
      safeHarborNote: 'Service claim + physical-backing argument for GENIUS Act safe harbor (R9)',
    },
  },
}

const SOLAR_CAPACITY_KWH_MONTH = 2475 // 15 kW × 5.5 peak hrs × 30 days (Boulder, CO)
const CLOUD_UNIT_USD = 0.10           // 1 CLOUD = $0.10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtUsd(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function fmtNum(n) {
  return Number(n).toLocaleString('en-US')
}

function capEx(scenario) {
  return scenario.hardware.reduce((s, h) => s + h.qty * h.unitCost, 0)
}

function paybackMonths(scenario) {
  return Math.round(capEx(scenario) / scenario.serviceValueUsd)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function HardwareLine({ item, qty, unitCost }) {
  return (
    <tr>
      <td style={td}>{item}</td>
      <td style={{ ...td, ...num }}>{qty}×</td>
      <td style={{ ...td, ...num }}>{fmtUsd(unitCost)}</td>
      <td style={{ ...td, ...num, color: 'var(--text-page)' }}>{fmtUsd(qty * unitCost)}</td>
    </tr>
  )
}

function StatRow({ label, value, highlight }) {
  return (
    <div style={{ ...styles.statRow, ...(highlight ? styles.statRowHighlight : {}) }}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, ...(highlight ? { color: 'var(--gold)' } : {}) }}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Cloud() {
  const [active, setActive] = useState('seed')
  const sc = SCENARIOS[active]
  const totalCapEx = capEx(sc)

  return (
    <div style={styles.page}>

      <div style={styles.main}>

        {/* Breadcrumb */}
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span style={styles.breadCurrent}>Cloud Micro-Grid</span>
        </nav>

        {/* Page header */}
        <div style={styles.pageHeader}>
          <div style={styles.pageTag}>R13 · Infrastructure Research</div>
          <h1 style={styles.pageTitle}>Cloud Micro-Grid Scenario Model</h1>
          <p style={styles.pageSubtitle}>
            Three hardware configurations for a solar-powered cooperative compute array
            at 1515 Walnut. Each scenario shows CLOUD credit output, solar offset,
            and LCA patronage accounting implications.
          </p>
          <p style={styles.cloudNote}>
            <span style={styles.cloudBadge}>1 CLOUD = $0.10</span>
            {' '}Service credits issued as cooperative patronage.
            Redeemable against compute, storage, and network services.
          </p>
        </div>

        {/* Scenario selector tabs */}
        <div style={styles.tabBar}>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                ...styles.tab,
                ...(active === s.id ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabLabel}>{s.label}</span>
              <span style={styles.tabName}>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Scenario tagline */}
        <p style={styles.scenarioTagline}>{sc.tagline}</p>

        {/* Key metrics row */}
        <div style={styles.metricsRow}>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>CLOUD / month</div>
            <div style={styles.metricValue}>{fmtNum(sc.cloudOutput)}</div>
            <div style={styles.metricSub}>{fmtUsd(sc.serviceValueUsd)} service value</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Capital Required</div>
            <div style={styles.metricValue}>{fmtUsd(totalCapEx)}</div>
            <div style={styles.metricSub}>{paybackMonths(sc)} mo payback (at capacity)</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Solar Offset</div>
            <div style={styles.metricValue}>
              {sc.solar.fullyOffset ? '100%' : `${sc.solar.roofPct}%`}
            </div>
            <div style={styles.metricSub}>
              {sc.power.monthlyKwh} kWh/mo · {sc.solar.roofPct}% of roof
            </div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Compute</div>
            <div style={styles.metricValue}>{sc.compute.vcpu} vCPU</div>
            <div style={styles.metricSub}>{fmtNum(sc.compute.ramGb)} GB RAM · {sc.compute.storageTb} TB</div>
          </div>
        </div>

        {/* Two-column detail */}
        <div style={styles.detailGrid}>

          {/* Hardware BOM */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Hardware BOM</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: '50%' }}>Item</th>
                    <th style={{ ...th, ...num }}>Qty</th>
                    <th style={{ ...th, ...num }}>Unit</th>
                    <th style={{ ...th, ...num }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sc.hardware.map((h) => (
                    <HardwareLine key={h.item} {...h} />
                  ))}
                  <tr style={{ borderTop: '1px solid #2a2a35' }}>
                    <td style={{ ...td, color: 'var(--text-page)', fontWeight: 600 }} colSpan={3}>Total CapEx</td>
                    <td style={{ ...td, ...num, color: 'var(--gold)', fontWeight: 600 }}>{fmtUsd(totalCapEx)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Power + Solar */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Power &amp; Solar</div>
            <StatRow label="Average draw" value={`${sc.power.avgWatts} W`} />
            <StatRow label="Monthly consumption" value={`${sc.power.monthlyKwh} kWh`} />
            <StatRow
              label="Roof solar potential"
              value={`${SOLAR_CAPACITY_KWH_MONTH.toLocaleString()} kWh/mo`}
            />
            <StatRow label="Array share of roof" value={`${sc.solar.roofPct}%`} />
            <StatRow
              label="Solar covers array"
              value={sc.solar.fullyOffset ? 'Yes — 100% offset' : 'Partial'}
              highlight
            />
            {sc.solar.surplusKwh > 0 && (
              <StatRow
                label="Monthly solar surplus"
                value={`${fmtNum(sc.solar.surplusKwh)} kWh → grid export`}
                highlight
              />
            )}
            <div style={styles.solarNote}>
              Assumes 15 kW rooftop system at 5.5 peak sun hours/day (Boulder, CO avg).
              Array cost included in Scenario C CapEx only.
            </div>
          </div>

          {/* CLOUD credit model */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>CLOUD Credit Output</div>
            <StatRow label="vCPU-hours / month (70%)" value={fmtNum(Math.round(sc.compute.vcpu * 720 * 0.7))} />
            <StatRow label="Storage available" value={`${sc.compute.storageTb} TB`} />
            <StatRow label="Estimated service value" value={fmtUsd(sc.serviceValueUsd) + '/mo'} />
            <StatRow
              label="CLOUD credits issued / month"
              value={fmtNum(sc.cloudOutput)}
              highlight
            />
            <StatRow
              label="USD value per CLOUD"
              value={`$${CLOUD_UNIT_USD.toFixed(2)} (fixed)`}
            />
            <StatRow label="CapEx payback (at capacity)" value={`${paybackMonths(sc)} months`} />
            <div style={styles.solarNote}>
              CLOUD credits are patronage allocations under Colorado LCA Act §7-58-301.
              Issued quarterly based on member service redemptions.
              1 CLOUD = $0.10 claim on cooperative compute capacity.
            </div>
          </div>

          {/* LCA patronage accounting */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>LCA Patronage Accounting</div>
            <StatRow label="Patronage class" value={sc.lca.patronageClass} />
            <StatRow label="Allocation method" value={sc.lca.allocationMethod} />
            <StatRow label="Tax treatment" value={sc.lca.taxTreatment} />
            <StatRow label="Safe harbor framing" value={sc.lca.safeHarborNote} highlight />
            <div style={styles.solarNote}>
              Credits issued as written notices of allocation (IRC 1385).
              Members may redeem against services or retain as capital account credits.
              Intersection with R9 (GENIUS Act / CLOUD Token Safe Harbor) under analysis.
            </div>
          </div>

        </div>

        {/* Comparison table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>Scenario Comparison</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={th}>Dimension</th>
                  {Object.values(SCENARIOS).map((s) => (
                    <th
                      key={s.id}
                      style={{ ...th, ...num, color: active === s.id ? 'var(--gold)' : undefined }}
                    >
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'CapEx', fn: (s) => fmtUsd(capEx(s)) },
                  { label: 'vCPU', fn: (s) => fmtNum(s.compute.vcpu) },
                  { label: 'RAM (GB)', fn: (s) => fmtNum(s.compute.ramGb) },
                  { label: 'Storage (TB)', fn: (s) => s.compute.storageTb },
                  { label: 'Power (W)', fn: (s) => s.power.avgWatts },
                  { label: 'Monthly kWh', fn: (s) => s.power.monthlyKwh },
                  { label: 'Solar offset', fn: (s) => s.solar.fullyOffset ? '100%' : `${s.solar.roofPct}%` },
                  { label: 'CLOUD / month', fn: (s) => fmtNum(s.cloudOutput), highlight: true },
                  { label: 'Service value / mo', fn: (s) => fmtUsd(s.serviceValueUsd), highlight: true },
                  { label: 'Payback (months)', fn: (s) => paybackMonths(s) },
                ].map(({ label, fn, highlight }) => (
                  <tr key={label}>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{label}</td>
                    {Object.values(SCENARIOS).map((s) => (
                      <td
                        key={s.id}
                        style={{
                          ...td,
                          ...num,
                          color: active === s.id
                            ? (highlight ? 'var(--gold)' : 'var(--text-page)')
                            : 'var(--text-subdim)',
                          fontWeight: active === s.id ? 600 : 400,
                        }}
                      >
                        {fn(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Research notes */}
        <div style={styles.noticeBox}>
          <div style={styles.noticeTitle}>Research Case Study — R13</div>
          <p style={styles.noticeText}>
            This scenario model is part of an active LCA research case study exploring whether
            a Colorado Limited Cooperative Association can issue service credits backed by
            physical compute infrastructure. Key open questions include the GENIUS Act /
            CLOUD Token Safe Harbor classification (R9), on-chain attestation format,
            and integration with postage.protocol's stamp issuance layer.
          </p>
          <p style={{ ...styles.noticeText, marginBottom: 0 }}>
            Full public narrative: <a href="/cloud/" style={styles.noticeLink}>techne.institute/cloud/</a>
          </p>
        </div>

        {/* Footer nav */}
        <div style={styles.footerNav}>
          <a href="/intranet/" style={styles.footerNavLink}>← Home</a>
          <a href="/cloud/" style={styles.footerNavLink}>Public page →</a>
        </div>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  page: { background: 'var(--surface)', minHeight: '100vh', color: 'var(--text-warm)' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem' },
  breadLink: { color: 'var(--text-muted)', textDecoration: 'none' },
  breadSep: { color: 'var(--text-ghost)' },
  breadCurrent: { color: 'var(--text-warm)' },

  pageHeader: { marginBottom: '2.5rem' },
  pageTag: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' },
  pageTitle: { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--text-display)', letterSpacing: '-0.02em', margin: '0 0 0.75rem' },
  pageSubtitle: { fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 640, margin: '0 0 1rem' },
  cloudNote: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', color: 'var(--text-muted)' },
  cloudBadge: { background: 'rgba(196, 149, 106, 0.1)', color: 'var(--gold)', border: '1px solid rgba(196,149,106,0.2)', borderRadius: 4, padding: '0.15em 0.5em', fontSize: '0.78rem' },

  tabBar: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  tab: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'var(--panel)', border: '1px solid #2a2a35', borderRadius: 8, padding: '0.65rem 1.1rem', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' },
  tabActive: { borderColor: 'var(--gold)', background: 'rgba(196,149,106,0.06)' },
  tabLabel: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-subdim)', marginBottom: '0.2rem' },
  tabName: { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1rem', fontWeight: 400, color: 'var(--text-page)' },

  scenarioTagline: { fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.75rem' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metric: { background: 'var(--panel)', border: '1px solid #2a2a35', borderRadius: 8, padding: '1.25rem 1.35rem' },
  metricLabel: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subdim)', marginBottom: '0.5rem' },
  metricValue: { fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.9rem', fontWeight: 400, color: 'var(--gold)', lineHeight: 1.1, marginBottom: '0.35rem' },
  metricSub: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 },

  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '1rem', marginBottom: '1rem' },

  card: { background: 'var(--panel)', border: '1px solid #2a2a35', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' },
  cardHeader: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-subdim)', borderBottom: '1px solid #2a2a35', paddingBottom: '0.75rem', marginBottom: '1rem' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },

  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.45rem 0', borderBottom: '1px solid #1e1e24' },
  statRowHighlight: { borderBottom: '1px solid #252530' },
  statLabel: { color: 'var(--text-subdim)', fontSize: '0.85rem' },
  statValue: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', color: 'var(--text-soft)', textAlign: 'right', maxWidth: '55%' },

  solarNote: { marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.6, borderTop: '1px solid #252530', paddingTop: '0.75rem' },

  noticeBox: { background: 'rgba(196, 149, 106, 0.04)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: 8, padding: '1.5rem', marginTop: '2rem', marginBottom: '2rem' },
  noticeTitle: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' },
  noticeText: { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.75rem' },
  noticeLink: { color: 'var(--gold)', textDecoration: 'none' },

  footerNav: { display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #2a2a35' },
  footerNavLink: { fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' },
}

const th = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.7rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #2a2a35',
  whiteSpace: 'nowrap',
}

const td = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #1e1e24',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  verticalAlign: 'top',
}

const num = {
  textAlign: 'right',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.82rem',
}
