import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/news', label: 'News' },
  { to: '/bulletins', label: 'Bulletins' },
  { to: '/sacraments', label: 'Sacraments' },
  { to: '/webcam', label: 'Webcam' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav({ transparent = false }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ink = transparent ? '#fff' : 'var(--ink)'

  // close the phone menu when you go to another page, or press Escape
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`site-nav${transparent ? ' site-nav-transparent' : ''}`}>
      <Link to="/" className="site-logo" style={{ color: ink }}>Monasterboice Parish</Link>

      <nav className="site-nav-links" aria-label="Main">
        {links.map(l => {
          const active = pathname === l.to
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`navlink ${transparent ? 'navlink-transparent' : 'navlink-solid'} ${active ? 'navlink-active' : ''}`}
              style={{ color: active ? '#fff' : ink }}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>

      <Link to="/support" className="btn site-nav-cta">Support Us</Link>

      <button
        type="button"
        className="site-burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(o => !o)}
        style={{ color: ink }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M5 5l16 16M21 5L5 21" /> : <path d="M4 7h18M4 13h18M4 19h18" />}
        </svg>
        <span className="site-burger-label">{open ? 'Close' : 'Menu'}</span>
      </button>

      {open && (
        <div id="mobile-menu" className="site-mobile-menu">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`site-mobile-link${pathname === l.to ? ' active' : ''}`}>{l.label}</Link>
          ))}
          <Link to="/support" className="btn site-mobile-cta">Support Us</Link>
        </div>
      )}
    </div>
  )
}
