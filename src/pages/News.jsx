import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { Editable } from '../lib/content.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { formatDate, postPath } from '../lib/news.js'

const PAGE = 12

export default function News() {
  const [posts, setPosts] = useState(null)
  const [shown, setShown] = useState(PAGE)
  const [query, setQuery] = useState('')

  useEffect(() => {
    // the story text itself is only loaded on each story's own page
    supabase
      .from('news_posts')
      .select('id,title,excerpt,image_url,published_at,slug,category')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []))
  }, [])

  const filtered = useMemo(() => {
    const list = posts || []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(p => `${p.title} ${p.excerpt || ''} ${p.category || ''}`.toLowerCase().includes(q))
  }, [posts, query])

  const visible = filtered.slice(0, shown)

  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / News</div>
        <Editable as="h1" id="news.title" def="Parish News" multiline={false} style={{ fontSize: 40, fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="news.intro" def="Updates, events, and notices from Tenure and Fieldstown." style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 560, margin: 0 }} />
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setShown(PAGE) }}
          placeholder="Search the news…"
          aria-label="Search the news"
          style={{ marginTop: 14, maxWidth: 360 }}
        />
      </div>

      <div style={{ padding: '32px 64px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        {posts === null && <div style={{ color: 'var(--faint)' }}>Loading…</div>}
        {posts && filtered.length === 0 && (
          <div style={{ color: 'var(--faint)', padding: '40px 0' }}>
            {query ? 'No stories match your search.' : 'No news has been posted yet — please check back soon.'}
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
          {visible.map(post => (
            <Link key={post.id} to={postPath(post)} className="photocard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {post.image_url ? (
                <img src={post.image_url} alt="" loading="lazy" style={{ height: 190, width: '100%', objectFit: 'cover', borderRadius: 16 }} />
              ) : (
                <div style={{ height: 190, width: '100%', borderRadius: 16, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 13, letterSpacing: '0.1em', fontWeight: 700 }}>
                  {(post.category || 'PARISH NEWS').toUpperCase()}
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--faint)' }}>
                {formatDate(post.published_at)}
                {post.category && post.category !== 'News' && <span style={{ color: 'var(--accent)', fontWeight: 700 }}> · {post.category}</span>}
              </div>
              <div className="photocard-title" style={{ fontSize: 18, fontWeight: 700 }}>{post.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{post.excerpt}</div>
            </Link>
          ))}
        </div>

        {filtered.length > shown && (
          <button type="button" className="btn" onClick={() => setShown(s => s + PAGE)}>
            Show more stories ({filtered.length - shown} more)
          </button>
        )}
      </div>
      <Footer />
    </div>
  )
}
