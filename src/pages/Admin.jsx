import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function Admin() {
  const [session, setSession] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === null) navigate('/admin/login')
  }, [session])

  if (session === undefined) return <div style={{ padding: 64 }}>Loading…</div>
  if (!session) return null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Parish Admin</h1>
        <button className="btn-outline" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
      <NewsSection />
      <div style={{ height: 48 }} />
      <BulletinSection />
    </div>
  )
}

function NewsSection() {
  const [posts, setPosts] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    supabase.from('news_posts').select('*').order('published_at', { ascending: false })
      .then(({ data }) => setPosts(data || []))
  }, [refreshKey])

  async function handleDelete(id) {
    if (!window.confirm('Delete this news post? This can\'t be undone.')) return
    await supabase.from('news_posts').delete().eq('id', id)
    setRefreshKey(k => k + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <NewsForm onPublished={() => setRefreshKey(k => k + 1)} />
      {posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>PUBLISHED NEWS</div>
          {posts.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--faint)' }}>{new Date(p.published_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NewsForm({ onPublished }) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('saving')
    let image_url = null
    if (file) {
      const path = `news/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('parish-media').upload(path, file)
      if (upErr) { setStatus('error'); return }
      image_url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
    }
    const { error } = await supabase.from('news_posts').insert([{ title, excerpt, published_at: publishedAt, image_url }])
    if (error) { setStatus('error'); return }
    setStatus('saved')
    setTitle(''); setExcerpt(''); setFile(null)
    onPublished()
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Add a news post</h2>
      <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea required rows={3} placeholder="Short summary" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Date
        <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} style={{ marginTop: 6 }} />
      </label>
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Photo (optional)
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ border: 'none', padding: '8px 0' }} />
      </label>
      <button type="submit" className="btn" style={{ background: 'var(--accent)' }} disabled={status === 'saving'}>
        {status === 'saving' ? 'Publishing…' : 'Publish News Post'}
      </button>
      {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Published.</div>}
      {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 13 }}>Something went wrong — try again.</div>}
    </form>
  )
}

function BulletinSection() {
  const [bulletins, setBulletins] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    supabase.from('bulletins').select('*').order('issue_date', { ascending: false })
      .then(({ data }) => setBulletins(data || []))
  }, [refreshKey])

  async function handleDelete(id) {
    if (!window.confirm('Delete this bulletin? This can\'t be undone.')) return
    await supabase.from('bulletins').delete().eq('id', id)
    setRefreshKey(k => k + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BulletinForm onUploaded={() => setRefreshKey(k => k + 1)} />
      {bulletins.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>UPLOADED BULLETINS</div>
          {bulletins.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{new Date(b.issue_date).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <a href={b.file_url} target="_blank" rel="noreferrer" className="textlink" style={{ fontSize: 13 }}>View</a>
                <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BulletinForm({ onUploaded }) {
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    setStatus('saving')
    const path = `bulletins/${issueDate}-${file.name}`
    const { error: upErr } = await supabase.storage.from('parish-media').upload(path, file, { upsert: true })
    if (upErr) { setStatus('error'); return }
    const file_url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('bulletins').insert([{ issue_date: issueDate, file_url }])
    if (error) { setStatus('error'); return }
    setStatus('saved')
    setFile(null)
    onUploaded()
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Upload this week's bulletin</h2>
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Sunday date
        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={{ marginTop: 6 }} />
      </label>
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Bulletin PDF
        <input required type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ border: 'none', padding: '8px 0' }} />
      </label>
      <button type="submit" className="btn" style={{ background: 'var(--accent)' }} disabled={status === 'saving'}>
        {status === 'saving' ? 'Uploading…' : 'Upload Bulletin'}
      </button>
      <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>Bulletins older than 4 weeks stop appearing on the public site automatically — no need to remove them yourself.</p>
      {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Uploaded.</div>}
      {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 13 }}>Something went wrong — try again.</div>}
    </form>
  )
}
