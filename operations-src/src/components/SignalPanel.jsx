import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../contexts/ThemeContext";

const STATUS_SIGNALS = {
  DECIDE:   ["support", "oppose", "note"],
  PROPOSED: ["support", "oppose", "note"],
  JEFF:     ["concern", "note"],
  CARRY:    ["note"],
};

const COMMENT_PLACEHOLDER = {
  DECIDE:   "Add context or reasoning…",
  PROPOSED: "Add context or reasoning…",
  JEFF:     "Flag a concern for the attorney…",
  CARRY:    "Add a note…",
};

export default function SignalPanel({
  itemId,
  itemStatus,
  user,
  profile,
  onOpenAuth,
  // Pre-fetched from batch hook — passed from BylawsTree
  initialCounts,
  initialMySignal,
  refreshSignals,
}) {
  const { palette, signalDefs } = useTheme();
  const [counts, setCounts]     = useState(initialCounts || {});
  const [mySignal, setMySignal] = useState(initialMySignal || null);
  const [selected, setSelected] = useState(initialMySignal?.signal_type || null);
  const [comment, setComment]   = useState(initialMySignal?.comment || "");
  const [saving, setSaving]     = useState(false);
  const [clearing, setClearing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Keep in sync if parent re-fetches
  useEffect(() => {
    setCounts(initialCounts || {});
  }, [initialCounts]);

  useEffect(() => {
    setMySignal(initialMySignal || null);
    setSelected(initialMySignal?.signal_type || null);
    setComment(initialMySignal?.comment || "");
  }, [initialMySignal]);

  const allowedTypes = STATUS_SIGNALS[itemStatus] || ["note"];
  const totalSignals = Object.values(counts).reduce((a, b) => a + b, 0);

  async function handleSave() {
    if (!user || !selected) return;
    setSaving(true);
    await supabase
      .from("signals")
      .upsert(
        {
          user_id: user.id,
          item_id: itemId,
          signal_type: selected,
          comment: comment.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_id" }
      );
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
    if (refreshSignals) await refreshSignals();
  }

  async function handleClear() {
    if (!user || !mySignal) return;
    setClearing(true);
    await supabase
      .from("signals")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId);
    setClearing(false);
    setSelected(null);
    setComment("");
    setMySignal(null);
    if (refreshSignals) await refreshSignals();
  }

  return (
    <div style={{ marginTop: "8px", paddingTop: "10px", borderTop: `1px solid ${palette.border}` }}>

      {/* ── Aggregate pills ── */}
      {totalSignals > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {Object.entries(signalDefs).map(([type, def]) => {
            const count = counts[type];
            if (!count) return null;
            return (
              <span key={type} style={{
                fontSize: "10px",
                fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
                padding: "2px 8px",
                border: `1px solid ${def.border}`,
                borderRadius: "2px",
                color: def.text,
                letterSpacing: "0.3px",
              }}>
                {count} {def.label.toLowerCase()}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Not logged in ── */}
      {!user && (
        <button
          onClick={onOpenAuth}
          style={{
            background: "none", border: "none", padding: 0,
            color: palette.primary, fontSize: "11px",
            fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
            cursor: "pointer", letterSpacing: "0.3px",
          }}
        >
          Sign in to signal →
        </button>
      )}

      {/* ── Logged in ── */}
      {user && (
        <div>
          {/* Signal type buttons */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
            {allowedTypes.map(type => {
              const def = signalDefs[type];
              const active = selected === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelected(active ? null : type)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
                    border: `1px solid ${def.border}`,
                    borderRadius: "2px",
                    backgroundColor: active ? def.activeBg : "transparent",
                    color: active ? def.text : palette.textMuted,
                    cursor: "pointer",
                    fontWeight: active ? "600" : "400",
                    transition: "all 0.1s",
                  }}
                >
                  {def.label}
                </button>
              );
            })}
          </div>

          {/* Comment textarea */}
          {selected && (
            <textarea
              placeholder={COMMENT_PLACEHOLDER[itemStatus] || "Add a note…"}
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px",
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border2}`,
                borderRadius: "3px",
                color: palette.text,
                fontSize: "12px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                marginBottom: "8px",
              }}
            />
          )}

          {/* Save / Clear row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selected && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "5px 14px",
                  fontSize: "11px",
                  fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
                  backgroundColor: saving ? palette.border : palette.primary,
                  border: "none", borderRadius: "2px",
                  color: "#0a0a0a", fontWeight: "600",
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving…" : mySignal ? "Update" : "Save signal"}
              </button>
            )}
            {mySignal && (
              <button
                onClick={handleClear}
                disabled={clearing}
                style={{
                  padding: "5px 10px",
                  fontSize: "11px",
                  fontFamily: "'SF Mono', 'Fira Code', 'IBM Plex Mono', monospace",
                  backgroundColor: "transparent",
                  border: `1px solid ${palette.border}`,
                  borderRadius: "2px",
                  color: palette.textMuted,
                  cursor: clearing ? "default" : "pointer",
                }}
              >
                {clearing ? "Clearing…" : "Clear"}
              </button>
            )}
            {savedMsg && (
              <span style={{ fontSize: "11px", color: "#8aba8a", fontFamily: "'SF Mono', monospace" }}>
                Saved.
              </span>
            )}
            {profile && (
              <span style={{
                fontSize: "10px", color: palette.textFaint,
                fontFamily: "'SF Mono', monospace", marginLeft: "auto",
              }}>
                {profile.name} · {profile.declared_role}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
