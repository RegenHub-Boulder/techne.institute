import { useState, useEffect, useRef, useCallback } from 'react'
import BylawsTree from './BylawsTree'
import DocumentViewer from './DocumentViewer'
import AuthModal from './components/AuthModal'
import SignalsAggregate from './components/SignalsAggregate'
import SignalCompletion from './components/SignalCompletion'
import { useAuth } from './hooks/useAuth'
import { useSignals } from './hooks/useSignals'
import { useTheme } from './contexts/ThemeContext'

// ── Canonical tab definitions ─────────────────────────────────────────────────
const tabsMap = {
  tree:          { id: "tree",         label: "Decision Tree" },
  meadow:        { id: "meadow",       label: "Bylaws · Meadow",      url: "./meadow-source.md",         color: "#8aba8a" },
  proposed:      { id: "proposed",     label: "Bylaws · Proposed",    url: "./regenhub-proposed.md",     color: "#8aba8a" },
  "ma-meadow":   { id: "ma-meadow",   label: "MA · Meadow",          url: "./ma-meadow-source.md",      color: "#a0a0c4" },
  "ma-proposed": { id: "ma-proposed", label: "MA · Proposed",        url: "./ma-regenhub-proposed.md",  color: "#a0a0c4" },
  articles:      { id: "articles",     label: "Articles of Org",      url: "./articles-of-organization.md", color: "#8aba8a" },
  purpose:       { id: "purpose",      label: "Purpose Statement",    url: "./purpose-statement.md" },
  techne:        { id: "techne",       label: "Corporation as Techne", url: "https://raw.githubusercontent.com/nou-techne/nou-techne/main/docs/the-corporation-as-techne.md" },
  "data-room":   { id: "data-room",   label: "Data Room",            url: "./data-room/data-room.html", type: "html" },

  "one-pager":   { id: "one-pager",   label: "Vision One-Pager",     url: "./data-room/vision-one-pager.html", type: "html", public: true },
  deck:          { id: "deck",         label: "Pitch Deck",           url: "./data-room/deck.html",       type: "html" },
  termsheet:     { id: "termsheet",    label: "Term Sheet",           url: "./data-room/term-sheet.html", type: "html" },
  signals:       { id: "signals",      label: "Signals" },
};

// ── Audience groups ───────────────────────────────────────────────────────────
const baseGroups = [
  {
    id: "organizers",
    label: "Organizers",
    subGroups: [
      { label: "Bylaws & Agreements", color: "#8aba8a", tabIds: ["tree", "meadow", "proposed", "ma-meadow", "ma-proposed"] },
      { label: "Formation", color: "#c4a06a", tabIds: ["purpose", "articles", "techne"] },
      { label: "Financial", color: "#a0a0c4", tabIds: ["termsheet"] },
    ],
    get tabIds() { return this.subGroups.flatMap(sg => sg.tabIds); },
  },
  {
    id: "investors-partners",
    label: "Investors / Partners",
    subGroups: [
      { label: "Overview", color: "#8aba8a", tabIds: ["purpose", "one-pager"] },
      { label: "Financial", color: "#a0a0c4", tabIds: ["data-room", "deck", "termsheet"] },
    ],
    get tabIds() { return this.subGroups.flatMap(sg => sg.tabIds); },
  },
];

const ORGANIZERS = [
  "Aaron N.", "Benjamin R.", "Jonathan B.", "Kevin O.",
  "Lucian H.", "Neil M.", "Savannah K.", "Todd Y.",
];

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({ tab, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { palette } = useTheme();
  const accent = tab.color || palette.primary;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "6px 14px",
        fontSize: "13px",
        fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
        border: `1px solid ${isActive ? accent : hovered ? palette.border2 : palette.border}`,
        borderRadius: "2px",
        backgroundColor: isActive ? palette.surface2 : "transparent",
        color: isActive ? accent : hovered ? (tab.color || palette.text) : palette.textMuted,
        cursor: "pointer",
        fontWeight: isActive ? "600" : "400",
        transition: "all 0.12s",
        whiteSpace: "nowrap",
        flexShrink: 0,
        letterSpacing: isActive ? "0" : "0.2px",
      }}
    >
      {tab.label}
    </button>
  );
}

// ── Group selector button ─────────────────────────────────────────────────────
function GroupButton({ group, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { palette } = useTheme();
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive ? palette.surface2 : hovered ? palette.surface : "none",
        border: `1px solid ${isActive ? palette.border2 : hovered ? palette.border : "transparent"}`,
        borderRadius: "4px",
        padding: "7px 20px",
        cursor: isActive ? "default" : "pointer",
        color: isActive ? palette.primary : hovered ? palette.text : palette.textMuted,
        fontSize: "13px",
        fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
        fontWeight: isActive ? "600" : "400",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        userSelect: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {group.label}
    </button>
  );
}

// ── Gated iframe (address hidden until sign-in; theme-synced via postMessage) ─
function GatedFrame({ url, label, user, onShowAuth, requiresAuth = true }) {
  const { palette, mode } = useTheme();
  const iframeRef = useRef(null);

  // Send theme to iframe
  const pushTheme = useCallback((iframe, themeMode) => {
    try { iframe.contentWindow.postMessage({ type: 'rh-theme', mode: themeMode }, '*'); }
    catch (e) {}
  }, []);

  // Re-send whenever mode changes
  useEffect(() => {
    if (iframeRef.current) pushTheme(iframeRef.current, mode);
  }, [mode, pushTheme]);

  // Listen for iframe's "ready" signal and reply with current theme
  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === 'rh-theme-ready' && iframeRef.current) {
        pushTheme(iframeRef.current, mode);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [mode, pushTheme]);

  if (!requiresAuth || user) {
    return (
      <iframe
        ref={iframeRef}
        src={url}
        title={label}
        onLoad={() => iframeRef.current && pushTheme(iframeRef.current, mode)}
        style={{
          width: "100%",
          height: "calc(100dvh - 120px)",
          border: "none",
          display: "block",
          marginTop: "1px",
        }}
      />
    );
  }
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "320px",
      padding: "48px 24px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "monospace",
        fontSize: "10px",
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        color: palette.primaryDim,
        marginBottom: "16px",
      }}>
        RegenHub, LCA · {label}
      </div>
      <h2 style={{
        fontSize: "18px",
        fontWeight: "600",
        color: palette.textBright,
        marginBottom: "10px",
        letterSpacing: "-0.3px",
      }}>
        Sign in to view
      </h2>
      <p style={{
        fontSize: "14px",
        color: palette.textMuted,
        maxWidth: "360px",
        lineHeight: "1.65",
        marginBottom: "24px",
      }}>
        These materials are shared with verified partners and investors.
        Sign in with your email to access this document.
      </p>
      <button
        onClick={onShowAuth}
        style={{
          background: "none",
          border: `1px solid ${palette.primary}`,
          borderRadius: "2px",
          padding: "8px 24px",
          color: palette.primary,
          fontSize: "13px",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          cursor: "pointer",
          letterSpacing: "0.3px",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = palette.primaryGlow}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        Sign in →
      </button>
    </div>
  );
}

// ── Sticky topbar ─────────────────────────────────────────────────────────────
function TopBar({ user, profile, onShowAuth, onSignOut, onCompleteProfile }) {
  const { palette } = useTheme();
  return (
    <div
      className="topbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: palette.bg,
        borderBottom: `1px solid ${palette.border}`,
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background-color 0.2s",
      }}
    >
      {/* Left: entity micro-label */}
      <span className="topbar-label-long" style={{
        fontFamily: "monospace",
        fontSize: "10px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: palette.textFaint,
      }}>
        RegenHub, LCA · Boulder, CO
      </span>
      <span className="topbar-label-short" style={{
        display: "none",
        fontFamily: "monospace",
        fontSize: "10px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: palette.textFaint,
      }}>
        RegenHub
      </span>

      {/* Right: auth controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {!user ? (
          <button
            onClick={onShowAuth}
            style={{
              background: "none", border: `1px solid ${palette.border}`,
              padding: "3px 12px", borderRadius: "2px",
              color: palette.primary, fontSize: "11px",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              cursor: "pointer", letterSpacing: "0.3px",
              transition: "border-color 0.12s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = palette.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = palette.border}
          >
            Sign in
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: palette.textMuted, whiteSpace: "nowrap" }}>
              {profile?.name || user.email}
              {profile?.declared_role && (
                <span style={{ color: palette.textFaint }}> · {profile.declared_role}</span>
              )}
            </span>
            {profile && !profile.name && (
              <button onClick={onCompleteProfile}
                style={{ background: "none", border: "none", padding: 0, color: palette.primary, fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}>
                Complete profile →
              </button>
            )}
            <button onClick={onSignOut}
              style={{ background: "none", border: "none", padding: 0, color: palette.textFaint, fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function AppFooter({ user, mode, toggleTheme }) {
  const { palette } = useTheme();
  const label = (text) => (
    <div style={{
      fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px",
      textTransform: "uppercase", color: palette.primaryDim,
      marginBottom: "8px",
    }}>{text}</div>
  );
  return (
    <footer
      className="app-footer"
      style={{
        borderTop: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        transition: "background-color 0.2s",
      }}
    >
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

        {/* ── Grid: 3 columns desktop, 1 on mobile ── */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "32px 40px",
            marginBottom: "32px",
          }}
        >

          {/* Column 1 — Entity */}
          <div>
            {label("Entity")}
            <div style={{ fontSize: "15px", fontWeight: "600", color: palette.textBright, marginBottom: "4px" }}>
              RegenHub, LCA
            </div>
            <div style={{ fontSize: "13px", color: palette.textMuted, marginBottom: "2px" }}>
              DBA Techne
            </div>
            <div style={{ fontSize: "12px", color: palette.textFaint, lineHeight: "1.6", marginTop: "8px" }}>
              Colorado Public Benefit<br/>
              Limited Cooperative Association<br/>
              Filed February 6, 2026
            </div>
          </div>

          {/* Column 2 — Location + Formation */}
          <div>
            {label("Location & Formation")}
            {user ? (
              <div style={{ fontSize: "13px", color: palette.text, lineHeight: "1.7", marginBottom: "4px" }}>
                <div>1515 Walnut St, Suite 200</div>
                <div style={{ color: palette.textMuted }}>Boulder, Colorado 80302</div>
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: palette.textFaint, fontStyle: "italic", marginBottom: "4px" }}>
                Boulder, Colorado
                <span style={{ display: "block", fontSize: "11px", color: palette.textFaint, marginTop: "2px" }}>
                  Sign in to view full address
                </span>
              </div>
            )}
            <div style={{ marginTop: "8px", fontSize: "12px", color: palette.textFaint, lineHeight: "1.7" }}>
              <div><span style={{ color: palette.textMuted }}>Attorney</span> · Jeff Pote, Pote Law Firm</div>
              <div><span style={{ color: palette.textMuted }}>Tax structure</span> · Sub K Partnership</div>
              <div><span style={{ color: palette.textMuted }}>Status</span> · Formation stage</div>
              <div><span style={{ color: palette.textMuted }}>Purpose</span> · Cultivating scenius</div>
            </div>
          </div>

          {/* Column 3 — Organizers */}
          <div>
            {label("Founding Organizers")}
            <div className="organizer-pills">
              {ORGANIZERS.map(name => (
                <span key={name} style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: palette.textMuted,
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: "2px",
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}>
                  {name}
                </span>
              ))}
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: palette.textFaint, lineHeight: "1.6" }}>
              Class 1 Cooperative Members (patron, voting)<br/>
              + additional members admitted at Board discretion
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: palette.textFaint, lineHeight: "1.9" }}>
            <div>
              <span style={{ color: palette.textMuted }}>Not a securities offering.</span>
              {" "}Participation is structured as cooperative membership in a Colorado Limited Cooperative Association —
              not a fund share, SAFE, or registered security.
            </div>
            <div style={{ marginTop: "6px" }}>
              This tool is for internal formation use and shared with organizers, aligned partners, and investors under confidentiality.
              All terms subject to attorney review and Board ratification.
              ·{" "}
              <a
                href="https://github.com/Roots-Trust-LCA/regenhub"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: palette.primaryDim, textDecoration: "none" }}
              >
                github.com/Roots-Trust-LCA/regenhub
              </a>
            </div>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "none",
              border: `1px solid ${palette.border}`,
              borderRadius: "2px",
              padding: "3px 10px",
              color: palette.textFaint,
              fontSize: "11px",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              cursor: "pointer",
              letterSpacing: "0.3px",
              transition: "border-color 0.12s, color 0.12s",
              userSelect: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: "flex-start",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = palette.primary; e.currentTarget.style.color = palette.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textFaint; }}
          >
            {mode === "dark" ? "☀ light" : "☽ dark"}
          </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState("purpose");
  const [activeGroup, setActiveGroup] = useState("investors-partners");
  const [showAuth, setShowAuth] = useState(false);
  const { palette, mode, toggleTheme } = useTheme();
  const { user, profile, loading: authLoading, signIn, signOut, saveProfile } = useAuth();
  const [completionKey, setCompletionKey] = useState(0);
  const { signalsByItem, mySignalsByItem, refreshSignals, newCount, markVisited } = useSignals(user);
  const refreshAll = () => { refreshSignals(); setCompletionKey(k => k + 1); };
  const activeTabDef = tabsMap[activeTab];

  useEffect(() => {
    if (!authLoading && user && !profile) setShowAuth(true);
  }, [authLoading, user, profile]);

  useEffect(() => {
    if (activeTab === "signals") markVisited();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveTabsMap = {
    ...tabsMap,
    signals: {
      ...tabsMap.signals,
      label: newCount > 0 ? `Signals (${newCount} new)` : "Signals",
    },
  };

  useEffect(() => {
    if (!authLoading && profile?.declared_role === "organizer") {
      setActiveGroup("organizers");
      setActiveTab("tree");
    }
  }, [authLoading, profile?.declared_role]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = baseGroups.map(g => {
    if (g.id === "organizers" && profile?.declared_role === "organizer") {
      return {
        ...g,
        subGroups: [
          ...g.subGroups,
          { label: "Activity", color: "#c49a6a", tabIds: ["signals"] },
        ],
        get tabIds() { return this.subGroups.flatMap(sg => sg.tabIds); },
      };
    }
    return g;
  });

  const visibleGroups = groups.filter(g =>
    g.id !== "organizers" || profile?.declared_role === "organizer"
  );

  const safeGroup = visibleGroups.some(g => g.id === activeGroup)
    ? activeGroup
    : visibleGroups[0]?.id;
  const activeGroupObj = groups.find(g => g.id === safeGroup);

  return (
    <div style={{
      backgroundColor: palette.bg,
      minHeight: "100vh",
      color: palette.text,
      transition: "background-color 0.2s, color 0.2s",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Sticky topbar ── */}
      <TopBar
        user={user}
        profile={profile}
        onShowAuth={() => setShowAuth(true)}
        onSignOut={signOut}
        onCompleteProfile={() => setShowAuth(true)}
      />

      {/* ── Header ── */}
      <header className="header-content" style={{ maxWidth: "1040px", width: "100%", margin: "0 auto", alignSelf: "stretch" }}>

        {/* Title row */}
        <div style={{ marginTop: "24px", marginBottom: "8px" }}>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "700",
            color: palette.textBright,
            letterSpacing: "-0.6px",
            lineHeight: "1.15",
            margin: 0,
            display: "inline",
          }}>
            RegenHub, LCA
          </h1>
          <span style={{
            fontSize: "14px",
            fontWeight: "400",
            color: palette.primary,
            marginLeft: "12px",
            letterSpacing: "-0.2px",
            fontFamily: "monospace",
          }}>
            Formation &amp; Data Room
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "15px",
          color: palette.textMuted,
          margin: "0 0 24px 0",
          lineHeight: "1.6",
          maxWidth: "580px",
        }}>
          {user
            ? "A cooperative venture studio at 1515 Walnut St, Suite 200, Boulder — bylaws in formation, data room assembled for aligned partners and investors."
            : "A cooperative venture studio in Boulder, Colorado — bylaws in formation, data room assembled for aligned partners and investors."
          }
        </p>

        {/* ── Navigation — two-tier ── */}
        <div style={{ paddingBottom: "20px", borderBottom: `1px solid ${palette.border}` }}>

          {/* Tier 1: audience selector */}
          <div className="group-row" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
            {visibleGroups.map(group => (
              <GroupButton
                key={group.id}
                group={group}
                isActive={safeGroup === group.id}
                onClick={() => {
                  setActiveGroup(group.id);
                  const firstId = group.tabIds[0];
                  if (firstId) setActiveTab(firstId);
                }}
              />
            ))}
          </div>

          {/* Tier 2: tabs grouped by sub-group */}
          <div className="tab-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "flex-end" }}>
            {(activeGroupObj?.subGroups || []).map((sg, i) => (
              <div key={sg.label} style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                marginRight: i < (activeGroupObj.subGroups.length - 1) ? "12px" : "0",
              }}>
                <span style={{
                  fontSize: "10px",
                  fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: sg.color,
                  paddingLeft: "2px",
                }}>
                  {sg.label}
                </span>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {sg.tabIds.map(id => {
                    const tab = effectiveTabsMap[id];
                    if (!tab) return null;
                    return (
                      <TabButton
                        key={id}
                        tab={{ ...tab, color: tab.color || sg.color }}
                        isActive={activeTab === id}
                        onClick={() => setActiveTab(id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1 }}>
        {activeTab === "tree" ? (
          <>
            {profile?.declared_role === "organizer" && (
              <div className="main-content" style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: 0 }}>
                <SignalCompletion refreshKey={completionKey} />
              </div>
            )}
            <BylawsTree
              hideHeader
              user={user}
              profile={profile}
              onOpenAuth={() => setShowAuth(true)}
              signalsByItem={signalsByItem}
              mySignalsByItem={mySignalsByItem}
              refreshSignals={refreshAll}
            />
          </>
        ) : activeTab === "signals" ? (
          <SignalsAggregate onViewed={markVisited} />
        ) : activeTabDef.type === "html" ? (
          <GatedFrame
            url={activeTabDef.url}
            label={activeTabDef.label}
            user={user}
            onShowAuth={() => setShowAuth(true)}
            requiresAuth={!activeTabDef.public}
          />
        ) : (
          <div className="main-content" style={{ maxWidth: "960px", margin: "0 auto" }}>
            <DocumentViewer url={activeTabDef.url} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <AppFooter user={user} mode={mode} toggleTheme={toggleTheme} />

      {/* ── Auth modal ── */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          signIn={signIn}
          saveProfile={saveProfile}
          needsProfile={!!user && !profile?.name}
        />
      )}

    </div>
  );
}

export default App
