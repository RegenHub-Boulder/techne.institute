/**
 * Techne Navigation Web Component
 * techne.institute/assets/nav.js
 *
 * Usage in static HTML:
 *   <script src="/assets/nav.js"></script>
 *   <techne-nav mode="public" active-section="formation"></techne-nav>
 *
 * Props:
 *   mode          "public" | "investor" | "intranet"  (default: "public")
 *   active-section  slug matching a nav link key       (default: "")
 *   user-name       display name (intranet mode only)  (default: "")
 *   user-class      membership class label             (default: "")
 *
 * Sprint P364 (R3-C) — 2026-04-06
 * Updated P426 — 2026-04-09 (light/dark toggle, copper-gold accent)
 */

class TechneNav extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'active-section', 'user-name', 'user-class'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._menuOpen = false;
    this._themeObserver = null;
  }

  connectedCallback() {
    this._render();
    this._attachListeners();
  }

  disconnectedCallback() {
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this._render();
      this._attachListeners();
    }
  }

  get mode() { return this.getAttribute('mode') || 'public'; }
  get activeSection() { return this.getAttribute('active-section') || ''; }
  get userName() { return this.getAttribute('user-name') || ''; }
  get userClass() { return this.getAttribute('user-class') || ''; }

  _publicLinks() {
    return [
      { key: 'membership',   label: 'Membership',   href: '/membership/' },
      { key: 'about',        label: 'About',        href: '/about/' },
    ];
  }

  _investorLinks() {
    return [
      ...this._publicLinks(),
      { key: 'data-room', label: 'Data Room', href: '/data-room/' },
    ];
  }

  _intranetLinks() {
    return [
      { key: 'account',    label: 'Account',    href: '/intranet/account/' },
      { key: 'patronage',  label: 'Patronage',  href: '/intranet/patronage/' },
      { key: 'documents',  label: 'Documents',  href: '/intranet/documents/' },
      { key: 'operations', label: 'Operations', href: '/intranet/operations/' },
    ];
  }

  _links() {
    if (this.mode === 'intranet') return this._intranetLinks();
    if (this.mode === 'investor') return this._investorLinks();
    return this._publicLinks();
  }

  _cta() {
    if (this.mode === 'intranet') {
      return `
        <div class="user-info">
          ${this.userName ? `<span class="user-name">${this._esc(this.userName)}</span>` : ''}
          ${this.userClass ? `<span class="user-class">${this._esc(this.userClass)}</span>` : ''}
        </div>
        <a href="/intranet/login/?action=signout" class="btn-signout">Sign out</a>
      `;
    }
    if (this.mode === 'investor') {
      return `
        <a href="/intranet/" class="btn-signin locked" aria-label="Intranet — member login required">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          Intranet
        </a>
      `;
    }
    return `<a href="/intranet/" class="btn-signin">Sign in</a>`;
  }

  _themeToggleBtn() {
    // Sun icon (show in dark mode — clicking switches to light)
    const sun = `<svg class="icon-sun" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3"/>
      <line x1="8" y1="1" x2="8" y2="3"/>
      <line x1="8" y1="13" x2="8" y2="15"/>
      <line x1="1" y1="8" x2="3" y2="8"/>
      <line x1="13" y1="8" x2="15" y2="8"/>
      <line x1="3.05" y1="3.05" x2="4.46" y2="4.46"/>
      <line x1="11.54" y1="11.54" x2="12.95" y2="12.95"/>
      <line x1="12.95" y1="3.05" x2="11.54" y2="4.46"/>
      <line x1="4.46" y1="11.54" x2="3.05" y2="12.95"/>
    </svg>`;
    // Moon icon (show in light mode — clicking switches to dark)
    const moon = `<svg class="icon-moon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <path d="M7 2a6 6 0 1 0 7 7 4.5 4.5 0 0 1-7-7z"/>
    </svg>`;
    return `<button class="theme-btn" id="theme-toggle" aria-label="Toggle light/dark mode">${sun}${moon}</button>`;
  }

  _esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  _currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  _updateThemeBtn(btn) {
    if (!btn) return;
    const theme = this._currentTheme();
    const sun = btn.querySelector('.icon-sun');
    const moon = btn.querySelector('.icon-moon');
    if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none';
    if (moon) moon.style.display = theme === 'dark' ? 'none' : 'block';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  _render() {
    const links = this._links();
    const isIntranet = this.mode === 'intranet';

    const navLinks = links.map(link => {
      const isActive = this.activeSection === link.key;
      return `
        <li>
          <a href="${link.href}"
             class="nav-link${isActive ? ' active' : ''}"
             ${isActive ? 'aria-current="page"' : ''}>
            ${link.label}
          </a>
        </li>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          /* Light mode defaults */
          --nav-bg:         #f7f5f0;
          --nav-border:     #d8d3c8;
          --nav-text:       #6a6560;
          --nav-text-hover: #1a1a1f;
          --nav-active:     #c4956a;
          --nav-wordmark:   #1a1a1f;
          --nav-height: 52px;
          font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
        }

        /* Dark mode — responds to data-theme="dark" on any ancestor (incl. <html>) */
        :host-context([data-theme="dark"]) {
          --nav-bg:         #0f0f12;
          --nav-border:     #2a2a30;
          --nav-text:       #9a958a;
          --nav-text-hover: #f7f5f0;
          --nav-wordmark:   #e8e4df;
        }

        nav {
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          height: var(--nav-height);
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 100%;
        }

        .wordmark {
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--nav-wordmark);
          text-decoration: none;
          opacity: 0.9;
          transition: opacity 200ms, color 0.2s ease;
        }
        .wordmark:hover { opacity: 0.6; }

        .links {
          display: flex;
          align-items: center;
          gap: 0;
          list-style: none;
        }

        .nav-link {
          display: block;
          padding: 0 1rem;
          height: var(--nav-height);
          line-height: var(--nav-height);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-text);
          text-decoration: none;
          position: relative;
          transition: color 200ms;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 1rem; right: 1rem;
          height: 2px;
          background: var(--nav-active);
          transform: scaleX(0);
          transition: transform 200ms ease;
        }
        .nav-link:hover { color: var(--nav-text-hover); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: var(--nav-active); }
        .nav-link.active::after { transform: scaleX(1); }
        .nav-link:focus-visible {
          outline: 2px solid var(--nav-active);
          outline-offset: -2px;
        }

        /* Right side */
        .right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }
        .user-name {
          font-size: 0.7rem;
          color: var(--nav-text-hover);
          letter-spacing: 0.04em;
        }
        .user-class {
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--nav-text);
        }

        /* Theme toggle */
        .theme-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--nav-text);
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 200ms;
          line-height: 0;
        }
        .theme-btn:hover { color: var(--nav-text-hover); }
        .theme-btn:focus-visible { outline: 2px solid var(--nav-active); border-radius: 4px; }

        .btn-signin {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-active);
          text-decoration: none;
          padding: 0.3rem 0.75rem;
          border: 1px solid rgba(196, 149, 106, 0.4);
          border-radius: 3px;
          transition: background 200ms, color 200ms;
        }
        .btn-signin:hover {
          background: rgba(196, 149, 106, 0.08);
        }
        .btn-signin.locked {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--nav-text);
          border-color: var(--nav-border);
        }
        .btn-signin.locked:hover {
          color: var(--nav-active);
          border-color: rgba(196, 149, 106, 0.4);
          background: rgba(196, 149, 106, 0.06);
        }

        .btn-signout {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-text);
          text-decoration: none;
          padding: 0.3rem 0.75rem;
          border: 1px solid var(--nav-border);
          border-radius: 3px;
          transition: color 200ms, border-color 200ms;
        }
        .btn-signout:hover { color: var(--nav-text-hover); }

        /* Hamburger */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
        }
        .hamburger span {
          display: block;
          width: 20px; height: 1.5px;
          background: var(--nav-text);
          transition: background 200ms;
        }
        .hamburger:hover span { background: var(--nav-text-hover); }
        .hamburger:focus-visible { outline: 2px solid var(--nav-active); border-radius: 2px; }

        /* Mobile */
        @media (max-width: 768px) {
          nav { height: auto; }
          .inner { flex-wrap: wrap; padding: 0.75rem 1rem; gap: 0.5rem; height: auto; }
          .wordmark { order: 1; }
          .hamburger { display: flex; order: 2; margin-left: auto; }
          .links {
            display: none;
            order: 3;
            width: 100%;
            flex-direction: column;
            gap: 0;
            padding: 0.5rem 0;
          }
          .links.open { display: flex; }
          .nav-link {
            padding: 0.6rem 0;
            height: auto;
            line-height: 1;
          }
          .nav-link::after { display: none; }
          .right { order: 4; width: 100%; justify-content: flex-end; padding: 0.25rem 0 0.75rem; }
        }
      </style>

      <nav role="navigation" aria-label="Site navigation">
        <div class="inner">
          <a href="/" class="wordmark" aria-label="Techne — home">Techne</a>

          <button class="hamburger" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
            <span></span><span></span><span></span>
          </button>

          <ul class="links" id="nav-links" role="list">
            ${navLinks}
          </ul>

          <div class="right">
            ${this._themeToggleBtn()}
            ${this._cta()}
          </div>
        </div>
      </nav>
    `;
  }

  _attachListeners() {
    const hamburger = this.shadowRoot.querySelector('.hamburger');
    const links = this.shadowRoot.querySelector('.links');
    if (!hamburger || !links) return;

    hamburger.addEventListener('click', () => {
      this._menuOpen = !this._menuOpen;
      links.classList.toggle('open', this._menuOpen);
      hamburger.setAttribute('aria-expanded', String(this._menuOpen));
    });

    // Close menu on link click (mobile)
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this._menuOpen = false;
        links.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._menuOpen) {
        this._menuOpen = false;
        links.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });

    // Theme toggle
    const themeBtn = this.shadowRoot.getElementById('theme-toggle');
    if (themeBtn) {
      // Set initial icon state
      this._updateThemeBtn(themeBtn);

      themeBtn.addEventListener('click', () => {
        const current = this._currentTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('techne-theme', next); } catch (_) {}
        this._updateThemeBtn(themeBtn);
      });

      // Watch for external changes (e.g., another component toggling theme)
      if (this._themeObserver) this._themeObserver.disconnect();
      this._themeObserver = new MutationObserver(() => {
        this._updateThemeBtn(themeBtn);
      });
      this._themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }
  }
}

customElements.define('techne-nav', TechneNav);
