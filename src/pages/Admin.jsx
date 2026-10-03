import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { resizeImage } from '../lib/content.jsx'
import { formatDate, postPath, slugify } from '../lib/news.js'
import { EMAIL_OK, csvSafe } from '../lib/csv.js'

const ArticleBody = lazy(() => import('../components/ArticleBody.jsx'))

const CATEGORIES = ['News', "What's On", "Pastor's Message", 'Fundraising']

// Short summary made from the first words of a story's text
function makeExcerpt(text) {
  const t = String(text || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*>_`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > 240 ? t.slice(0, 240).replace(/\s+\S*$/, '') + '…' : t
}

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
      <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '22px 28px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Edit the wording and photos on any page</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>While you're signed in, open any page of the site and press "Edit this page" (bottom right). Click any text to change it, then Save.</div>
        </div>
        <Link to="/" className="btn">Go to the site and edit</Link>
      </div>
      <MessagesSection />
      <div style={{ height: 48 }} />
      <NewsSection />
      <div style={{ height: 48 }} />
      <BulletinSection />
      <div style={{ height: 48 }} />
      <AccountsSection />
      <div style={{ height: 48 }} />
      <SubscribersSection />
    </div>
  )
}

function NewsSection() {
  const [params, setParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [editing, setEditing] = useState(null) // the full story being edited
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    supabase.from('news_posts').select('id,title,published_at,slug,category')
      .order('published_at', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []))
  }, [refreshKey])

  async function startEdit(id) {
    const { data } = await supabase.from('news_posts').select('*').eq('id', id).maybeSingle()
    if (data) { setEditing(data); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  // "Edit this story" links on the site open /admin?edit=<id>
  useEffect(() => {
    const id = params.get('edit')
    if (id) { startEdit(id); setParams({}, { replace: true }) }
  }, [])

  async function handleDelete(p) {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return
    await supabase.from('news_posts').delete().eq('id', p.id)
    if (editing && editing.id === p.id) setEditing(null)
    setRefreshKey(k => k + 1)
  }

  const q = filter.trim().toLowerCase()
  const matching = q ? posts.filter(p => p.title.toLowerCase().includes(q)) : posts
  const visible = showAll || q ? matching : matching.slice(0, 12)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <NewsForm post={editing} onDone={() => { setEditing(null); setRefreshKey(k => k + 1) }} onCancel={() => setEditing(null)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>PUBLISHED NEWS ({posts.length})</div>
          <input type="search" placeholder="Search stories…" value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 260 }} />
        </div>
        {visible.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: 'var(--faint)' }}>{formatDate(p.published_at)}{p.category && p.category !== 'News' ? ` · ${p.category}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => startEdit(p.id)} className="textlink" style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
              <Link to={postPath(p)} target="_blank" className="textlink" style={{ fontSize: 13 }}>View</Link>
              <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
        {!q && !showAll && matching.length > 12 && (
          <button type="button" className="btn-outline" onClick={() => setShowAll(true)}>Show all {matching.length} stories</button>
        )}
      </div>
    </div>
  )
}

function NewsForm({ post, onDone, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('News')
  const [publishedAt, setPublishedAt] = useState(today)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState('idle')

  // fill the form when a story is opened for editing; clear it when finished
  useEffect(() => {
    setTitle(post?.title || '')
    setExcerpt(post?.excerpt || '')
    setBody(post?.body || '')
    setCategory(post?.category || 'News')
    setPublishedAt(post?.published_at || today)
    setFile(null)
    setPreview(false)
    setStatus('idle')
  }, [post?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('saving')
    let image_url = post?.image_url ?? null
    if (file) {
      try {
        const blob = await resizeImage(file)
        const path = `news/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, '')) || 'photo'}.jpg`
        const { error: upErr } = await supabase.storage.from('parish-media').upload(path, blob, { contentType: 'image/jpeg' })
        if (upErr) throw upErr
        image_url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
      } catch { setStatus('error'); return }
    }
    const fields = { title, excerpt: excerpt.trim() || makeExcerpt(body), body, category, published_at: publishedAt, image_url }

    if (post) {
      const { error } = await supabase.from('news_posts').update(fields).eq('id', post.id)
      if (error) { setStatus('error'); return }
    } else {
      const base = slugify(title) || 'story'
      const attempts = [base, `${base}-${publishedAt.slice(0, 4)}`, `${base}-${Math.random().toString(36).slice(2, 6)}`]
      let saved = false
      for (const slug of attempts) {
        const { error } = await supabase.from('news_posts').insert([{ ...fields, slug }])
        if (!error) { saved = true; break }
        if (error.code !== '23505') break // only retry when the web address was already taken
      }
      if (!saved) { setStatus('error'); return }
    }
    setStatus('saved')
    if (!post) { setTitle(''); setExcerpt(''); setBody(''); setCategory('News'); setFile(null) }
    onDone()
  }

  const cats = post?.category && !CATEGORIES.includes(post.category) ? [...CATEGORIES, post.category] : CATEGORIES

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{post ? 'Edit this story' : 'Add a news story'}</h2>
        {post && <button type="button" className="btn-outline" style={{ padding: '6px 16px', fontSize: 13 }} onClick={onCancel}>Cancel editing</button>}
      </div>
      <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Story
        <textarea rows={post ? 16 : 9} placeholder="Write the story here…" value={body} onChange={e => setBody(e.target.value)} style={{ marginTop: 6 }} />
        <span style={{ display: 'block', fontSize: 12, color: 'var(--faint)', marginTop: 6, lineHeight: 1.6 }}>
          Write in plain text and leave a blank line between paragraphs. Put **two stars** around words to make them bold, and write [the words to click](https://the-web-address) for a link.
        </span>
      </label>
      <div>
        <button type="button" className="btn-outline" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => setPreview(v => !v)}>
          {preview ? 'Hide preview' : 'Preview the story'}
        </button>
      </div>
      {preview && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '22px 26px' }}>
          <Suspense fallback="Loading preview…"><ArticleBody text={body} /></Suspense>
        </div>
      )}
      <textarea rows={2} placeholder="Short summary shown on the News page (optional — made from the story if left blank)" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, color: 'var(--muted)', flex: 1, minWidth: 'min(180px, 100%)' }}>
          Date
          <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} style={{ marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 13, color: 'var(--muted)', flex: 1, minWidth: 'min(180px, 100%)' }}>
          Type of story
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginTop: 6 }}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label style={{ fontSize: 13, color: 'var(--muted)' }}>
        Main photo {post?.image_url ? '(leave empty to keep the current one)' : '(optional)'}
        {post?.image_url && <img src={post.image_url} alt="" style={{ display: 'block', height: 70, borderRadius: 8, margin: '8px 0' }} />}
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ border: 'none', padding: '8px 0' }} />
      </label>
      <button type="submit" className="btn" style={{ background: 'var(--accent)' }} disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving…' : post ? 'Save changes' : 'Publish story'}
      </button>
      {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Saved.</div>}
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
              <div style={{ fontWeight: 700, fontSize: 15 }}>{new Date(b.issue_date).toLocaleDateString('en-IE', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="textlink" style={{ fontSize: 13 }}>View</a>
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
      <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>The public site shows this week's bulletin plus the four before it. Older ones drop off automatically as you upload new ones — no need to remove them yourself.</p>
      {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Uploaded.</div>}
      {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 13 }}>Something went wrong — try again.</div>}
    </form>
  )
}

function AccountsSection() {
  const [rows, setRows] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [year, setYear] = useState(new Date().getFullYear() - 1)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    supabase.from('parish_accounts').select('*').order('year', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [refreshKey])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    setStatus('saving')
    const path = `accounts/${year}-parish-accounts-${Date.now()}.pdf`
    const { error: upErr } = await supabase.storage.from('parish-media').upload(path, file, { contentType: 'application/pdf' })
    if (upErr) { setStatus('error'); return }
    const file_url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('parish_accounts').upsert([{ year: Number(year), file_url }], { onConflict: 'year' })
    if (error) { setStatus('error'); return }
    setStatus('saved')
    setFile(null)
    setRefreshKey(k => k + 1)
  }

  async function handleDelete(id, y) {
    if (!window.confirm(`Remove the ${y} accounts from the website? This can't be undone.`)) return
    await supabase.from('parish_accounts').delete().eq('id', id)
    setRefreshKey(k => k + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--cream)', padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Parish accounts (Support Us page)</h2>
        <label style={{ fontSize: 13, color: 'var(--muted)' }}>
          Year of the accounts
          <input required type="number" min="2000" max="2100" value={year} onChange={e => setYear(e.target.value)} style={{ marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 13, color: 'var(--muted)' }}>
          Accounts PDF
          <input required type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ border: 'none', padding: '8px 0' }} />
        </label>
        <button type="submit" className="btn" style={{ background: 'var(--accent)' }} disabled={status === 'saving'}>
          {status === 'saving' ? 'Uploading…' : 'Upload accounts'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>The newest year is shown as "Latest accounts"; earlier years are listed beneath it. Uploading a year that already exists replaces it.</p>
        {status === 'saved' && <div style={{ color: '#2F5233', fontSize: 13 }}>Uploaded.</div>}
        {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 13 }}>Something went wrong — try again.</div>}
      </form>
      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>UPLOADED ACCOUNTS</div>
          {rows.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{r.year}</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="textlink" style={{ fontSize: 13 }}>View</a>
                <button onClick={() => handleDelete(r.id, r.year)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubscribersSection() {
  const [rows, setRows] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [pasted, setPasted] = useState('')
  const [msg, setMsg] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    supabase.from('bulletin_subscribers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [refreshKey])

  function downloadCsv() {
    const lines = ['Email,Subscribed'].concat(rows.map(r => `${csvSafe(r.email)},${String(r.created_at).slice(0, 10)}`))
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulletin-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(rows.map(r => r.email).join(', '))
      setMsg(`Copied ${rows.length} addresses.`)
    } catch { setMsg('Could not copy — use Download instead.') }
  }

  async function addPasted() {
    const parts = pasted.split(/[\s,;]+/).map(x => x.trim().toLowerCase()).filter(Boolean)
    const valid = parts.filter(x => EMAIL_OK.test(x) && x.length <= 254)
    const good = [...new Set(valid)]
    const bad = parts.length - valid.length
    if (!good.length) { setMsg('No valid email addresses found.'); return }
    const { error } = await supabase.from('bulletin_subscribers')
      .upsert(good.map(email => ({ email, source: 'imported' })), { onConflict: 'email', ignoreDuplicates: true })
    if (error) { setMsg('Something went wrong — try again.'); return }
    setMsg(`Added ${good.length} address${good.length === 1 ? '' : 'es'} (any already on the list were skipped)${bad ? `; ${bad} did not look like email addresses` : ''}.`)
    setPasted('')
    setRefreshKey(k => k + 1)
  }

  async function remove(r) {
    if (!window.confirm(`Remove ${r.email} from the bulletin list?`)) return
    await supabase.from('bulletin_subscribers').delete().eq('id', r.id)
    setRefreshKey(k => k + 1)
  }

  const visible = showAll ? rows : rows.slice(0, 15)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'var(--cream)', padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Bulletin email list ({rows.length} subscriber{rows.length === 1 ? '' : 's'})</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
          People who sign up on the Bulletins page appear here. Download the list to use in your email tool, or copy the addresses to paste into a message.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn" style={{ background: 'var(--accent)' }} onClick={downloadCsv} disabled={!rows.length}>Download list (CSV)</button>
          <button type="button" className="btn-outline" onClick={copyAll} disabled={!rows.length}>Copy all addresses</button>
        </div>
        <label style={{ fontSize: 13, color: 'var(--muted)' }}>
          Add existing subscribers (paste addresses, separated by commas, spaces or new lines)
          <textarea rows={3} value={pasted} onChange={e => setPasted(e.target.value)} placeholder="name@example.com, another@example.com" style={{ marginTop: 6 }} />
        </label>
        <div><button type="button" className="btn-outline" onClick={addPasted} disabled={!pasted.trim()}>Add these addresses</button></div>
        {msg && <div style={{ fontSize: 13, color: '#2F5233' }}>{msg}</div>}
      </div>
      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', border: '1px solid var(--line)', borderRadius: 10, gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflowWrap: 'anywhere' }}>{r.email} <span style={{ color: 'var(--faint)', fontWeight: 400, fontSize: 12 }}>· {String(r.created_at).slice(0, 10)}</span></div>
              <button onClick={() => remove(r)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
          {!showAll && rows.length > 15 && <button type="button" className="btn-outline" onClick={() => setShowAll(true)}>Show all {rows.length}</button>}
        </div>
      )}
    </div>
  )
}

function MessagesSection() {
  const [rows, setRows] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => setRows(data || []))
  }, [refreshKey])

  async function handleDelete(m) {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return
    await supabase.from('contact_messages').delete().eq('id', m.id)
    setRefreshKey(k => k + 1)
  }

  // The address and subject come from the public, so they are encoded: a crafted address
  // can't add extra recipients or headers to the reply.
  const replyLink = m => `mailto:${encodeURIComponent(m.email || '')}?subject=${encodeURIComponent('Re: ' + (m.subject || ''))}`
  const when = d => new Date(d).toLocaleString('en-IE', { timeZone: 'Europe/Dublin', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700 }}>
        MESSAGES FROM THE CONTACT FORM{rows ? ` (${rows.length})` : ''}
      </div>
      {rows && rows.length === 0 && (
        <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '22px 28px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          No messages yet. When someone uses the Contact form on the website, their message will appear here, newest first.
        </div>
      )}
      {(rows || []).map(m => (
        <div key={m.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800, fontSize: 16, minWidth: 0, overflowWrap: 'anywhere' }}>{m.subject}</div>
            <div style={{ fontSize: 13, color: 'var(--faint)' }}>{when(m.created_at)}</div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', overflowWrap: 'anywhere' }}>
            From <strong style={{ color: 'var(--ink)' }}>{m.name}</strong> · {m.email}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.message}</div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <a href={replyLink(m)} className="textlink" style={{ fontSize: 14, fontWeight: 700 }}>Reply by email</a>
            <button type="button" onClick={() => handleDelete(m)} style={{ background: 'none', border: 'none', color: '#8B1E3F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
