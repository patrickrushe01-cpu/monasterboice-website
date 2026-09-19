import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'

const placeholder = [
  { id: 'p1', image_url: '/images/news-graves.jpg', title: 'Blessing of Graves 2026', published_at: '2026-07-19', excerpt: "Please note the biggest change this year: there will not be a Mass celebrated in any of our cemeteries…" },
  { id: 'p2', image_url: '/images/news-jubilee.jpg', title: 'Jubilee Celebration of Priestly Anniversaries', published_at: '2026-05-31', excerpt: 'Join us for a Mass of Thanksgiving, celebrating three priestly jubilees within the parish family…' },
  { id: 'p3', image_url: '/images/news-easter.jpg', title: 'Easter Message 2026', published_at: '2026-04-04', excerpt: 'Easter seems to speak to something already alive in the human heart, whether or not one crosses…' },
]

export default function News() {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .then(({ data }) => setPosts(data && data.length ? data : placeholder))
  }, [])

  const list = posts || placeholder

  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / News</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>Parish News</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 560, margin: 0 }}>Updates, events, and notices from Tenure and Fieldstown.</p>
      </div>

      <div style={{ padding: '32px 64px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 32 }}>
          {list.map(post => (
            <Link key={post.id} to={`/news`} className="photocard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <img src={post.image_url} alt="" style={{ height: 190, width: '100%', objectFit: 'cover', borderRadius: 16 }} />
              <div style={{ fontSize: 13, color: 'var(--faint)' }}>
                {new Date(post.published_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="photocard-title" style={{ fontSize: 18, fontWeight: 700 }}>{post.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{post.excerpt}</div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
