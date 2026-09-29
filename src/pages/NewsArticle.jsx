import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import ArticleBody from '../components/ArticleBody.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useContent } from '../lib/content.jsx'
import { formatDate } from '../lib/news.js'

export default function NewsArticle() {
  const { slug } = useParams()
  const c = useContent()
  const [post, setPost] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    setPost(undefined)
    supabase.from('news_posts').select('*').eq('slug', slug).maybeSingle()
      .then(({ data }) => setPost(data || null))
  }, [slug])

  useEffect(() => {
    if (!post) return
    const previous = document.title
    document.title = `${post.title} – Monasterboice Parish`
    return () => { document.title = previous }
  }, [post])

  // Show the top photo only if the story text doesn't already include it
  const showHero = post && post.image_url && !(post.body || '').includes(post.image_url)

  return (
    <div>
      <Nav />

      {post === undefined && <div style={{ padding: 'clamp(48px, 10vw, 80px) var(--pad)', color: 'var(--faint)' }}>Loading…</div>}

      {post === null && (
        <div style={{ padding: 'clamp(48px, 10vw, 80px) var(--pad)', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>We couldn't find that story</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>It may have moved or been removed.</p>
          <Link to="/news" className="btn">See all parish news</Link>
        </div>
      )}

      {post && (
        <>
          <div style={{ background: 'var(--cream)', padding: '48px var(--pad) 40px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--faint)' }}>
                <Link to="/">Home</Link> / <Link to="/news">News</Link>
              </div>
              {post.category && post.category !== 'News' && (
                <div style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700 }}>{post.category.toUpperCase()}</div>
              )}
              <h1 style={{ fontSize: 'clamp(27px, 7vw, 38px)', fontWeight: 800, lineHeight: 1.15, margin: 0 }}>{post.title}</h1>
              <div style={{ fontSize: 15, color: 'var(--faint)' }}>{formatDate(post.published_at)}</div>
              {c.canEdit && (
                <div><Link to={`/admin?edit=${post.id}`} className="btn-outline" style={{ padding: '6px 16px', fontSize: 13 }}>Edit this story</Link></div>
              )}
            </div>
          </div>

          <div style={{ padding: '40px var(--pad) clamp(48px, 10vw, 80px)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 760 }}>
              {showHero && <img src={post.image_url} alt="" style={{ width: '100%', borderRadius: 18, marginBottom: 32, display: 'block' }} />}
              {post.body ? <ArticleBody text={post.body} /> : <p style={{ fontSize: 17, lineHeight: 1.75 }}>{post.excerpt}</p>}
              <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                <Link to="/news" className="textlink" style={{ fontSize: 15 }}>← All parish news</Link>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
