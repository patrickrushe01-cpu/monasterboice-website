import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/news', label: 'News' },
  { to: '/bulletins', label: 'Bulletins' },
  { to: '/sacraments', label: 'Sacraments' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav({ transparent = false }) {
  const { pathname } = useLocation()
  return (
    <div style={{
      width: '100%', boxSizing: 'border-box', padding: '22px 64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: transparent ? 'none' : '1px solid var(--line)',
      position: transparent ? 'relative' : 'static',
      zIndex: 3,
    }}>
      <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: transparent ? '#fff' : 'var(--ink)' }}>
        Monasterboice Parish
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
        {links.map(l => {
          const active = pathname === l.to
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`navlink ${transparent ? 'navlink-transparent' : 'navlink-solid'} ${active ? 'navlink-active' : ''}`}
              style={{ color: active ? '#fff' : (transparent ? '#fff' : 'var(--ink)') }}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
      <Link to="/support" className="btn">Support Us</Link>
    </div>
  )
}
