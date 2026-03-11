import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../contexts/ThemeContext";
import { bylawsLabels } from "../lib/bylawsData";

export default function SignalsAggregate({ onViewed }) {
  const { palette, signalDefs } = useTheme();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      // Step 1: fetch all signals
      const { data: signals, error: sigErr } = await supabase
        .from("signals")
        .select("id, item_id, signal_type, user_id, comment, updated_at")
        .order("updated_at", { ascending: false });

      if (sigErr) { setError(sigErr.message); setLoading(false); return; }
      if (!signals?.length) { setRows([]); setLoading(false); return; }

      // Step 2: fetch profiles for the unique user_ids that appear in signals
      const userIds = [...new Set(signals.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, declared_role")
        .in("id", userIds);

      const profilesById = {};
      (profiles || []).forEach(p => { profilesById[p.id] = p; });

      // Group by item_id
      const grouped = {};
      signals.forEach(row => {
        if (!grouped[row.item_id]) {
          grouped[row.item_id] = { support: 0, oppose: 0, concern: 0, note: 0, comments: [], total: 0 };
        }
        grouped[row.item_id][row.signal_type]++;
        grouped[row.item_id].total++;
        if (row.comment) {
          const prof = profilesById[row.user_id];
          grouped[row.item_id].comments.push({
            text: row.comment,
            type: row.signal_type,
            name: prof?.name || "—",
            role: prof?.declared_role || "—",
            updated_at: row.updated_at,
          });
        }
      });

      const sorted = Object.entries(grouped)
        .map(([item_id, counts]) => ({ item_id, ...counts }))
        .sort((a, b) => b.total - a.total);

      setRows(sorted);
      setLoading(false);

      if (onViewed) onViewed();
    }

    fetchAll();
  }, [onViewed]);

  if (loading) return (
    <div style={{ padding: "40px 32px", color: palette.textMuted, fontFamily: "'SF Mono', monospace", fontSize: "12px" }}>
      Loading signals…
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px 32px", color: palette.error, fontFamily: "'SF Mono', monospace", fontSize: "12px" }}>
      Error: {error}
    </div>
  );

  const totalSignals = rows.reduce((a, r) => a + r.total, 0);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 32px 60px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "600", color: palette.textBright }}>
          Signal Aggregate
        </h2>
        <p style={{ margin: 0, fontSize: "12px", color: palette.textMuted, fontFamily: "'SF Mono', monospace" }}>
          Organizer view · all signals across all participants · {totalSignals} total on {rows.length} items
        </p>
      </div>

      {rows.length === 0 && (
        <p style={{ color: palette.textMuted, fontSize: "13px" }}>No signals yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 70px 70px 70px 70px 50px",
          gap: "8px",
          padding: "8px 12px",
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: "3px 3px 0 0",
        }}>
          {["Item", "Support", "Oppose", "Concern", "Note", "Total"].map(h => (
            <span key={h} style={{
              fontSize: "10px", fontFamily: "'SF Mono', monospace",
              fontWeight: "600", letterSpacing: "1.5px",
              textTransform: "uppercase", color: palette.textFaint,
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, i) => {
          const label = bylawsLabels[row.item_id];
          const isLast = i === rows.length - 1;
          return (
            <div key={row.item_id}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 70px 70px 70px 70px 50px",
                gap: "8px",
                padding: "10px 12px",
                backgroundColor: i % 2 === 0 ? palette.bg : palette.surface,
                border: `1px solid ${palette.border}`,
                borderTop: "none",
                borderRadius: isLast && row.comments.length === 0 ? "0 0 3px 3px" : "0",
              }}>
                <span style={{ fontSize: "12px", color: palette.text, fontFamily: "'SF Mono', monospace" }}>
                  {label ? (
                    <>
                      <span style={{ color: palette.textBright }}>{label}</span>
                      <span style={{ color: palette.textFaint, fontSize: "10px", marginLeft: "6px" }}>({row.item_id})</span>
                    </>
                  ) : row.item_id}
                </span>
                {["support", "oppose", "concern", "note"].map(type => (
                  <span key={type} style={{
                    fontSize: "12px",
                    color: row[type] > 0 ? signalDefs[type].text : palette.textFaint,
                    fontFamily: "'SF Mono', monospace",
                    fontWeight: row[type] > 0 ? "600" : "400",
                  }}>
                    {row[type] || "—"}
                  </span>
                ))}
                <span style={{
                  fontSize: "12px", color: palette.primary,
                  fontFamily: "'SF Mono', monospace", fontWeight: "600",
                }}>
                  {row.total}
                </span>
              </div>

              {/* Comment sub-rows */}
              {row.comments.map((c, ci) => (
                <div key={ci} style={{
                  padding: "8px 12px 8px 28px",
                  backgroundColor: palette.surface2,
                  border: `1px solid ${palette.border}`,
                  borderTop: "none",
                  borderRadius: ci === row.comments.length - 1 && isLast ? "0 0 3px 3px" : "0",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <span style={{
                    fontSize: "10px", fontFamily: "'SF Mono', monospace",
                    color: signalDefs[c.type]?.text || palette.textMuted,
                    minWidth: "52px", paddingTop: "1px",
                  }}>
                    {c.type}
                  </span>
                  <span style={{ fontSize: "12px", color: palette.text, flex: 1, lineHeight: "1.5" }}>
                    {c.text}
                  </span>
                  <span style={{
                    fontSize: "10px", color: palette.textFaint,
                    fontFamily: "'SF Mono', monospace", whiteSpace: "nowrap",
                  }}>
                    {c.name} · {c.role}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
