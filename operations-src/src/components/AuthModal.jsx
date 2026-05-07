import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const ROLES = [
  {
    id: "organizer",
    label: "Organizer",
    desc: "Shaping the bylaws and governance",
    note: "For the 8 founding organizers — subject to verification",
  },
  {
    id: "investor",
    label: "Investor",
    desc: "Exploring capital alignment",
    note: null,
  },
  {
    id: "partner",
    label: "Partner",
    desc: "Potential collaborator or tenant",
    note: null,
  },
];

export default function AuthModal({ onClose, signIn, saveProfile, needsProfile }) {
  const { palette } = useTheme();
  const [step, setStep] = useState(needsProfile ? "profile" : "email");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSendLink(e) {
    e.preventDefault();
    setError(null);
    const { error } = await signIn(email);
    if (error) { setError(error.message); return; }
    setSent(true);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!name.trim() || !role) { setError("Please enter your name and select a role."); return; }
    setSaving(true);
    setError(null);
    const { error } = await saveProfile(name.trim(), role);
    setSaving(false);
    if (error) { setError(error.message); return; }
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border2}`,
        borderRadius: "6px",
        padding: "32px",
        maxWidth: "420px",
        width: "100%",
        position: "relative",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", cursor: "pointer",
            color: palette.textMuted, fontSize: "18px", lineHeight: 1,
            padding: "4px",
          }}
        >×</button>

        {/* ── Email step ── */}
        {step === "email" && !sent && (
          <form onSubmit={handleSendLink}>
            <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "600", color: palette.textBright }}>
              Signal on this document
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: palette.textMuted, lineHeight: "1.5" }}>
              Enter your email. We&apos;ll send a magic link — no password needed.
            </p>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px",
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border2}`,
                borderRadius: "3px",
                color: palette.textBright,
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                marginBottom: "12px",
              }}
            />
            {error && <p style={{ color: palette.error, fontSize: "12px", margin: "0 0 12px" }}>{error}</p>}
            <button
              type="submit"
              style={{
                width: "100%", padding: "10px",
                backgroundColor: palette.primary,
                border: "none", borderRadius: "3px",
                color: "#0a0a0a", fontWeight: "600", fontSize: "13px",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Send link
            </button>
          </form>
        )}

        {/* ── Sent confirmation ── */}
        {step === "email" && sent && (
          <div>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "600", color: palette.textBright }}>
              Check your inbox
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: palette.textMuted, lineHeight: "1.5" }}>
              A magic link is on its way to <strong style={{ color: palette.text }}>{email}</strong>. Click it to sign in — then come back here to signal.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                backgroundColor: "transparent",
                border: `1px solid ${palette.border2}`,
                borderRadius: "3px",
                color: palette.textMuted, fontSize: "12px",
                cursor: "pointer", fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* ── Profile step ── */}
        {step === "profile" && (
          <form onSubmit={handleSaveProfile}>
            <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "600", color: palette.textBright }}>
              Who are you?
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: palette.textMuted, lineHeight: "1.5" }}>
              Help us show your signal in context.
            </p>
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px",
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border2}`,
                borderRadius: "3px",
                color: palette.textBright,
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                marginBottom: "16px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    backgroundColor: role === r.id ? palette.surface2 : "transparent",
                    border: `1px solid ${role === r.id ? palette.primary : palette.border}`,
                    borderRadius: "3px",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "600", color: role === r.id ? palette.primary : palette.text, marginBottom: "2px" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: "11px", color: palette.textMuted }}>
                    {r.desc}
                  </div>
                  {r.note && (
                    <div style={{ fontSize: "10px", color: palette.textFaint, marginTop: "3px", fontFamily: "'SF Mono', monospace" }}>
                      {r.note}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {error && <p style={{ color: palette.error, fontSize: "12px", margin: "0 0 12px" }}>{error}</p>}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", padding: "10px",
                backgroundColor: saving ? palette.primaryDim : palette.primary,
                border: "none", borderRadius: "3px",
                color: "#0a0a0a", fontWeight: "600", fontSize: "13px",
                cursor: saving ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {saving ? "Saving…" : "Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
