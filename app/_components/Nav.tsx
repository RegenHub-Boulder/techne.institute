'use client'

import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          TECHNE
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/programs">Programs</Link>
          </li>
          <li>
            <Link href="/writing">Writing</Link>
          </li>
          <li>
            <Link href="/cohort">Cohort</Link>
          </li>
        </ul>
        <Link href="/signin" className="nav-signin">
          Sign In
        </Link>
      </div>
    </nav>
  )
}
