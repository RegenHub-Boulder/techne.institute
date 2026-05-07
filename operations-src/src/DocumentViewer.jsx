import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "./contexts/ThemeContext";

// Badge styles are fixed (same in both themes — they're inline status markers)
const badgeStyles = {
  PROPOSED: { bg: "#1a1f1a", border: "#4a6a4a", text: "#8aba8a" },
  DECIDE:   { bg: "#1f1a14", border: "#c4956a", text: "#d4b08a" },
  JEFF:     { bg: "#1a1a22", border: "#6a6a8a", text: "#a0a0c4" },
};

function extractBadges(text) {
  // Convert <!-- PROPOSED: ... --> style comments into a marker format
  // First convert badge-style comments to visible markers
  let result = text.replace(
    /<!--\s*(PROPOSED|DECIDE|JEFF):?\s*(.*?)\s*-->/g,
    (_, type, content) => {
      const t = type.toUpperCase();
      const label = content ? `${t}: ${content.trim()}` : t;
      return `%%BADGE:${t}:${label}%%`;
    }
  );
  // Convert <!-- GOLD --> into a marker usable inside blockquotes
  result = result.replace(/<!--\s*GOLD\s*-->/g, '%%GOLD%%');
  // Then strip any remaining HTML comments (meta/header comments)
  result = result.replace(/<!--[\s\S]*?-->/g, '');
  return result;
}

// Recursively check if a React element tree contains a marker
function hasMarker(node, marker) {
  if (!node) return false;
  if (typeof node === 'string') return node.includes(marker);
  if (Array.isArray(node)) return node.some(n => hasMarker(n, marker));
  if (typeof node === 'object' && node.props) return hasMarker(node.props.children, marker);
  return false;
}
function hasGoldMarker(node) { return hasMarker(node, '%%GOLD%%'); }
function hasHighlightMarker(node) { return hasMarker(node, '%%HIGHLIGHT%%'); }

function Badge({ type, children }) {
  const s = badgeStyles[type] || badgeStyles.PROPOSED;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: "600",
        color: s.text,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "10px",
        padding: "2px 10px",
        margin: "2px 4px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontFamily: "monospace",
      }}
    >
      {children}
    </span>
  );
}

export default function DocumentViewer({ url }) {
  const { palette } = useTheme();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        setContent(extractBadges(text));
        setLoading(false);
      })
      .catch(() => {
        setContent("Failed to load document.");
        setLoading(false);
      });
  }, [url]);

  if (loading) {
    return (
      <div style={{ color: palette.textMuted, padding: "40px", textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        color: palette.text,
        lineHeight: "1.75",
        fontSize: "16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition: "color 0.2s",
      }}
      className="doc-viewer"
    >
      <style>{`
        .doc-viewer h1 { color: ${palette.primary}; font-size: 24px; margin: 32px 0 12px; border-bottom: 1px solid ${palette.border}; padding-bottom: 8px; }
        .doc-viewer h2 { color: ${palette.textBright}; font-size: 20px; margin: 28px 0 10px; }
        .doc-viewer h3 { color: ${palette.textBright}; font-size: 17px; margin: 22px 0 8px; }
        .doc-viewer h4, .doc-viewer h5, .doc-viewer h6 { color: ${palette.textMuted}; font-size: 15px; margin: 18px 0 6px; }
        .doc-viewer p { margin: 10px 0; }
        .doc-viewer ul, .doc-viewer ol { padding-left: 24px; margin: 10px 0; }
        .doc-viewer li { margin: 5px 0; }
        .doc-viewer code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 14px; background: ${palette.surface}; color: ${palette.text}; padding: 2px 6px; border-radius: 3px; }
        .doc-viewer pre { background: ${palette.surface}; padding: 16px; border-radius: 4px; overflow-x: auto; border: 1px solid ${palette.border}; }
        .doc-viewer pre code { background: transparent; padding: 0; }
        .doc-viewer blockquote { border-left: 3px solid ${palette.primary}; padding-left: 16px; color: ${palette.textMuted}; margin: 14px 0; }
        .doc-viewer .gold-quote { border-left: 3px solid #c4956a; padding: 18px 22px; background-color: #1f1a0a; border-radius: 4px; color: #d4a843; margin: 20px 0; font-size: 17px; line-height: 1.75; font-style: normal; }
        .doc-viewer .highlight-quote { border-left: 3px solid ${palette.primary}; padding: 16px 20px; background-color: ${palette.surface2 || palette.surface}; border-radius: 4px; color: ${palette.textBright}; margin: 14px 0; font-size: 15px; line-height: 1.75; font-style: normal; }
        .doc-viewer table { border-collapse: collapse; width: 100%; margin: 14px 0; }
        .doc-viewer th, .doc-viewer td { border: 1px solid ${palette.border}; padding: 9px 14px; text-align: left; font-size: 15px; }
        .doc-viewer th { background: ${palette.surface}; color: ${palette.textBright}; font-weight: 600; }
        .doc-viewer a { color: ${palette.primary}; }
        .doc-viewer hr { border: none; border-top: 1px solid ${palette.border}; margin: 24px 0; }
        .doc-viewer strong { color: ${palette.textBright}; }
        .doc-viewer em { color: ${palette.textMuted}; }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: ({ children }) => {
            if (hasGoldMarker(children)) {
              return <div className="doc-viewer gold-quote">{children}</div>;
            }
            if (hasHighlightMarker(children)) {
              return <div className="doc-viewer highlight-quote">{children}</div>;
            }
            return <blockquote>{children}</blockquote>;
          },
          p: ({ children, ...props }) => <p {...props}>{processChildren(children)}</p>,
          li: ({ children, ...props }) => <li {...props}>{processChildren(children)}</li>,
          h1: ({ children, ...props }) => <h1 {...props}>{processChildren(children)}</h1>,
          h2: ({ children, ...props }) => <h2 {...props}>{processChildren(children)}</h2>,
          h3: ({ children, ...props }) => <h3 {...props}>{processChildren(children)}</h3>,
          h4: ({ children, ...props }) => <h4 {...props}>{processChildren(children)}</h4>,
          td: ({ children, ...props }) => <td {...props}>{processChildren(children)}</td>,
          strong: ({ children, ...props }) => <strong {...props}>{processChildren(children)}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function processChildren(children) {
  if (!children) return children;
  if (!Array.isArray(children)) children = [children];

  return children.map((child, i) => {
    if (typeof child !== "string") return child;
    // Strip block-level flag markers — not rendered as text
    child = child.replace(/%%GOLD%%\s*/g, '');
    child = child.replace(/%%HIGHLIGHT%%\s*/g, '');
    if (!child) return null;
    const parts = [];
    const regex = /%%BADGE:(PROPOSED|DECIDE|JEFF):(.*?)%%/g;
    let match;
    let lastIndex = 0;
    regex.lastIndex = 0;
    while ((match = regex.exec(child)) !== null) {
      if (match.index > lastIndex) parts.push(child.slice(lastIndex, match.index));
      parts.push(<Badge key={`${i}-${match.index}`} type={match[1]}>{match[2]}</Badge>);
      lastIndex = regex.lastIndex;
    }
    if (parts.length === 0) return child;
    if (lastIndex < child.length) parts.push(child.slice(lastIndex));
    return parts;
  }).flat().filter(Boolean);
}
