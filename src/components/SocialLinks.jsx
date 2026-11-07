import { useContent, safeUrl } from '../lib/content.jsx'

// The parish's social pages. Staff can change any address with "Edit this page" → "Change link".
const NETWORKS = [
  { id: 'social.facebook', name: 'Facebook', def: 'https://www.facebook.com/share/19wM5asVwk/', icon: FacebookIcon },
  { id: 'social.instagram', name: 'Instagram', def: 'https://www.instagram.com/monasterboiceparish/', icon: InstagramIcon },
  { id: 'social.x', name: 'X', def: 'https://x.com/monasterboicep', icon: XIcon },
]

export default function SocialLinks({ tone = 'light', style }) {
  const c = useContent()
  const isDark = tone === 'dark' // dark = on the dark footer
  const colour = isDark ? '#fff' : 'var(--ink)'
  const border = isDark ? 'rgba(255,255,255,0.28)' : 'var(--line)'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, ...style }}>
      {NETWORKS.map(n => {
        const url = safeUrl(c.get(`${n.id}.url`, n.def))
        const Icon = n.icon
        const chip = (
          <>
            <Icon />
            <span>{n.name}</span>
          </>
        )
        const pill = {
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999,
          border: `1px solid ${border}`, color: colour, fontSize: 14, fontWeight: 700, textDecoration: 'none',
        }
        if (!c.editing) {
          if (!url) return null
          return (
            <a key={n.id} href={url} target="_blank" rel="noopener noreferrer" className="social-pill" style={pill} aria-label={`${n.name} (opens in a new tab)`}>
              {chip}
            </a>
          )
        }
        return (
          <span key={n.id} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ ...pill, cursor: 'default' }}>{chip}</span>
            <button
              type="button"
              className="edit-chip"
              onClick={() => {
                const v = window.prompt(`Web address for the parish ${n.name} page (leave empty to hide it):`, url)
                if (v === null) return
                const next = safeUrl(v)
                if (next !== url) c.setDraft(`${n.id}.url`, next)
              }}
            >
              Change {n.name} link
            </button>
          </span>
        )
      })}
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
