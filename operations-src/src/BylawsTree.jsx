import { useState, useCallback, useEffect, useRef } from "react";
import SignalPanel from "./components/SignalPanel";
import { useTheme } from "./contexts/ThemeContext";
import { bylawsData } from "./lib/bylawsData";
import { memberAgreementData } from "./lib/memberAgreementData";



function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  const { palette } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: "6px" }}>
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "16px", height: "16px", borderRadius: "50%",
          border: `1px solid ${palette.border}`, color: palette.textMuted,
          fontSize: "10px", fontFamily: "serif", fontStyle: "italic", fontWeight: "700",
          cursor: "pointer", userSelect: "none", lineHeight: 1, flexShrink: 0,
        }}
      >
        i
      </span>
      {open && (
        <div
          style={{
            position: "absolute", top: "22px", left: "-8px", zIndex: 100,
            backgroundColor: palette.surface, border: `1px solid ${palette.border}`,
            borderRadius: "4px", padding: "10px 12px", maxWidth: "400px", minWidth: "240px",
            color: palette.text, fontSize: "12px", lineHeight: "1.5",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: "400", fontStyle: "normal", boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </div>
      )}
    </span>
  );
}

function hasMatchingLeaf(node, filter) {
  if (!node.children) return filter === "ALL" || node.status === filter;
  return node.children.some((child) => hasMatchingLeaf(child, filter));
}

function countByStatus(nodes) {
  const counts = { ASSUMED: 0, PROPOSED: 0, DECIDE: 0, JEFF: 0, CARRY: 0 };
  function walk(list) {
    for (const n of list) {
      if (n.status) counts[n.status]++;
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return counts;
}

function LeafNode({ node, depth, user, profile, onOpenAuth, signalsByItem, mySignalsByItem, refreshSignals }) {
  const [expanded, setExpanded] = useState(false);
  const { palette, statusColors } = useTheme();
  const s = statusColors[node.status] || statusColors.CARRY;
  const itemCounts    = signalsByItem?.[node.id] || {};
  const mySignal      = mySignalsByItem?.[node.id] || null;
  const totalSignals  = itemCounts.total || 0;
  const hasMySignal   = !!mySignal;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 6px 4px 0",
          cursor: "pointer",
          fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
          fontSize: "14px",
          flexWrap: "wrap",
          borderRadius: "2px",
          transition: "background-color 0.1s",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = palette.surface}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <span
          style={{
            display: "inline-block",
            width: "7px", height: "7px",
            borderRadius: "50%",
            backgroundColor: s.border,
            flexShrink: 0,
          }}
        />
        <span style={{ color: palette.textMuted, minWidth: "200px", flexShrink: 0 }}>
          {node.label}
        </span>
        <span
          style={{
            color: s.text, backgroundColor: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: "3px", padding: "2px 8px", fontSize: "12px",
          }}
        >
          {node.value}
        </span>
        <span
          style={{
            fontSize: "10px", fontWeight: "600",
            color: s.text, backgroundColor: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: "10px", padding: "1px 8px",
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}
        >
          {s.label}
        </span>

        {/* Signal count pill — always visible when signals exist */}
        {totalSignals > 0 && !expanded && (
          <span style={{
            fontSize: "10px",
            fontFamily: "'SF Mono', monospace",
            padding: "1px 7px",
            border: `1px solid ${hasMySignal ? palette.primary : palette.border2}`,
            borderRadius: "2px",
            color: hasMySignal ? palette.primary : palette.textMuted,
            letterSpacing: "0.3px",
          }}>
            {totalSignals} signal{totalSignals !== 1 ? "s" : ""}
            {hasMySignal ? " ✓" : ""}
          </span>
        )}

        {/* Expand/collapse affordance — always visible */}
        <span style={{
          marginLeft: "auto",
          fontSize: "10px",
          fontFamily: "monospace",
          color: expanded ? palette.primary : palette.textMuted,
          paddingLeft: "8px",
          flexShrink: 0,
          userSelect: "none",
        }}>
          {expanded ? "▲ close" : "▼ signal"}
        </span>
      </div>

      {expanded && (
        <div style={{ marginLeft: "14px", paddingBottom: "10px" }}>
          <SignalPanel
            itemId={node.id}
            itemStatus={node.status}
            user={user}
            profile={profile}
            onOpenAuth={onOpenAuth}
            initialCounts={itemCounts}
            initialMySignal={mySignal}
            refreshSignals={refreshSignals}
          />
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, depth = 0, filter, globalExpand, user, profile, onOpenAuth, signalsByItem, mySignalsByItem, refreshSignals }) {
  const [localExpanded, setLocalExpanded] = useState(depth < 1);
  const { palette, statusColors } = useTheme();
  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    if (filter !== "ALL" && node.status !== filter) return null;
    return (
      <LeafNode
        node={node}
        depth={depth}
        user={user}
        profile={profile}
        onOpenAuth={onOpenAuth}
        signalsByItem={signalsByItem}
        mySignalsByItem={mySignalsByItem}
        refreshSignals={refreshSignals}
      />
    );
  }

  if (!hasMatchingLeaf(node, filter)) return null;

  const expanded = globalExpand !== null ? globalExpand : localExpanded;
  const isArticle = depth === 0;
  const isSection = depth === 1;
  const matchCount =
    filter === "ALL"
      ? node.children.length
      : node.children.filter((c) => hasMatchingLeaf(c, filter)).length;

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 16 : 0,
        marginBottom: isArticle ? 1 : 0,
      }}
    >
      <div
        onClick={() => setLocalExpanded(!expanded)}
        style={{
          cursor: "pointer",
          padding: isArticle ? "10px 12px" : "5px 12px",
          backgroundColor: isArticle ? palette.surface : "transparent",
          borderLeft: isArticle
            ? `3px solid ${palette.primary}`
            : isSection
            ? `2px solid ${palette.border}`
            : "none",
          borderRadius: isArticle ? "3px" : "0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          userSelect: "none",
          transition: "background-color 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!isArticle) e.currentTarget.style.backgroundColor = palette.surface;
        }}
        onMouseLeave={(e) => {
          if (!isArticle) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span
          style={{
            color: palette.textMuted,
            fontFamily: "monospace",
            fontSize: "11px",
            width: "14px",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          {expanded ? "v" : ">"}
        </span>
        <span
          style={{
            color: isArticle
              ? palette.primary
              : isSection
              ? palette.text
              : palette.textMuted,
            fontWeight: isArticle ? "600" : "normal",
            fontSize: isArticle ? "14px" : "13px",
            fontFamily: isArticle
              ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              : "monospace",
          }}
        >
          {node.label}
        </span>
        {node.info && <InfoTip text={node.info} />}
        {node.note && (
          <span
            style={{
              color: statusColors.JEFF.text,
              fontSize: "11px",
              fontStyle: "italic",
            }}
          >
            {node.note}
          </span>
        )}
        <span
          style={{
            color: palette.border,
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          ({matchCount})
        </span>
      </div>
      {expanded && (
        <div style={{ paddingTop: "2px" }}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              filter={filter}
              globalExpand={globalExpand}
              user={user}
              profile={profile}
              onOpenAuth={onOpenAuth}
              signalsByItem={signalsByItem}
              mySignalsByItem={mySignalsByItem}
              refreshSignals={refreshSignals}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Btn({ children, active, color, onClick }) {
  const { palette } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        fontSize: "13px",
        fontFamily: "monospace",
        border: `1px solid ${active ? color || palette.primary : palette.border}`,
        borderRadius: "3px",
        backgroundColor: active ? palette.surface : "transparent",
        color: color || palette.textMuted,
        cursor: "pointer",
        fontWeight: active ? "600" : "400",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export default function BylawsTree({ hideHeader, user, profile, onOpenAuth, signalsByItem, mySignalsByItem, refreshSignals }) {
  const [filter, setFilter] = useState("ALL");
  const [globalExpand, setGlobalExpand] = useState(null);
  const { palette, statusColors } = useTheme();
  const counts = countByStatus([...bylawsData, ...memberAgreementData]);

  const handleFilter = useCallback((f) => {
    setFilter(f);
    setGlobalExpand(f !== "ALL" ? true : null);
  }, []);

  return (
    <div
      className="main-content"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition: "background-color 0.2s",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          {!hideHeader && (<>
          <h1
            style={{
              color: palette.textBright,
              fontSize: "22px",
              fontWeight: "600",
              margin: "0 0 2px 0",
              letterSpacing: "-0.3px",
            }}
          >
            RegenHub, LCA Bylaws
          </h1>
          <p
            style={{
              color: palette.textMuted,
              fontSize: "15px",
              margin: "0 0 20px 0",
            }}
          >
            Proposed values from formation meetings 1-8, Articles (filed 2.6.26),
            Sub K analysis
          </p>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <a
              href="https://github.com/Roots-Trust-LCA/regenhub/blob/main/Meadow_Bylaws_Source%20Content.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                border: `1px solid ${palette.border}`,
                borderRadius: "3px",
                color: palette.textMuted,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.primary; e.currentTarget.style.color = palette.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textMuted; }}
            >
              View Meadow Source
            </a>
            <a
              href="https://github.com/Roots-Trust-LCA/regenhub/blob/main/RegenHub_Proposed_Bylaws.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                border: `1px solid ${palette.border}`,
                borderRadius: "3px",
                color: palette.textMuted,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.primary; e.currentTarget.style.color = palette.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textMuted; }}
            >
              View RegenHub Proposed
            </a>
          </div>
          </>)}

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "16px",
              padding: "14px 16px",
              backgroundColor: palette.surface,
              borderRadius: "4px",
              border: `1px solid ${palette.border}`,
            }}
          >
            {Object.entries(statusColors).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: val.border,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    color: val.text,
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {val.label}
                </span>
                <span style={{ color: palette.border, fontSize: "12px" }}>
                  {counts[key]}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Btn
              active={filter === "ALL"}
              color={palette.textMuted}
              onClick={() => handleFilter("ALL")}
            >
              All
            </Btn>
            {["ASSUMED", "DECIDE", "JEFF", "PROPOSED", "CARRY"].map((f) => {
              const sc = statusColors[f];
              return (
                <Btn
                  key={f}
                  active={filter === f}
                  color={sc.text}
                  onClick={() => handleFilter(f)}
                >
                  {sc.label} ({counts[f]})
                </Btn>
              );
            })}
            <span style={{ color: palette.border, margin: "0 4px" }}>|</span>
            <Btn onClick={() => setGlobalExpand(true)} color={palette.textMuted}>
              Open All
            </Btn>
            <Btn onClick={() => setGlobalExpand(false)} color={palette.textMuted}>
              Collapse
            </Btn>
            {globalExpand !== null && (
              <Btn onClick={() => setGlobalExpand(null)} color={palette.border}>
                Reset
              </Btn>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {bylawsData.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              filter={filter}
              globalExpand={globalExpand}
              user={user}
              profile={profile}
              onOpenAuth={onOpenAuth}
              signalsByItem={signalsByItem}
              mySignalsByItem={mySignalsByItem}
              refreshSignals={refreshSignals}
            />
          ))}
        </div>

        {/* ── Member Agreement section ── */}
        <div style={{ marginTop: "48px", paddingTop: "28px", borderTop: `2px solid ${palette.border}` }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ color: palette.textBright, fontSize: "20px", fontWeight: "600", margin: "0 0 4px 0", letterSpacing: "-0.3px" }}>
              Member Agreement
            </h2>
            <p style={{ color: palette.textMuted, fontSize: "15px", margin: "0 0 14px 0" }}>
              Variables extracted from Meadow Cooperative, LCA template — adapted for RegenHub's four-class structure
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href="https://github.com/Roots-Trust-LCA/regenhub/blob/main/Meadow_MemberAgreement_Source.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "4px 12px", fontSize: "12px", fontFamily: "'SF Mono', 'Fira Code', monospace", border: `1px solid ${palette.border}`, borderRadius: "3px", color: palette.textMuted, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = palette.primary; e.currentTarget.style.color = palette.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textMuted; }}
              >
                View Meadow Source
              </a>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {memberAgreementData.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                filter={filter}
                globalExpand={globalExpand}
                user={user}
                profile={profile}
                onOpenAuth={onOpenAuth}
                signalsByItem={signalsByItem}
                mySignalsByItem={mySignalsByItem}
                refreshSignals={refreshSignals}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: `1px solid ${palette.border}`, textAlign: "center" }}>
          <span style={{ color: palette.textMuted, fontSize: "11px" }}>
            Bylaw guidance adapted from{" "}
            <a
              href="https://www.start.coop/bylaws"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: palette.textMuted, textDecoration: "underline" }}
            >
              Start.coop Bylaws Starter Kit
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
