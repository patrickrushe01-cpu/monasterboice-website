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
      <NewsForm />
      <div style={{ height: 48 }} />
      <BulletinForm />
    </div>
  )
}

function NewsForm() {
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

function BulletinForm() {
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
      <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>Bulletins older than 4 weeks stop appearing on the site automatically — no need to remove them yourself.</p>
      {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Uploaded.</div>}
      {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 13 }}>Something went wrong — try again.</div>}
    </form>
  )
}
