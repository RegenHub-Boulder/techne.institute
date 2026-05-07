// SignalCompletion — accountability cascade card for organizer signal completion
// Deadline: Friday March 6, 2026 · 4 PM MST (23:00 UTC)

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../contexts/ThemeContext";
import { bylawsData } from "../lib/bylawsData";
import { memberAgreementData } from "../lib/memberAgreementData";

// ── Constants ────────────────────────────────────────────────────────────────
const DEADLINE        = new Date("2026-03-06T23:00:00Z"); // Fri Mar 6, 4 PM MST
const MA_DEADLINE     = new Date("2026-03-19T23:00:00Z"); // Thu Mar 19, 4 PM MST (21 days from Feb 27)
const TOTAL_ORGANIZERS = 9;

// ── Derive signable items from bylaws tree ────────────────────────────────────
// "Signable" = DECIDE | PROPOSED | JEFF  (not CARRY — those are statute-defined)
function getSignableItems(nodes, sectionId = null, sectionLabel = null) {
  const out = [];
  for (const node of nodes) {
    const topLevel  = !sectionId;
    const sec       = topLevel ? node.id    : sectionId;
    const secLabel  = topLevel ? node.label : sectionLabel;
    if (node.status && node.status !== "CARRY") {
      out.push({ id: node.id, label: node.label, status: node.status, sectionId: sec, sectionLabel: secLabel });
    }
    if (node.children) out.push(...getSignableItems(node.children, sec, secLabel));
  }
  return out;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Bar({ pct, height = 5, dim = false }) {
  const { palette } = useTheme();
  const fill = dim ? palette.primaryDim : palette.primary;
  return (
    <div style={{
      flex: 1,
      background: palette.surface,
      borderRadius: "2px",
      height: `${height}px`,
      overflow: "hidden",
      border: `1px solid ${palette.border}`,
      position: "relative",
    }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`,
        height: "100%",
        background: fill,
        borderRadius: "2px",
        transition: "width 0.6s ease",
      }} />
    </div>
  );
}

function PctLabel({ pct, done }) {
  const { palette } = useTheme();
  return (
    <span style={{
      fontSize: "11px",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      color: done ? palette.green : pct > 0 ? palette.primary : palette.textFaint,
      minWidth: "34px",
      textAlign: "right",
      fontWeight: done ? "700" : "400",
    }}>
      {pct}%
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SignalCompletion({ refreshKey = 0 }) {
  const { palette } = useTheme();
  const [signals,  setSignals]  = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [timeLeft,   setTimeLeft]   = useState(null);
  const [maTimeLeft, setMaTimeLeft] = useState(null);
  const [showSections, setShowSections] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const signableItems   = useMemo(() => getSignableItems(bylawsData), []);
  const signableIds     = useMemo(() => new Set(signableItems.map(i => i.id)), [signableItems]);
  const maSignableItems = useMemo(() => getSignableItems(memberAgreementData), []);
  const maSignableIds   = useMemo(() => new Set(maSignableItems.map(i => i.id)), [maSignableItems]);
  const man             = maSignableItems.length;

  // ── Countdown: Bylaws ─────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const diff = DEADLINE - Date.now();
      if (diff <= 0) { setTimeLeft({ expired: true }); return; }
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Countdown: Member Agreement ───────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const diff = MA_DEADLINE - Date.now();
      if (diff <= 0) { setMaTimeLeft({ expired: true }); return; }
      setMaTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: sigs }, { data: profs }] = await Promise.all([
        supabase.from("signals").select("user_id, item_id"),
        supabase.from("profiles").select("id, name, declared_role").eq("declared_role", "organizer"),
      ]);
      setSignals(sigs  || []);
      setProfiles(profs || []);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  // ── Derive metrics ────────────────────────────────────────────────────────
  const { byOrganizer, bySection, groupPct, totalSent, notSignedIn, maByOrganizer, maGroupPct, maTotalSent } = useMemo(() => {
    const n = signableItems.length;
    const signableSigs = signals.filter(s => signableIds.has(s.item_id));

    // Per-organizer: unique item_ids they've touched
    const orgMap = {};
    profiles.forEach(p => {
      orgMap[p.id] = { id: p.id, name: p.name || "—", items: new Set() };
    });
    signableSigs.forEach(s => {
      if (orgMap[s.user_id]) orgMap[s.user_id].items.add(s.item_id);
    });
    const byOrganizer = Object.values(orgMap)
      .map(o => ({ ...o, count: o.items.size, pct: Math.round((o.items.size / n) * 100) }))
      .sort((a, b) => b.pct - a.pct);

    // Per-section: coverage across signed-in organizers
    const sectionMap = {};
    signableItems.forEach(item => {
      if (!sectionMap[item.sectionId]) {
        sectionMap[item.sectionId] = {
          id: item.sectionId, label: item.sectionLabel,
          total: 0, signaled: new Set(),
        };
      }
      sectionMap[item.sectionId].total++;
    });
    const numOrgs = profiles.length;
    signableSigs.forEach(s => {
      const item = signableItems.find(i => i.id === s.item_id);
      if (!item || !orgMap[s.user_id]) return;
      sectionMap[item.sectionId]?.signaled.add(`${s.user_id}:${s.item_id}`);
    });
    const bySection = Object.values(sectionMap).map(sec => {
      const possible = sec.total * numOrgs;
      return { ...sec, count: sec.signaled.size, possible, pct: possible > 0 ? Math.round((sec.signaled.size / possible) * 100) : 0 };
    });

    const totalSent    = byOrganizer.reduce((s, o) => s + o.count, 0);
    const totalPoss    = TOTAL_ORGANIZERS * n;
    const groupPct     = Math.round((totalSent / totalPoss) * 100);
    const notSignedIn  = TOTAL_ORGANIZERS - profiles.length;

    // ── MA metrics ──────────────────────────────────────────────────────────
    const maSigs = signals.filter(s => maSignableIds.has(s.item_id));
    const maOrgMap = {};
    profiles.forEach(p => { maOrgMap[p.id] = { id: p.id, name: p.name || "—", items: new Set() }; });
    maSigs.forEach(s => { if (maOrgMap[s.user_id]) maOrgMap[s.user_id].items.add(s.item_id); });
    const maByOrganizer = Object.values(maOrgMap)
      .map(o => ({ ...o, count: o.items.size, pct: Math.round((o.items.size / man) * 100) }))
      .sort((a, b) => b.pct - a.pct);
    const maTotalSent = maByOrganizer.reduce((s, o) => s + o.count, 0);
    const maGroupPct  = Math.round((maTotalSent / (TOTAL_ORGANIZERS * man)) * 100);

    return { byOrganizer, bySection, groupPct, totalSent, notSignedIn, maByOrganizer, maGroupPct, maTotalSent };
  }, [signals, profiles, signableItems, signableIds, maSignableIds, man]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const countdownStr = timeLeft
    ? timeLeft.expired
      ? "deadline passed"
      : `${timeLeft.days}d ${String(timeLeft.hours).padStart(2,"0")}h ${String(timeLeft.mins).padStart(2,"0")}m ${String(timeLeft.secs).padStart(2,"0")}s`
    : "…";

  const urgencyColor = timeLeft
    ? timeLeft.expired
      ? palette.red
      : timeLeft.days < 2
        ? "#d49f6e"
        : palette.textMuted
    : palette.textMuted;

  const n = signableItems.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: "4px",
      overflowX: "auto",
      marginBottom: "24px",
    }}>

      {/* ── Header (click to collapse/expand) ── */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px 12px",
          borderBottom: collapsed ? "none" : `1px solid ${palette.border}`,
          gap: "12px",
          flexWrap: "wrap",
          rowGap: "6px",
          cursor: "pointer",
          userSelect: "none",
        }}
        title={collapsed ? "Expand progression card" : "Collapse progression card"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            display: "inline-block",
            transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
            transition: "transform 0.15s ease",
            fontSize: "14px",
            color: palette.textFaint,
            lineHeight: 1,
          }}>›</span>
          <div>
            <span style={{
              fontSize: "10px", fontFamily: "monospace", letterSpacing: "2px",
              textTransform: "uppercase", color: palette.primaryDim, display: "block", marginBottom: "3px",
            }}>
              Organizer Completion
            </span>
            <span style={{ fontSize: "12px", color: palette.textMuted }}>
              {n} decision points · {TOTAL_ORGANIZERS} organizers
              {collapsed && !loading ? ` · ${groupPct}% complete` : ""}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
            letterSpacing: "0.5px", marginBottom: "2px",
          }}>
            Fri Mar 6, 2026 · 4 PM MST
          </div>
          <div style={{
            fontSize: "12px", fontFamily: "monospace", color: urgencyColor,
            fontWeight: "600", letterSpacing: "0.3px",
          }}>
            {countdownStr}
          </div>
        </div>
      </div>

      {/* ── Collapsible body ── */}
      {!collapsed && (<>

      {/* ── Group aggregate bar ── */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "10px", fontFamily: "monospace", letterSpacing: "1.5px",
            textTransform: "uppercase", color: palette.textFaint, minWidth: "44px",
          }}>
            Group
          </span>
          <Bar pct={groupPct} height={8} />
          <PctLabel pct={groupPct} done={groupPct === 100} />
          <span style={{
            fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
            whiteSpace: "nowrap", minWidth: "60px", textAlign: "right",
          }}>
            {loading ? "…" : `${totalSent}\u202f/\u202f${TOTAL_ORGANIZERS * n}`}
          </span>
        </div>
      </div>

      {/* ── Per-organizer rows (cascade tree) ── */}
      <div style={{ padding: "0 18px" }}>
        {loading ? (
          <div style={{ padding: "16px 0", fontSize: "11px", fontFamily: "monospace", color: palette.textFaint }}>
            Loading…
          </div>
        ) : (
          <>
            {byOrganizer.map((org, i) => {
              const isFirst = i === 0;
              const isLast  = i === byOrganizer.length - 1 && notSignedIn === 0;
              return (
                <div
                  key={org.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 0",
                    borderBottom: !isLast ? `1px solid ${palette.border}` : "none",
                    position: "relative",
                  }}
                >
                  {/* Tree connector */}
                  <div style={{ position: "relative", width: "28px", flexShrink: 0 }}>
                    {/* Vertical line segment */}
                    <div style={{
                      position: "absolute",
                      left: "12px",
                      top:    isFirst ? "50%" : "0",
                      bottom: isLast  ? "50%" : "0",
                      width: "1px",
                      background: palette.border,
                    }} />
                    {/* Horizontal branch */}
                    <div style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      width: "10px",
                      height: "1px",
                      background: palette.border,
                    }} />
                    {/* Node dot */}
                    <div style={{
                      position: "absolute",
                      left: "20px",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: org.pct > 0 ? palette.primary : palette.border,
                      border: `1px solid ${org.pct > 0 ? palette.primary : palette.border2}`,
                    }} />
                  </div>

                  {/* Name */}
                  <span style={{
                    fontSize: "12px",
                    color: org.pct === 100 ? palette.green : org.pct > 0 ? palette.text : palette.textFaint,
                    minWidth: "110px",
                    fontWeight: org.pct === 100 ? "600" : "400",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {org.name}
                  </span>

                  {/* Bar */}
                  <Bar pct={org.pct} height={5} dim={org.pct === 0} />

                  {/* Pct */}
                  <PctLabel pct={org.pct} done={org.pct === 100} />

                  {/* Count */}
                  <span style={{
                    fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
                    whiteSpace: "nowrap", minWidth: "50px", textAlign: "right",
                  }}>
                    {org.count} / {n}
                  </span>
                </div>
              );
            })}

            {/* "Awaiting" row for organizers who haven't signed in yet */}
            {notSignedIn > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 0",
              }}>
                {/* Tree end cap */}
                <div style={{ position: "relative", width: "28px", flexShrink: 0 }}>
                  <div style={{
                    position: "absolute",
                    left: "12px", top: "0", bottom: "50%",
                    width: "1px", background: palette.border,
                  }} />
                  <div style={{
                    position: "absolute",
                    left: "12px", top: "50%",
                    width: "10px", height: "1px",
                    background: palette.border,
                  }} />
                  <div style={{
                    position: "absolute", left: "20px", top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: "transparent",
                    border: `1px solid ${palette.border2}`,
                  }} />
                </div>
                <span style={{
                  fontSize: "11px", fontFamily: "monospace",
                  color: palette.textFaint, fontStyle: "italic",
                  flex: 1,
                }}>
                  {notSignedIn} organizer{notSignedIn !== 1 ? "s" : ""} haven't signed in yet
                </span>
                <span style={{
                  fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
                  whiteSpace: "nowrap",
                }}>
                  0 / {n} each
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Section breakdown (collapsible) ── */}
      {!loading && bySection.length > 0 && (
        <div style={{ borderTop: `1px solid ${palette.border}` }}>
          <button
            onClick={() => setShowSections(s => !s)}
            style={{
              width: "100%", background: "none", border: "none",
              padding: "10px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              color: palette.textFaint, fontSize: "10px",
              fontFamily: "monospace", letterSpacing: "1px",
              textTransform: "uppercase", textAlign: "left",
            }}
            onMouseEnter={e => e.currentTarget.style.color = palette.textMuted}
            onMouseLeave={e => e.currentTarget.style.color = palette.textFaint}
          >
            <span style={{ transform: showSections ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.15s" }}>›</span>
            By section
          </button>

          {showSections && (
            <div style={{ padding: "0 18px 14px" }}>
              {bySection.map((sec, i) => (
                <div key={sec.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "7px 0",
                  borderBottom: i < bySection.length - 1 ? `1px solid ${palette.border}` : "none",
                }}>
                  <span style={{
                    fontSize: "11px", color: palette.textMuted,
                    minWidth: "160px", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {sec.label}
                  </span>
                  <Bar pct={sec.pct} height={4} dim={sec.pct === 0} />
                  <PctLabel pct={sec.pct} done={sec.pct === 100} />
                  <span style={{
                    fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
                    whiteSpace: "nowrap", minWidth: "60px", textAlign: "right",
                  }}>
                    {sec.count} / {sec.possible || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ Member Agreement section ══════════════════════════════════════════ */}
      {(() => {
        const maUrgencyColor = maTimeLeft
          ? maTimeLeft.expired ? palette.red
          : maTimeLeft.days < 2 ? "#d49f6e"
          : palette.textMuted
          : palette.textMuted;
        const maCountdownStr = maTimeLeft
          ? maTimeLeft.expired ? "deadline passed"
          : `${maTimeLeft.days}d ${String(maTimeLeft.hours).padStart(2,"0")}h ${String(maTimeLeft.mins).padStart(2,"0")}m ${String(maTimeLeft.secs).padStart(2,"0")}s`
          : "…";

        return (
          <>
            {/* MA Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px 12px", borderTop: `2px solid ${palette.border}`,
              gap: "12px", flexWrap: "wrap", rowGap: "6px",
            }}>
              <div>
                <span style={{
                  fontSize: "10px", fontFamily: "monospace", letterSpacing: "2px",
                  textTransform: "uppercase", color: palette.primaryDim, display: "block", marginBottom: "3px",
                }}>
                  Member Agreement
                </span>
                <span style={{ fontSize: "12px", color: palette.textMuted }}>
                  {man} decision points · {TOTAL_ORGANIZERS} organizers
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
                  letterSpacing: "0.5px", marginBottom: "2px",
                }}>
                  Thu Mar 19, 2026 · 4 PM MST
                </div>
                <div style={{
                  fontSize: "12px", fontFamily: "monospace", color: maUrgencyColor,
                  fontWeight: "600", letterSpacing: "0.3px",
                }}>
                  {maCountdownStr}
                </div>
              </div>
            </div>

            {/* MA Group bar */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${palette.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontSize: "10px", fontFamily: "monospace", letterSpacing: "1.5px",
                  textTransform: "uppercase", color: palette.textFaint, minWidth: "44px",
                }}>
                  Group
                </span>
                <Bar pct={maGroupPct} height={8} />
                <PctLabel pct={maGroupPct} done={maGroupPct === 100} />
                <span style={{
                  fontSize: "10px", fontFamily: "monospace", color: palette.textFaint,
                  whiteSpace: "nowrap", minWidth: "60px", textAlign: "right",
                }}>
                  {loading ? "…" : `${maTotalSent}\u202f/\u202f${TOTAL_ORGANIZERS * man}`}
                </span>
              </div>
            </div>

            {/* MA Per-organizer rows */}
            <div style={{ padding: "0 18px" }}>
              {loading ? (
                <div style={{ padding: "16px 0", fontSize: "11px", fontFamily: "monospace", color: palette.textFaint }}>
                  Loading…
                </div>
              ) : (
                <>
                  {maByOrganizer.map((org, i) => {
                    const isFirst = i === 0;
                    const isLast  = i === maByOrganizer.length - 1 && notSignedIn === 0;
                    return (
                      <div key={org.id} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 0",
                        borderBottom: !isLast ? `1px solid ${palette.border}` : "none",
                        position: "relative",
                      }}>
                        <div style={{ position: "relative", width: "28px", flexShrink: 0 }}>
                          <div style={{ position: "absolute", left: "12px", top: isFirst ? "50%" : "0", bottom: isLast ? "50%" : "0", width: "1px", background: palette.border }} />
                          <div style={{ position: "absolute", left: "12px", top: "50%", width: "10px", height: "1px", background: palette.border }} />
                          <div style={{ position: "absolute", left: "20px", top: "50%", transform: "translate(-50%, -50%)", width: "5px", height: "5px", borderRadius: "50%", background: org.pct > 0 ? palette.primary : palette.border, border: `1px solid ${org.pct > 0 ? palette.primary : palette.border2}` }} />
                        </div>
                        <span style={{ fontSize: "12px", color: org.pct === 100 ? palette.green : org.pct > 0 ? palette.text : palette.textFaint, minWidth: "110px", fontWeight: org.pct === 100 ? "600" : "400", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {org.name}
                        </span>
                        <Bar pct={org.pct} height={5} dim={org.pct === 0} />
                        <PctLabel pct={org.pct} done={org.pct === 100} />
                        <span style={{ fontSize: "10px", fontFamily: "monospace", color: palette.textFaint, whiteSpace: "nowrap", minWidth: "50px", textAlign: "right" }}>
                          {org.count} / {man}
                        </span>
                      </div>
                    );
                  })}
                  {notSignedIn > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0" }}>
                      <div style={{ position: "relative", width: "28px", flexShrink: 0 }}>
                        <div style={{ position: "absolute", left: "12px", top: "0", bottom: "50%", width: "1px", background: palette.border }} />
                        <div style={{ position: "absolute", left: "12px", top: "50%", width: "10px", height: "1px", background: palette.border }} />
                        <div style={{ position: "absolute", left: "20px", top: "50%", transform: "translate(-50%, -50%)", width: "5px", height: "5px", borderRadius: "50%", background: "transparent", border: `1px solid ${palette.border2}` }} />
                      </div>
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: palette.textFaint, fontStyle: "italic", flex: 1 }}>
                        {notSignedIn} organizer{notSignedIn !== 1 ? "s" : ""} haven't signed in yet
                      </span>
                      <span style={{ fontSize: "10px", fontFamily: "monospace", color: palette.textFaint, whiteSpace: "nowrap" }}>
                        0 / {man} each
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        );
      })()}

      </>)}
    </div>
  );
}
