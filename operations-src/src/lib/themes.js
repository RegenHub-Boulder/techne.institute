// ── Theme definitions — dark (default) and light ─────────────────────────────

export const darkPalette = {
  bg:           "#0a0a0a",
  surface:      "#141414",
  surface2:     "#1a1a1a",
  border:       "#2a2a2a",
  border2:      "#333333",
  primary:      "#c4956a",
  primaryDim:   "#8a6545",
  primaryGlow:  "rgba(196, 149, 106, 0.08)",
  text:         "#c8c2ba",
  textBright:   "#ece6de",
  textMuted:    "#777777",
  textFaint:    "#444444",
  error:        "#c47070",
  red:          "#c47070",
  green:        "#8aba8a",
};

export const lightPalette = {
  bg:           "#f8f5f0",
  surface:      "#efebe4",
  surface2:     "#e6e0d8",
  border:       "#d4ccc0",
  border2:      "#c4bab0",
  primary:      "#9a6838",
  primaryDim:   "#c4956a",
  primaryGlow:  "rgba(154, 104, 56, 0.06)",
  text:         "#3a342e",
  textBright:   "#1a1410",
  textMuted:    "#7a7068",
  textFaint:    "#b0a898",
  error:        "#9a3a3a",
  red:          "#9a3a3a",
  green:        "#3a7a3a",
};

export const darkStatusColors = {
  ASSUMED:  { bg: "#1a1a1f", border: "#5a7a9a", text: "#7ab0d4",  label: "Assumed"  },
  PROPOSED: { bg: "#1a1f1a", border: "#4a6a4a", text: "#8aba8a",  label: "Proposed" },
  DECIDE:   { bg: "#1f1a14", border: "#c4956a", text: "#d4b08a",  label: "Decide"   },
  JEFF:     { bg: "#1a1a22", border: "#6a6a8a", text: "#a0a0c4",  label: "Jeff"     },
  CARRY:    { bg: "#141414", border: "#444444", text: "#777777",  label: "Carry"    },
};

export const lightStatusColors = {
  ASSUMED:  { bg: "#e8eff8", border: "#4a6a9a", text: "#2a4a7a",  label: "Assumed"  },
  PROPOSED: { bg: "#edf5ed", border: "#4a7a4a", text: "#2a6a2a",  label: "Proposed" },
  DECIDE:   { bg: "#f5ede0", border: "#9a6838", text: "#7a4818",  label: "Decide"   },
  JEFF:     { bg: "#edeff8", border: "#5a5a8a", text: "#3a3a7a",  label: "Jeff"     },
  CARRY:    { bg: "#f0ece6", border: "#c4bab0", text: "#7a7068",  label: "Carry"    },
};

export const darkSignalDefs = {
  support: { label: "Support", border: "#4a6a4a", text: "#8aba8a", activeBg: "#1a2a1a" },
  oppose:  { label: "Oppose",  border: "#6a2a2a", text: "#c47070", activeBg: "#2a1a1a" },
  concern: { label: "Concern", border: "#3a3a6a", text: "#8080c4", activeBg: "#1a1a2a" },
  note:    { label: "Note",    border: "#444444", text: "#999999", activeBg: "#1a1a1a" },
};

export const lightSignalDefs = {
  support: { label: "Support", border: "#4a7a4a", text: "#2a6a2a", activeBg: "#e8f0e8" },
  oppose:  { label: "Oppose",  border: "#8a3a3a", text: "#6a1a1a", activeBg: "#f0e8e8" },
  concern: { label: "Concern", border: "#4a4a8a", text: "#2a2a6a", activeBg: "#e8e8f0" },
  note:    { label: "Note",    border: "#b0a898", text: "#6a6060", activeBg: "#f0ece6" },
};

// ── Convenience lookup by mode string ────────────────────────────────────────
export function getTheme(mode) {
  return {
    palette:      mode === "light" ? lightPalette      : darkPalette,
    statusColors: mode === "light" ? lightStatusColors : darkStatusColors,
    signalDefs:   mode === "light" ? lightSignalDefs   : darkSignalDefs,
    mode,
  };
}
