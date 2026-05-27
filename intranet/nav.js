/**
 * CIS Primary Navigation — RegenHub, LCA
 * Self-injecting nav with Supabase auth, user display, dark/light toggle.
 * Include in <head>: <script src="/intranet/nav.js"></script>
 * Auth-gate a page: <body data-auth-required>
 */
(function () {
  'use strict';

  var AUTH_URL = 'https://hvbdpgkdcdskhpbdeeim.supabase.co';
  var AUTH_KEY = 'sb_publishable_kB69BlNpkNhOllwGMOE6xg_i4l1VHMv';

  /* ── CSS (injected into <head> immediately — safe before <body> exists) ── */
  var css = `
#cis-nav {
  position: sticky; top: 0; z-index: 1000;
  height: 46px;
  background: #131313;
  border-bottom: 1px solid #242424;
  display: flex; align-items: center;
  padding: 0 16px; gap: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  -webkit-font-smoothing: antialiased;
}
[data-mode="light"] #cis-nav {
  background: #f0ebe4;
  border-bottom-color: #cfc7bd;
}

#cis-nav .cn-brand {
  font-family: 'Libre Baskerville', Georgia, serif;
  font-size: 19px;
  color: #c4956a;
  text-decoration: none;
  margin-right: 18px;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.9;
  transition: opacity 120ms;
}
#cis-nav .cn-brand:hover { opacity: 1; }

#cis-nav .cn-links {
  display: flex; gap: 2px; flex: 1;
  overflow-x: auto; scrollbar-width: none;
}
#cis-nav .cn-links::-webkit-scrollbar { display: none; }

#cis-nav .cn-link {
  padding: 5px 9px;
  color: #777;
  text-decoration: none;
  border-radius: 4px;
  font-size: 10.5px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: color 130ms, background 130ms;
}
#cis-nav .cn-link:hover { color: #d4d4d4; background: rgba(255,255,255,0.06); }
#cis-nav .cn-link.on   { color: #c4956a; background: rgba(196,149,106,0.1); }

[data-mode="light"] #cis-nav .cn-link        { color: #888; }
[data-mode="light"] #cis-nav .cn-link:hover  { color: #3d342b; background: rgba(0,0,0,0.05); }
[data-mode="light"] #cis-nav .cn-link.on     { color: #96704a; background: rgba(150,112,74,0.1); }

#cis-nav .cn-right {
  display: flex; align-items: center;
  gap: 8px; margin-left: auto; flex-shrink: 0;
}

/* ── User chip ── */
#cis-nav .cn-chip {
  position: relative;
  display: flex; align-items: center; gap: 7px;
  padding: 4px 10px 4px 5px;
  background: rgba(255,255,255,0.05);
  border: 1px solid #2e2e2e;
  border-radius: 20px;
  cursor: pointer;
  font-size: 10.5px; letter-spacing: 0.03em;
  color: #ccc;
  transition: background 130ms, border-color 130ms;
  user-select: none;
}
#cis-nav .cn-chip:hover { background: rgba(255,255,255,0.09); border-color: #444; }

[data-mode="light"] #cis-nav .cn-chip {
  background: rgba(0,0,0,0.04);
  border-color: #ccc; color: #3d342b;
}
[data-mode="light"] #cis-nav .cn-chip:hover {
  background: rgba(0,0,0,0.08); border-color: #bbb;
}

#cis-nav .cn-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  background: #c4956a; color: #0f0f0f;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; letter-spacing: 0;
}
#cis-nav .cn-uname {
  max-width: 120px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
#cis-nav .cn-caret { font-size: 8px; color: #555; margin-left: 1px; }
[data-mode="light"] #cis-nav .cn-caret { color: #aaa; }

/* ── Dropdown menu ── */
#cis-nav .cn-menu {
  display: none; flex-direction: column; gap: 2px;
  position: absolute; top: calc(100% + 8px); right: 0;
  min-width: 200px;
  background: #1c1c1c; border: 1px solid #303030;
  border-radius: 8px; padding: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-size: 10.5px;
}
#cis-nav .cn-menu.open { display: flex; }

[data-mode="light"] #cis-nav .cn-menu {
  background: #faf7f2; border-color: #ccc;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

#cis-nav .cn-memail {
  padding: 6px 10px 8px;
  font-size: 9.5px; letter-spacing: 0.04em;
  color: #555;
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 4px;
  word-break: break-all;
}
[data-mode="light"] #cis-nav .cn-memail {
  color: #888; border-bottom-color: #e0d8d0;
}

#cis-nav .cn-mitem {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px;
  color: #ccc; text-decoration: none;
  border-radius: 5px; cursor: pointer;
  font-size: 10.5px; letter-spacing: 0.04em;
  font-family: 'IBM Plex Mono', monospace;
  background: none; border: none;
  width: 100%; text-align: left;
  transition: background 110ms, color 110ms;
}
#cis-nav .cn-mitem:hover { background: rgba(255,255,255,0.07); color: #fff; }
#cis-nav .cn-mitem.danger:hover { background: rgba(200,70,70,0.12); color: #e8a0a0; }

[data-mode="light"] #cis-nav .cn-mitem { color: #3d342b; }
[data-mode="light"] #cis-nav .cn-mitem:hover { background: rgba(0,0,0,0.05); color: #1a1a1a; }

#cis-nav .cn-mdivide {
  height: 1px; background: #2a2a2a; margin: 4px 0;
}
[data-mode="light"] #cis-nav .cn-mdivide { background: #e0d8d0; }

/* ── Sign-in link (unauthenticated state) ── */
#cis-nav .cn-signin {
  padding: 5px 12px;
  background: rgba(196,149,106,0.1);
  border: 1px solid rgba(196,149,106,0.3);
  border-radius: 4px;
  color: #c4956a; font-size: 10.5px;
  font-family: 'IBM Plex Mono', monospace;
  text-decoration: none; letter-spacing: 0.05em;
  transition: background 130ms;
}
#cis-nav .cn-signin:hover { background: rgba(196,149,106,0.2); }

/* ── Mode toggle (light/dark) ── */
#cis-nav .cn-mode {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #2e2e2e; border-radius: 4px;
  color: #555; font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  cursor: pointer; letter-spacing: 0.07em;
  transition: color 130ms, border-color 130ms;
}
#cis-nav .cn-mode:hover { color: #aaa; border-color: #444; }
[data-mode="light"] #cis-nav .cn-mode { border-color: #ccc; color: #888; }
[data-mode="light"] #cis-nav .cn-mode:hover { color: #444; border-color: #aaa; }

/* ── Env toggle (dev/prod) ── */
#cis-nav .cn-env {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #2e2e2e; border-radius: 4px;
  color: #555; font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  cursor: pointer; letter-spacing: 0.07em;
  transition: color 130ms, border-color 130ms, background 130ms;
}
#cis-nav .cn-env:hover { color: #aaa; border-color: #444; }
#cis-nav .cn-env.dev {
  color: #5db87a; border-color: rgba(74,180,100,0.35);
  background: rgba(74,180,100,0.06);
}
#cis-nav .cn-env.dev:hover { border-color: rgba(74,180,100,0.55); background: rgba(74,180,100,0.1); }
[data-mode="light"] #cis-nav .cn-env { border-color: #ccc; color: #888; }
[data-mode="light"] #cis-nav .cn-env.dev { color: #3a8a50; border-color: rgba(58,138,80,0.4); background: rgba(58,138,80,0.07); }

/* ── Site footer ── */
#cis-footer {
  margin-top: 60px;
  border-top: 1px solid #1e1e1e;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.07em;
}
[data-mode="light"] #cis-footer { border-top-color: #ddd5c8; }
#cis-footer .cf-left {
  color: #3a3a3a;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
[data-mode="light"] #cis-footer .cf-left { color: #aaa; }
#cis-footer .cf-right {
  display: flex; align-items: center;
  gap: 16px; flex-wrap: wrap;
}
#cis-footer .cf-link {
  color: #555; text-decoration: none;
  transition: color 120ms;
}
#cis-footer .cf-link:hover { color: #c4956a; }
[data-mode="light"] #cis-footer .cf-link { color: #aaa; }
[data-mode="light"] #cis-footer .cf-link:hover { color: #96704a; }
#cis-footer .cf-signout {
  padding: 4px 11px;
  background: transparent;
  border: 1px solid #2e2e2e; border-radius: 4px;
  color: #555;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 120ms, border-color 120ms;
}
#cis-footer .cf-signout:hover { color: #e89090; border-color: rgba(200,70,70,0.4); }
[data-mode="light"] #cis-footer .cf-signout { border-color: #ccc; color: #aaa; }
[data-mode="light"] #cis-footer .cf-signout:hover { color: #b05050; border-color: rgba(176,80,80,0.4); }
`;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* Apply saved theme immediately (before body paint) to avoid flash */
  var savedTheme = localStorage.getItem('cis-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-mode', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-mode', 'light');
  }

  /* Expose env mode globally so pages can read it before nav fully boots */
  window.CIS_DEV_MODE = (localStorage.getItem('cis-env') === 'dev');

  /* ── Everything that touches <body> runs after DOMContentLoaded ── */
  function init() {
    var html = document.documentElement;
    var path = window.location.pathname.replace(/\/?$/, '/');

    function active(href) {
      var h = href.replace(/\/?$/, '/');
      if (h === '/intranet/') return path === '/intranet/';
      return path.startsWith(h);
    }

    function iconSvg(d) {
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
    }
    var ICON_PROFILE = iconSvg('<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>');
    var ICON_SIGNOUT = iconSvg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>');

    var links = [
      { href: '/intranet/',            label: 'CIS'        },
      { href: '/intranet/people/',     label: 'People'     },
      { href: '/intranet/agreements/', label: 'Agreements' },
      { href: '/intranet/treasury/',   label: 'Treasury'   },
      { href: '/intranet/activity/',   label: 'Activity'   },
      { href: '/intranet/board/',      label: 'Board'      },
      { href: '/intranet/enroll/',     label: 'Enroll'     },
    ];

    /* ── Build nav ── */
    var nav = document.createElement('nav');
    nav.id = 'cis-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'CIS primary navigation');
    nav.innerHTML =
      '<a class="cn-brand" href="/intranet/" aria-label="CIS home">\u03c4</a>' +
      '<div class="cn-links">' +
        links.map(function (l) {
          return '<a class="cn-link' + (active(l.href) ? ' on' : '') + '" href="' + l.href + '">' + l.label + '</a>';
        }).join('') +
      '</div>' +
      '<div class="cn-right">' +
        '<div class="cn-chip" id="cn-chip" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">' +
          '<div class="cn-avatar" id="cn-avatar">\u2026</div>' +
          '<span class="cn-uname" id="cn-uname">Loading</span>' +
          '<span class="cn-caret">\u25be</span>' +
          '<div class="cn-menu" id="cn-menu" role="menu">' +
            '<div class="cn-memail" id="cn-memail"></div>' +
            '<a class="cn-mitem" href="/intranet/profile/" role="menuitem">' +
              ICON_PROFILE + ' Edit Profile' +
            '</a>' +
            '<div class="cn-mdivide"></div>' +
            '<button class="cn-mitem danger" id="cn-signout" role="menuitem">' +
              ICON_SIGNOUT + ' Sign out' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<button class="cn-env" id="cn-env" title="Toggle dev / prod view">Prod</button>' +
        '<button class="cn-mode" id="cn-mode">Light</button>' +
      '</div>';

    document.body.insertBefore(nav, document.body.firstChild);

    /* ── Build footer ── */
    var footer = document.createElement('footer');
    footer.id = 'cis-footer';
    footer.innerHTML =
      '<span class="cf-left">RegenHub, LCA &middot; Boulder, CO &middot; #20261215588</span>' +
      '<div class="cf-right">' +
        '<a class="cf-link" href="/cis/">CIS PRD</a>' +
        '<a class="cf-link" href="/tree/">Site index</a>' +
        '<a class="cf-link" href="/">Techne.institute</a>' +
        '<button class="cf-signout" id="cf-signout" style="display:none;">Sign out</button>' +
      '</div>';
    document.body.appendChild(footer);

    /* ── Dark/light toggle ── */
    var modeBtn = document.getElementById('cn-mode');

    function applyTheme(mode) {
      html.setAttribute('data-mode', mode);
      modeBtn.textContent = mode === 'dark' ? 'Light' : 'Dark';
    }

    /* Sync button label with current state (may have been set above) */
    applyTheme(html.getAttribute('data-mode') || 'dark');

    modeBtn.addEventListener('click', function () {
      var next = html.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cis-theme', next);
      applyTheme(next);
    });

    /* ── Dev / Prod env toggle ── */
    var envBtn  = document.getElementById('cn-env');
    var _envMode = localStorage.getItem('cis-env') || 'prod';

    function applyEnv(env) {
      _envMode = env;
      window.CIS_DEV_MODE = (env === 'dev');
      envBtn.textContent = env === 'dev' ? 'Dev' : 'Prod';
      envBtn.classList.toggle('dev', env === 'dev');
      // Show/hide all [data-dev-only] elements on the page
      document.querySelectorAll('[data-dev-only]').forEach(function (el) {
        el.style.display = (env === 'dev') ? '' : 'none';
      });
      // Dispatch so pages can react
      window.dispatchEvent(new CustomEvent('cisenvchange', { detail: { env: env } }));
    }

    // Init from saved pref (default: prod)
    // Run after a tick so page elements exist
    setTimeout(function () { applyEnv(_envMode); }, 0);

    envBtn.addEventListener('click', function () {
      var next = _envMode === 'dev' ? 'prod' : 'dev';
      localStorage.setItem('cis-env', next);
      applyEnv(next);
    });

    /* ── User menu toggle ── */
    var chip = document.getElementById('cn-chip');
    var menu = document.getElementById('cn-menu');

    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      chip.setAttribute('aria-expanded', String(open));
    });
    chip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
      if (e.key === 'Escape') { menu.classList.remove('open'); chip.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('click', function () {
      menu.classList.remove('open');
      chip.setAttribute('aria-expanded', 'false');
    });

    /* ── Auth helpers ── */
    function getInitials(str) {
      if (!str) return '?';
      var clean = str.split('@')[0];
      var parts = clean.split(/[\s._\-]+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return clean.slice(0, 2).toUpperCase();
    }

    function showSignedOut() {
      var c = document.getElementById('cn-chip');
      if (c) c.outerHTML = '<a class="cn-signin" href="/intranet/login/">Sign in</a>';
      window.CIS_SESSION = null;   // signal to comments.js and other widgets
      // Default-deny: redirect unless the page is explicitly marked data-public
      // or we are already on the login page (avoid redirect loop).
      var isPublic = document.body.dataset.public !== undefined;
      var isLoginPage = window.location.pathname.indexOf('/intranet/login') === 0;
      if (!isPublic && !isLoginPage) {
        window.location.href = '/intranet/login/?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }

    function showUser(session) {
      var user = session.user;
      var email = user.email || '';
      var meta = user.user_metadata || {};
      var display = meta.full_name || meta.name || email.split('@')[0] || '?';

      var nameEl   = document.getElementById('cn-uname');
      var emailEl  = document.getElementById('cn-memail');
      var avatarEl = document.getElementById('cn-avatar');
      if (nameEl)   nameEl.textContent   = display;
      if (emailEl)  emailEl.textContent  = email;
      if (avatarEl) avatarEl.textContent = getInitials(display);

      window.cisUser    = { session: session, user: user, email: email, display: display };
      window.CIS_SESSION = session;   // used by comments.js and other intranet widgets
    }

    function initAuth(sb) {
      sb.auth.getSession().then(function (result) {
        var session = result.data && result.data.session;
        if (session) {
          showUser(session);

          function doSignOut() {
            sb.auth.signOut().then(function () {
              window.location.href = '/intranet/login/';
            });
          }

          var navSignout    = document.getElementById('cn-signout');
          var footerSignout = document.getElementById('cf-signout');
          if (navSignout)    navSignout.addEventListener('click', doSignOut);
          if (footerSignout) {
            footerSignout.style.display = '';
            footerSignout.addEventListener('click', doSignOut);
          }

          sb.auth.onAuthStateChange(function (event, newSession) {
            if (event === 'SIGNED_OUT' || !newSession) {
              window.location.href = '/intranet/login/';
            } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
              showUser(newSession);
            }
          });
        } else {
          showSignedOut();
        }
      }).catch(function (err) {
        console.warn('CIS nav auth error:', err);
        var el = document.getElementById('cn-uname');
        if (el) el.textContent = 'Auth error';
      });
    }

    /* Load Supabase if not already present, then init auth */
    function loadSupabaseAndInit() {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        initAuth(window.supabase.createClient(AUTH_URL, AUTH_KEY));
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload  = function () { initAuth(window.supabase.createClient(AUTH_URL, AUTH_KEY)); };
      script.onerror = function () {
        var el = document.getElementById('cn-uname');
        if (el) el.textContent = 'Offline';
      };
      document.head.appendChild(script);
    }

    loadSupabaseAndInit();
  } /* end init() */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
