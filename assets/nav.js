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
 */

class TechneNav extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'active-section', 'user-name', 'user-class'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._menuOpen = false;
  }

  connectedCallback() {
    this._render();
    this._attachListeners();
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
      { key: 'introduction', label: 'Introduction', href: '/introduction/' },
      { key: 'formation',    label: 'Formation',    href: '/formation/' },
      { key: 'about',        label: 'About',         href: '/about/' },
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

  _esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
          --nav-bg: ${isIntranet ? '#0f0f12' : '#f7f5f0'};
          --nav-border: ${isIntranet ? '#2a2a30' : '#d8d3c8'};
          --nav-text: ${isIntranet ? '#9a958a' : '#2a2a30'};
          --nav-text-hover: ${isIntranet ? '#f7f5f0' : '#0f0f12'};
          --nav-active: #c2512a;
          --nav-wordmark: ${isIntranet ? '#f7f5f0' : '#1a1a1f'};
          --nav-height: 52px;
          font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
        }

        nav {
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          height: var(--nav-height);
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
          transition: opacity 200ms;
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

        .btn-signin {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-active);
          text-decoration: none;
          padding: 0.3rem 0.75rem;
          border: 1px solid rgba(194, 81, 42, 0.4);
          border-radius: 3px;
          transition: background 200ms, color 200ms;
        }
        .btn-signin:hover {
          background: rgba(194, 81, 42, 0.1);
        }
        .btn-signin.locked {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #5a5550;
          border-color: #3a3530;
        }
        .btn-signin.locked:hover {
          color: var(--nav-active);
          border-color: rgba(194,81,42,0.4);
          background: rgba(194,81,42,0.06);
        }

        .btn-signout {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5a5550;
          text-decoration: none;
          padding: 0.3rem 0.75rem;
          border: 1px solid #2a2a30;
          border-radius: 3px;
          transition: color 200ms, border-color 200ms;
        }
        .btn-signout:hover { color: #9a958a; border-color: #3a3530; }

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
  }
}

customElements.define('techne-nav', TechneNav);
