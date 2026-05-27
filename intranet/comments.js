/**
 * Document Comments — RegenHub, LCA
 *
 * In-document and in-line commenting for /legal pages.
 * Works standalone (manages own Supabase auth) or alongside intranet/nav.js.
 *
 * Usage: <script src="/intranet/comments.js"></script>
 * Data attribute: <body data-doc-path="/legal/bylaws-v2/">
 *
 * Design:
 *   - If window.CIS_SESSION is set by intranet/nav.js, uses it directly.
 *     Otherwise initializes its own Supabase client to check auth state.
 *   - Fetches comments for the current document from Supabase
 *   - Injects count indicators on anchored sections/paragraphs
 *   - Floating "Add comment" button appears on text selection
 *   - Comments panel slides in from the right
 *   - Threads: top-level + replies
 *   - Stewards can resolve/unresolve threads
 *
 * Database: hvbdpgkdcdskhpbdeeim (auth project)
 * Table: public.document_comments
 */
(function () {
  'use strict';

  var DB_URL  = 'https://hvbdpgkdcdskhpbdeeim.supabase.co';
  var DB_KEY  = 'sb_publishable_kB69BlNpkNhOllwGMOE6xg_i4l1VHMv';

  var _session = null;
  var _participant = null;
  var _comments = [];
  var _docPath = '';
  var _panelOpen = false;
  var _focusAnchor = null;    // anchor_id currently highlighted
  var _replyTarget = null;    // comment id being replied to

  /* ── CSS ── */
  var css = `
/* ── CIS Comments ── */
.cmt-indicator {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 10px;
  background: rgba(196,149,106,0.18); border: 1px solid rgba(196,149,106,0.35);
  color: #c4956a; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600;
  cursor: pointer; vertical-align: middle; margin-left: 8px;
  transition: background 0.15s, border-color 0.15s;
  position: relative; z-index: 2;
  flex-shrink: 0;
}
.cmt-indicator:hover,
.cmt-indicator.active {
  background: rgba(196,149,106,0.32); border-color: rgba(196,149,106,0.6);
}
.cmt-indicator.has-unresolved {
  background: rgba(196,149,106,0.22);
}
.cmt-indicator.all-resolved {
  background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.3); color: #4ade80;
}

/* Float button on selection */
#cmt-float-btn {
  display: none; position: fixed; z-index: 9000;
  background: #1a1a1a; border: 1px solid #383838;
  border-radius: 6px; padding: 6px 12px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
  color: #c4956a; cursor: pointer; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  transition: background 0.12s, border-color 0.12s;
  letter-spacing: 0.04em; text-transform: uppercase;
}
#cmt-float-btn:hover { background: #222; border-color: rgba(196,149,106,0.5); }
[data-mode="light"] #cmt-float-btn {
  background: #fff; border-color: #ccc; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* Panel */
#cmt-panel {
  position: fixed; top: 46px; right: 0; bottom: 0; width: 380px;
  background: #161616; border-left: 1px solid #2a2a2a;
  z-index: 800; display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.26s cubic-bezier(0.4,0,0.2,1);
  font-family: 'IBM Plex Mono', monospace;
  -webkit-font-smoothing: antialiased;
}
#cmt-panel.open { transform: translateX(0); }
[data-mode="light"] #cmt-panel {
  background: #f5f3f0; border-left-color: #c8c2ba;
}

#cmt-panel-head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 16px 12px; border-bottom: 1px solid #2a2a2a; flex-shrink: 0;
}
[data-mode="light"] #cmt-panel-head { border-bottom-color: #c8c2ba; }

#cmt-panel-title {
  font-size: 11px; font-weight: 600; color: #c4956a;
  letter-spacing: 0.08em; text-transform: uppercase; flex: 1;
}
#cmt-panel-close {
  background: none; border: none; color: #707070; font-size: 18px;
  cursor: pointer; padding: 0 2px; line-height: 1; border-radius: 4px;
  transition: color 0.12s, background 0.12s; min-width: 26px; min-height: 26px;
}
#cmt-panel-close:hover { color: #d0d0d0; background: #2a2a2a; }
[data-mode="light"] #cmt-panel-close:hover { background: #e8e4dd; color: #333; }

#cmt-panel-filter {
  display: flex; gap: 4px; padding: 8px 16px;
  border-bottom: 1px solid #2a2a2a; flex-shrink: 0;
}
[data-mode="light"] #cmt-panel-filter { border-bottom-color: #c8c2ba; }

.cmt-filter-btn {
  font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 4px; border: 1px solid #2a2a2a;
  background: #222; color: #707070; cursor: pointer;
  transition: all 0.12s; min-height: 24px;
  font-family: 'IBM Plex Mono', monospace;
}
.cmt-filter-btn.active {
  border-color: rgba(196,149,106,0.4); color: #c4956a; background: rgba(196,149,106,0.12);
}
[data-mode="light"] .cmt-filter-btn { background: #f0ede8; border-color: #c8c2ba; color: #888; }
[data-mode="light"] .cmt-filter-btn.active { border-color: #a07850; color: #a07850; background: rgba(160,120,80,0.1); }

#cmt-list { flex: 1; overflow-y: auto; padding: 0 0 80px; }

/* Thread group */
.cmt-thread {
  border-bottom: 1px solid #2a2a2a; padding: 14px 16px 12px;
  cursor: pointer; transition: background 0.12s;
}
.cmt-thread:hover { background: rgba(255,255,255,0.02); }
.cmt-thread.focused { background: rgba(196,149,106,0.06); }
.cmt-thread.resolved { opacity: 0.55; }
[data-mode="light"] .cmt-thread { border-bottom-color: #c8c2ba; }
[data-mode="light"] .cmt-thread.focused { background: rgba(160,120,80,0.06); }

.cmt-thread-anchor {
  font-size: 10px; color: #707070; margin-bottom: 6px;
  display: flex; align-items: center; gap: 5px;
}
.cmt-thread-anchor-link {
  color: #c4956a; text-decoration: none; font-size: 10px;
}
.cmt-thread-anchor-link:hover { text-decoration: underline; }

.cmt-item { display: flex; gap: 8px; }
.cmt-item + .cmt-item { margin-top: 10px; }

.cmt-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(196,149,106,0.18); border: 1px solid rgba(196,149,106,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 600; color: #c4956a;
  flex-shrink: 0; margin-top: 1px;
}
.cmt-avatar.reply-avatar {
  background: #2a2a2a; border-color: #383838; color: #707070;
}
[data-mode="light"] .cmt-avatar.reply-avatar { background: #e8e4dd; border-color: #c8c2ba; color: #888; }

.cmt-bubble-wrap { flex: 1; min-width: 0; }
.cmt-meta {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; color: #707070; margin-bottom: 3px; flex-wrap: wrap;
}
.cmt-author { color: #d0d0d0; font-weight: 600; }
[data-mode="light"] .cmt-author { color: #333; }
.cmt-time { color: #505050; }
[data-mode="light"] .cmt-time { color: #aaa; }
.cmt-resolved-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 1px 6px; border-radius: 3px;
  background: rgba(74,222,128,0.12); color: #4ade80;
}

.cmt-body {
  font-size: 12px; line-height: 1.55; color: #d0d0d0; white-space: pre-wrap; word-break: break-word;
  font-family: Inter, system-ui, sans-serif;
}
[data-mode="light"] .cmt-body { color: #333; }

.cmt-quoted {
  font-size: 11px; font-style: italic; color: #707070;
  border-left: 2px solid #383838; padding-left: 8px;
  margin-bottom: 5px; line-height: 1.45;
  font-family: Inter, system-ui, sans-serif;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
[data-mode="light"] .cmt-quoted { border-left-color: #c8c2ba; color: #888; }

.cmt-actions {
  display: flex; gap: 8px; margin-top: 5px;
}
.cmt-action-btn {
  font-size: 10px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase;
  color: #505050; background: none; border: none; cursor: pointer; padding: 0;
  font-family: 'IBM Plex Mono', monospace;
  transition: color 0.12s;
}
.cmt-action-btn:hover { color: #c4956a; }
[data-mode="light"] .cmt-action-btn { color: #aaa; }
[data-mode="light"] .cmt-action-btn:hover { color: #a07850; }

/* Compose area */
#cmt-compose {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #161616; border-top: 1px solid #2a2a2a; padding: 12px 16px;
  flex-shrink: 0;
}
[data-mode="light"] #cmt-compose { background: #f5f3f0; border-top-color: #c8c2ba; }

#cmt-compose-context {
  font-size: 10px; color: #c4956a; margin-bottom: 6px;
  display: none; font-weight: 600; letter-spacing: 0.04em;
}
#cmt-compose-context.visible { display: block; }
#cmt-compose-quoted {
  font-size: 11px; color: #707070; font-style: italic;
  border-left: 2px solid #383838; padding-left: 7px;
  margin-bottom: 6px; display: none; line-height: 1.4;
  font-family: Inter, system-ui, sans-serif;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
#cmt-compose-quoted.visible { display: -webkit-box; }

#cmt-compose-reply-to {
  font-size: 10px; color: #707070; margin-bottom: 6px; display: none;
  font-family: 'IBM Plex Mono', monospace;
}
#cmt-compose-reply-to.visible { display: block; }
#cmt-compose-reply-cancel {
  color: #c4956a; cursor: pointer; margin-left: 4px;
  background: none; border: none; font-size: 10px; font-family: 'IBM Plex Mono', monospace;
}
#cmt-compose-reply-cancel:hover { text-decoration: underline; }

#cmt-textarea {
  width: 100%; background: #222; border: 1px solid #383838;
  border-radius: 6px; color: #d0d0d0; font-family: Inter, system-ui, sans-serif;
  font-size: 13px; padding: 8px 10px; resize: none; outline: none;
  line-height: 1.5; min-height: 68px; max-height: 180px;
  transition: border-color 0.12s;
}
#cmt-textarea:focus { border-color: rgba(196,149,106,0.5); }
[data-mode="light"] #cmt-textarea { background: #fff; border-color: #c8c2ba; color: #333; }
[data-mode="light"] #cmt-textarea:focus { border-color: #a07850; }

#cmt-compose-row {
  display: flex; justify-content: space-between; align-items: center; margin-top: 7px;
}
#cmt-not-auth {
  font-size: 11px; color: #505050; padding: 8px 0;
}
#cmt-not-auth a { color: #c4956a; }

.cmt-submit-btn {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 5px;
  background: rgba(196,149,106,0.18); border: 1px solid rgba(196,149,106,0.35);
  color: #c4956a; cursor: pointer; min-height: 30px;
  transition: background 0.15s, border-color 0.15s;
}
.cmt-submit-btn:hover { background: rgba(196,149,106,0.28); border-color: rgba(196,149,106,0.55); }
.cmt-submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cmt-char-count { font-size: 10px; color: #505050; }

/* Anchor highlight pulse */
@keyframes cmt-pulse { 0%,100%{background:transparent} 50%{background:rgba(196,149,106,0.12)} }
.cmt-anchor-highlighted { animation: cmt-pulse 0.7s ease-in-out; border-radius: 4px; }

/* Toggle button in document */
#cmt-toggle-btn {
  position: fixed; bottom: 24px; right: 24px; z-index: 790;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(196,149,106,0.18); border: 1px solid rgba(196,149,106,0.35);
  color: #c4956a; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s, transform 0.2s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
#cmt-toggle-btn:hover { background: rgba(196,149,106,0.28); border-color: rgba(196,149,106,0.55); }
#cmt-toggle-btn.panel-open { transform: rotate(180deg); }

.cmt-toggle-count {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px;
  background: #c4956a; color: #0c0c0c;
  font-size: 9px; font-weight: 700; font-family: 'IBM Plex Mono', monospace;
  display: flex; align-items: center; justify-content: center;
}

/* State messages in panel */
.cmt-state { padding: 2rem 1rem; text-align: center; font-size: 12px; color: #505050; }
.cmt-state.error { color: #ef4444; }

/* Responsive */
@media (max-width: 820px) {
  #cmt-panel { width: 100%; top: 46px; }
}
`;

  /* ── Helpers ── */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function relTime(iso) {
    if (!iso) return '';
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 30) return Math.floor(diff / 86400) + 'd ago';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function initials(name) {
    return (name || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function hdrs(token) {
    var h = {
      'apikey': DB_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    if (token) h['Authorization'] = 'Bearer ' + token;
    else        h['Authorization'] = 'Bearer ' + DB_KEY;
    return h;
  }

  /* ── Supabase REST helpers ── */
  function fetchComments() {
    var token = _session ? _session.access_token : null;
    return fetch(
      DB_URL + '/rest/v1/document_comments' +
        '?document_path=eq.' + encodeURIComponent(_docPath) +
        '&order=created_at.asc&limit=500',
      { headers: hdrs(token) }
    ).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  function lookupParticipant(userId) {
    var token = _session ? _session.access_token : null;
    return fetch(
      DB_URL + '/rest/v1/participants?auth_user_id=eq.' + userId + '&limit=1&select=id,display_name,name,participant_type',
      { headers: hdrs(token) }
    ).then(function (r) { return r.json(); });
  }

  function insertComment(payload) {
    return fetch(DB_URL + '/rest/v1/document_comments', {
      method: 'POST',
      headers: hdrs(_session.access_token),
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  function patchComment(id, patch) {
    return fetch(DB_URL + '/rest/v1/document_comments?id=eq.' + id, {
      method: 'PATCH',
      headers: hdrs(_session.access_token),
      body: JSON.stringify(patch),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  /* ── DOM ── */
  var _panel, _list, _textarea, _composeCtx, _composeQuoted, _replyInfo, _toggleBtn, _floatBtn;

  function buildUI() {
    // CSS
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Float button (appears on text selection)
    _floatBtn = document.createElement('button');
    _floatBtn.id = 'cmt-float-btn';
    _floatBtn.textContent = '+ Comment';
    document.body.appendChild(_floatBtn);

    // Panel
    _panel = document.createElement('div');
    _panel.id = 'cmt-panel';
    _panel.setAttribute('role', 'complementary');
    _panel.setAttribute('aria-label', 'Document comments');
    _panel.innerHTML = `
      <div id="cmt-panel-head">
        <span id="cmt-panel-title">Comments</span>
        <button id="cmt-panel-close" aria-label="Close comments">&times;</button>
      </div>
      <div id="cmt-panel-filter">
        <button class="cmt-filter-btn active" data-filter="all">All</button>
        <button class="cmt-filter-btn" data-filter="open">Open</button>
        <button class="cmt-filter-btn" data-filter="resolved">Resolved</button>
      </div>
      <div id="cmt-list"><div class="cmt-state">Loading…</div></div>
      <div id="cmt-compose">
        <div id="cmt-compose-context"></div>
        <div id="cmt-compose-quoted"></div>
        <div id="cmt-compose-reply-to"></div>
        <textarea id="cmt-textarea" placeholder="Add a comment…" rows="3" maxlength="2000"></textarea>
        <div id="cmt-compose-row">
          <span class="cmt-char-count" id="cmt-char-count">0/2000</span>
          <button class="cmt-submit-btn" id="cmt-submit">Post</button>
        </div>
        <div id="cmt-not-auth" style="display:none">
          <a href="/intranet/login/?redirect=${encodeURIComponent(window.location.pathname)}">Sign in</a> to add comments.
        </div>
      </div>
    `;
    document.body.appendChild(_panel);

    // Toggle button
    _toggleBtn = document.createElement('button');
    _toggleBtn.id = 'cmt-toggle-btn';
    _toggleBtn.setAttribute('aria-label', 'Toggle comments');
    _toggleBtn.innerHTML = '&#x1F4AC;'; // chat bubble
    document.body.appendChild(_toggleBtn);

    // Refs
    _list          = document.getElementById('cmt-list');
    _textarea      = document.getElementById('cmt-textarea');
    _composeCtx    = document.getElementById('cmt-compose-context');
    _composeQuoted = document.getElementById('cmt-compose-quoted');
    _replyInfo     = document.getElementById('cmt-compose-reply-to');

    // Events
    document.getElementById('cmt-panel-close').addEventListener('click', closePanel);
    _toggleBtn.addEventListener('click', function () {
      _panelOpen ? closePanel() : openPanel();
    });

    // Filter
    document.getElementById('cmt-panel-filter').addEventListener('click', function (e) {
      var btn = e.target.closest('.cmt-filter-btn');
      if (!btn) return;
      document.querySelectorAll('.cmt-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderList(btn.dataset.filter);
    });

    // Textarea char counter
    _textarea.addEventListener('input', function () {
      document.getElementById('cmt-char-count').textContent = _textarea.value.length + '/2000';
    });

    // Submit
    document.getElementById('cmt-submit').addEventListener('click', submitComment);

    // Float button
    _floatBtn.addEventListener('click', function () {
      var sel = window.getSelection();
      if (sel && sel.toString().trim()) {
        openPanelWithSelection(sel);
      }
      _floatBtn.style.display = 'none';
    });

    // Selection listener
    document.addEventListener('mouseup', onSelection);
    document.addEventListener('touchend', onSelection);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _panelOpen) closePanel();
    });

    // Auth state
    if (!_session) {
      document.getElementById('cmt-submit').style.display = 'none';
      document.getElementById('cmt-textarea').style.display = 'none';
      document.getElementById('cmt-not-auth').style.display = 'block';
    }
  }

  /* ── Selection handling ── */
  var _pendingAnchor = null;
  var _pendingQuote  = null;

  function onSelection(e) {
    // Ignore clicks inside the panel
    if (_panel && _panel.contains(e.target)) return;
    if (_floatBtn && _floatBtn.contains(e.target)) return;

    setTimeout(function () {
      var sel = window.getSelection();
      if (!sel || !sel.toString().trim() || sel.isCollapsed) {
        _floatBtn.style.display = 'none';
        return;
      }
      if (!_session) return; // not authenticated, no float button

      // Find nearest anchored element
      var node = sel.anchorNode;
      var anchor = nearestAnchor(node);
      _pendingAnchor = anchor;
      _pendingQuote  = sel.toString().trim().slice(0, 300);

      // Position float button near selection
      var range = sel.getRangeAt(0);
      var rect  = range.getBoundingClientRect();
      _floatBtn.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
      _floatBtn.style.left = Math.max(8, rect.left + window.scrollX) + 'px';
      _floatBtn.style.display = 'block';
    }, 10);
  }

  function nearestAnchor(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      if (el.id) return el.id;
      el = el.parentElement;
    }
    return null;
  }

  /* ── Panel ── */
  function openPanel(anchorId) {
    _panelOpen = true;
    _panel.classList.add('open');
    _toggleBtn.classList.add('panel-open');
    if (anchorId) focusAnchor(anchorId);
    // Shift main content if it has a max-width wrapper
    var mains = document.querySelectorAll('.legal-body, .article-body, main, .content');
    mains.forEach(function (m) { m.style.transition = 'margin-right 0.26s'; m.style.marginRight = '380px'; });
  }

  function closePanel() {
    _panelOpen = false;
    _panel.classList.remove('open');
    _toggleBtn.classList.remove('panel-open');
    clearFocusAnchor();
    var mains = document.querySelectorAll('.legal-body, .article-body, main, .content');
    mains.forEach(function (m) { m.style.marginRight = ''; });
  }

  function openPanelWithSelection(sel) {
    openPanel(_pendingAnchor);
    _composeCtx.textContent = _pendingAnchor ? 'Commenting on: #' + _pendingAnchor : 'Commenting on document';
    _composeCtx.classList.add('visible');
    if (_pendingQuote) {
      _composeQuoted.textContent = '\u201c' + _pendingQuote + '\u201d';
      _composeQuoted.classList.add('visible');
    }
    _textarea.focus();
  }

  function focusAnchor(anchorId) {
    clearFocusAnchor();
    _focusAnchor = anchorId;
    var el = anchorId ? document.getElementById(anchorId) : null;
    if (el) {
      el.classList.add('cmt-anchor-highlighted');
      setTimeout(function () { el.classList.remove('cmt-anchor-highlighted'); }, 700);
    }
    // Highlight indicator
    document.querySelectorAll('.cmt-indicator').forEach(function (ind) {
      ind.classList.toggle('active', ind.dataset.anchor === anchorId);
    });
    // Scroll matching threads into view
    if (anchorId) {
      var thread = _list.querySelector('[data-anchor="' + anchorId + '"]');
      if (thread) thread.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function clearFocusAnchor() {
    _focusAnchor = null;
    document.querySelectorAll('.cmt-indicator').forEach(function (ind) { ind.classList.remove('active'); });
  }

  /* ── Render ── */
  function renderList(filter) {
    filter = filter || 'all';
    _list.innerHTML = '';

    // Group into threads: root comments + their replies
    var roots   = _comments.filter(function (c) { return !c.parent_id; });
    var replies  = _comments.filter(function (c) { return !!c.parent_id; });

    if (filter === 'open')     roots = roots.filter(function (c) { return !c.resolved; });
    if (filter === 'resolved') roots = roots.filter(function (c) { return c.resolved; });

    if (!roots.length) {
      var msg = document.createElement('div');
      msg.className = 'cmt-state';
      msg.textContent = _comments.length ? 'No comments match this filter.' : 'No comments yet. Select text or click a section to add one.';
      _list.appendChild(msg);
      return;
    }

    roots.forEach(function (root) {
      var threadReplies = replies.filter(function (r) { return r.thread_root_id === root.id || r.parent_id === root.id; });
      var threadEl = buildThread(root, threadReplies);
      _list.appendChild(threadEl);
    });
  }

  function buildThread(root, replies) {
    var div = document.createElement('div');
    div.className = 'cmt-thread' + (root.resolved ? ' resolved' : '') + (_focusAnchor === root.anchor_id ? ' focused' : '');
    div.dataset.anchor = root.anchor_id || '';
    div.dataset.threadId = root.id;

    var anchorLabel = root.anchor_label || root.anchor_id || 'Document';
    var anchorHTML = '';
    if (root.anchor_id) {
      anchorHTML = '<span class="cmt-thread-anchor">' +
        '<a class="cmt-thread-anchor-link" href="#' + esc(root.anchor_id) + '" onclick="event.stopPropagation()">§ ' + esc(anchorLabel) + '</a>' +
        (root.resolved ? '<span class="cmt-resolved-badge">Resolved</span>' : '') +
        '</span>';
    } else if (root.resolved) {
      anchorHTML = '<span class="cmt-thread-anchor"><span class="cmt-resolved-badge">Resolved</span></span>';
    }

    var rootHTML = buildCommentHTML(root, false);
    var repliesHTML = replies.map(function (r) { return buildCommentHTML(r, true); }).join('');

    div.innerHTML = anchorHTML + rootHTML + repliesHTML;

    // Click thread → focus anchor
    div.addEventListener('click', function (e) {
      if (e.target.closest('button') || e.target.closest('a')) return;
      if (root.anchor_id) focusAnchor(root.anchor_id);
    });

    // Wire up reply / resolve buttons
    div.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action    = btn.dataset.action;
        var commentId = btn.dataset.id;
        if (action === 'reply') startReply(root, commentId);
        if (action === 'resolve') toggleResolve(root);
        if (action === 'delete') deleteComment(commentId);
      });
    });

    return div;
  }

  function buildCommentHTML(c, isReply) {
    var ini = initials(c.author_name);
    var avClass = isReply ? 'cmt-avatar reply-avatar' : 'cmt-avatar';
    var quoteHTML = c.anchor_text ? '<div class="cmt-quoted">\u201c' + esc(c.anchor_text) + '\u201d</div>' : '';
    var canDelete = _participant && (_participant.id === c.author_id || _participant.participant_type === 'steward');
    var canResolve = !isReply && _participant && (_participant.participant_type === 'steward' || _participant.id === c.author_id);

    return '<div class="cmt-item" data-comment-id="' + c.id + '">' +
      '<div class="' + avClass + '">' + ini + '</div>' +
      '<div class="cmt-bubble-wrap">' +
        '<div class="cmt-meta">' +
          '<span class="cmt-author">' + esc(c.author_name) + '</span>' +
          '<span class="cmt-time">' + relTime(c.created_at) + '</span>' +
        '</div>' +
        quoteHTML +
        '<div class="cmt-body">' + esc(c.body) + '</div>' +
        (_session ? '<div class="cmt-actions">' +
          (!isReply ? '<button class="cmt-action-btn" data-action="reply" data-id="' + c.id + '">Reply</button>' : '') +
          (canResolve ? '<button class="cmt-action-btn" data-action="resolve" data-id="' + c.id + '">' + (c.resolved ? 'Unresolve' : 'Resolve') + '</button>' : '') +
          (canDelete ? '<button class="cmt-action-btn" data-action="delete" data-id="' + c.id + '">Delete</button>' : '') +
        '</div>' : '') +
      '</div>' +
    '</div>';
  }

  /* ── Compose state ── */
  function setComposeAnchor(anchorId, label, quote) {
    _pendingAnchor = anchorId;
    _pendingQuote  = quote || null;

    if (anchorId || label) {
      _composeCtx.textContent = 'Commenting on: ' + (label || '#' + anchorId);
      _composeCtx.classList.add('visible');
    } else {
      _composeCtx.textContent = '';
      _composeCtx.classList.remove('visible');
    }

    if (quote) {
      _composeQuoted.textContent = '\u201c' + quote + '\u201d';
      _composeQuoted.classList.add('visible');
    } else {
      _composeQuoted.textContent = '';
      _composeQuoted.classList.remove('visible');
    }
  }

  function startReply(rootComment, replyToId) {
    _replyTarget = replyToId;
    var replyToName = '';
    var c = _comments.find(function (x) { return x.id === replyToId; });
    if (c) replyToName = c.author_name;

    _replyInfo.innerHTML = 'Replying to <strong>' + esc(replyToName) + '</strong> ' +
      '<button id="cmt-compose-reply-cancel">Cancel</button>';
    _replyInfo.classList.add('visible');
    document.getElementById('cmt-compose-reply-cancel').addEventListener('click', clearReply);
    setComposeAnchor(rootComment.anchor_id, rootComment.anchor_label, null);
    _textarea.focus();
  }

  function clearReply() {
    _replyTarget = null;
    _replyInfo.textContent = '';
    _replyInfo.classList.remove('visible');
  }

  /* ── Comment actions ── */
  function submitComment() {
    var body = _textarea.value.trim();
    if (!body || !_session || !_participant) return;
    var btn = document.getElementById('cmt-submit');
    btn.disabled = true;
    btn.textContent = 'Posting…';

    var payload = {
      document_path: _docPath,
      anchor_id:     _pendingAnchor || null,
      anchor_type:   _replyTarget ? 'reply' : (_pendingAnchor ? 'section' : 'document'),
      anchor_text:   _pendingQuote || null,
      body:          body,
      author_id:     _participant.id,
      author_name:   _participant.display_name || _participant.name || 'Member',
      parent_id:     _replyTarget || null,
      thread_root_id: _replyTarget ? getRootId(_replyTarget) : null,
    };

    // anchor_label from the DOM element
    if (_pendingAnchor) {
      var el = document.getElementById(_pendingAnchor);
      if (el) payload.anchor_label = el.textContent.trim().slice(0, 80);
    }

    insertComment(payload)
      .then(function () {
        _textarea.value = '';
        document.getElementById('cmt-char-count').textContent = '0/2000';
        clearReply();
        setComposeAnchor(null, null, null);
        _pendingAnchor = null;
        _pendingQuote  = null;
        return reload();
      })
      .catch(function (err) {
        alert('Error posting comment: ' + err.message);
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Post';
      });
  }

  function getRootId(commentId) {
    var c = _comments.find(function (x) { return x.id === commentId; });
    if (!c) return commentId;
    return c.thread_root_id || c.id;
  }

  function toggleResolve(root) {
    if (!_session || !_participant) return;
    var now = new Date().toISOString();
    var patch = root.resolved
      ? { resolved: false, resolved_by: null, resolved_at: null }
      : { resolved: true, resolved_by: _participant.id, resolved_at: now };
    patchComment(root.id, patch).then(reload).catch(function (err) { alert(err.message); });
  }

  function deleteComment(id) {
    if (!confirm('Delete this comment?')) return;
    fetch(DB_URL + '/rest/v1/document_comments?id=eq.' + id, {
      method: 'DELETE',
      headers: hdrs(_session ? _session.access_token : null),
    }).then(reload).catch(function (err) { alert(err.message); });
  }

  /* ── Indicators ── */
  function injectIndicators() {
    // Remove old indicators
    document.querySelectorAll('.cmt-indicator').forEach(function (el) { el.remove(); });

    // Group comments by anchor_id
    var byAnchor = {};
    _comments.forEach(function (c) {
      if (!c.parent_id) {
        var k = c.anchor_id || '__doc__';
        if (!byAnchor[k]) byAnchor[k] = [];
        byAnchor[k].push(c);
      }
    });

    Object.keys(byAnchor).forEach(function (anchorId) {
      if (anchorId === '__doc__') return; // skip document-level for now
      var threads = byAnchor[anchorId];
      var el = document.getElementById(anchorId);
      if (!el) return;

      var allResolved = threads.every(function (c) { return c.resolved; });
      var count = threads.length;

      var ind = document.createElement('button');
      ind.className = 'cmt-indicator' + (allResolved ? ' all-resolved' : ' has-unresolved');
      ind.textContent = count;
      ind.title = count + ' comment' + (count !== 1 ? 's' : '') + (allResolved ? ' (resolved)' : '');
      ind.dataset.anchor = anchorId;
      ind.setAttribute('aria-label', 'View comments on this section');

      ind.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!_panelOpen) openPanel(anchorId);
        else focusAnchor(anchorId);
      });

      // Insert after the element (or inside if it's a heading)
      var tag = el.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        el.appendChild(ind);
      } else {
        el.parentNode.insertBefore(ind, el.nextSibling);
      }
    });

    // Update toggle badge
    var openThreads = _comments.filter(function (c) { return !c.parent_id && !c.resolved; }).length;
    var badge = _toggleBtn.querySelector('.cmt-toggle-count');
    if (!badge && openThreads > 0) {
      badge = document.createElement('span');
      badge.className = 'cmt-toggle-count';
      _toggleBtn.appendChild(badge);
    }
    if (badge) {
      if (openThreads > 0) { badge.textContent = openThreads; badge.style.display = 'flex'; }
      else badge.style.display = 'none';
    }
  }

  /* ── Click anchors to open panel ── */
  function wireAnchors() {
    // Any element with an id in the legal body can receive comments on click+option/alt
    // Simpler: clicking on section headings opens the compose panel focused on that section
    var headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], .sec-head[id], [id^="art-"], [id^="sec-"], [id^="sub-"]');
    headings.forEach(function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) {
        // Only if no text is selected
        var sel = window.getSelection();
        if (sel && sel.toString().trim()) return;
        if (!_session) return;
        if (!_panelOpen) openPanel(el.id);
        setComposeAnchor(el.id, el.textContent.trim().slice(0, 60), null);
        _textarea.focus();
      });
    });
  }

  /* ── Load & reload ── */
  function reload() {
    var activeFilter = (document.querySelector('.cmt-filter-btn.active') || {}).dataset;
    var filter = activeFilter ? activeFilter.filter : 'all';
    return fetchComments().then(function (data) {
      _comments = data;
      renderList(filter);
      injectIndicators();
    }).catch(function (err) {
      _list.innerHTML = '<div class="cmt-state error">Error loading comments: ' + esc(err.message) + '</div>';
    });
  }

  /* ── Init ── */
  function init() {
    _docPath = (document.body.dataset.docPath || window.location.pathname).replace(/\/$/, '') + '/';

    buildUI();

    // Wait for nav.js auth state
    // nav.js sets window.CIS_SESSION when auth resolves
    waitForSession(function (session) {
      _session = session;

      if (session) {
        var userId = session.user && session.user.id;
        if (userId) {
          lookupParticipant(userId).then(function (rows) {
            _participant = rows && rows[0] ? rows[0] : null;
          });
        }
        // Show compose
        document.getElementById('cmt-textarea').style.display = '';
        document.getElementById('cmt-submit').style.display = '';
        document.getElementById('cmt-not-auth').style.display = 'none';
      }

      reload().then(wireAnchors);
    });
  }

  function waitForSession(cb) {
    // If intranet/nav.js has already resolved auth, use its result immediately.
    if (typeof window.CIS_SESSION !== 'undefined') {
      cb(window.CIS_SESSION);
      return;
    }

    // If intranet/nav.js is present (script tag on page), wait for it to set CIS_SESSION.
    var intranetNavPresent = !!document.querySelector('script[src*="/intranet/nav.js"]');
    if (intranetNavPresent) {
      var attempts = 0;
      var iv = setInterval(function () {
        attempts++;
        if (typeof window.CIS_SESSION !== 'undefined') {
          clearInterval(iv);
          cb(window.CIS_SESSION);
        } else if (attempts > 50) { // 5s timeout
          clearInterval(iv);
          cb(null);
        }
      }, 100);
      return;
    }

    // Standalone: initialize our own Supabase client to get the current session.
    function initOwnClient(sbFactory) {
      var sb = sbFactory.createClient(DB_URL, DB_KEY);
      sb.auth.getSession().then(function (result) {
        var session = result.data && result.data.session;
        window.CIS_SESSION = session || null;
        cb(session || null);

        // Listen for auth changes while on the page
        sb.auth.onAuthStateChange(function (event, newSession) {
          window.CIS_SESSION = newSession || null;
          if (event === 'SIGNED_IN') {
            _session = newSession;
            if (newSession && newSession.user) {
              lookupParticipant(newSession.user.id).then(function (rows) {
                _participant = rows && rows[0] ? rows[0] : null;
                document.getElementById('cmt-textarea').style.display = '';
                document.getElementById('cmt-submit').style.display = '';
                document.getElementById('cmt-not-auth').style.display = 'none';
              });
            }
            reload();
          } else if (event === 'SIGNED_OUT') {
            _session = null;
            _participant = null;
            document.getElementById('cmt-textarea').style.display = 'none';
            document.getElementById('cmt-submit').style.display = 'none';
            document.getElementById('cmt-not-auth').style.display = 'block';
            reload();
          }
        });
      }).catch(function () { cb(null); });
    }

    // Load Supabase SDK if not already present
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      initOwnClient(window.supabase);
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload  = function () { initOwnClient(window.supabase); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  /* ── Run ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
