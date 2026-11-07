import { postPath } from '../lib/news.js'

// Always share the real website address, even when the page is opened from a test address
const SITE = 'https://www.monasterboiceparish.com'

export default function ShareStory({ post }) {
  if (!post || !post.slug) return null
  const url = SITE + postPath(post)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(post.title || 'Monasterboice Parish')
  const links = [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'X', href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}` },
    { name: 'Email', href: `mailto:?subject=${t}&body=${u}` },
  ]
  return (
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>SHARE THIS STORY</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {links.map(l => (
          <a
            key={l.name}
            href={l.href}
            target={l.name === 'Email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ padding: '8px 18px', fontSize: 14 }}
          >
            {l.name}
          </a>
        ))}
      </div>
    </div>
  )
}
