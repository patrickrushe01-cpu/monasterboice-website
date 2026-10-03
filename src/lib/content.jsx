import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

/*
  In-page editing.

  - Every editable piece of text/photo has an id (e.g. "home.hero.title") and a default
    (the text written in the code). If a saved value exists in the `site_content` table, it wins.
  - Signed-in staff see an "Edit this page" button. In edit mode, text becomes clickable/typeable
    and photos get a "Change photo" button. Changes are held as drafts until Save is pressed.
*/

const CACHE_KEY = 'parish_site_content_v1'
const Ctx = createContext(null)
export const useContent = () => useContext(Ctx)

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {} } catch { return {} }
}

// Only allow normal web/mail/phone/site links (blocks javascript: etc.); adds https:// if missing
export function safeUrl(v) {
  const t = String(v ?? '').trim()
  if (!t) return ''
  if (/^(javascript|data|vbscript):/i.test(t)) return ''
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(t)) return t
  return 'https://' + t
}

// Shrink big phone photos before upload so pages stay fast (max 2000px wide, JPEG)
export async function resizeImage(file, maxW = 2000) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Could not read that image'))
      i.src = url
    })
    const scale = Math.min(1, maxW / img.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.86))
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function ContentProvider({ children }) {
  const [saved, setSaved] = useState(readCache)
  const [drafts, setDrafts] = useState({})
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('site_content').select('key,value').then(({ data }) => {
      if (!data) return
      const map = Object.fromEntries(data.map(r => [r.key, r.value]))
      setSaved(map)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)) } catch { /* ignore */ }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) { setEditing(false); setDrafts({}) }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(t)
  }, [message])

  const dirty = Object.keys(drafts).length
  useEffect(() => {
    if (!dirty) return
    const warn = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const get = useCallback(
    (id, def) => (id in drafts ? drafts[id] : id in saved ? saved[id] : def),
    [drafts, saved],
  )
  const setDraft = useCallback((id, value) => setDrafts(d => ({ ...d, [id]: value })), [])

  const save = useCallback(async () => {
    const rows = Object.entries(drafts).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))
    if (!rows.length) return
    setSaving(true)
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (error) { setMessage('Could not save: ' + error.message); return }
    const merged = { ...saved, ...drafts }
    setSaved(merged)
    setDrafts({})
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)) } catch { /* ignore */ }
    setMessage('Saved — your changes are live.')
  }, [drafts, saved])

  const discard = useCallback(() => setDrafts({}), [])

  const uploadImage = useCallback(async (id, file, onUrl) => {
    setMessage('Uploading photo…')
    try {
      const blob = await resizeImage(file)
      const path = `site/${id.replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('parish-media').upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      const url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
      if (onUrl) onUrl(url); else setDraft(id, url)
      setMessage('Photo added — press Save to publish it.')
    } catch (e) {
      setMessage('Photo upload failed: ' + (e.message || e))
    }
  }, [setDraft])

  const uploadFile = useCallback(async (id, file) => {
    setMessage('Uploading file…')
    try {
      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '')
      const path = `site/files/${id.replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('parish-media').upload(path, file, { contentType: file.type || 'application/pdf' })
      if (error) throw error
      const url = supabase.storage.from('parish-media').getPublicUrl(path).data.publicUrl
      setDraft(`${id}.url`, url)
      setMessage('File added — press Save to publish it.')
    } catch (e) {
      setMessage('File upload failed: ' + (e.message || e))
    }
  }, [setDraft])

  const value = useMemo(() => ({
    get, setDraft, save, discard, uploadImage, uploadFile,
    editing, setEditing, canEdit: !!session, saving, dirty, message, setMessage,
  }), [get, setDraft, save, discard, uploadImage, uploadFile, editing, session, saving, dirty, message])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/* Low-level: text that becomes typeable in edit mode. `onCommit` gets the new text. */
export function EditText({ as: Tag = 'span', value, onCommit, style, className, multiline = true }) {
  const c = useContent()
  const base = { whiteSpace: 'pre-line', ...style }
  if (!c.editing) return <Tag className={className} style={base}>{value}</Tag>
  return (
    <Tag
      className={`${className || ''} editable`.trim()}
      style={base}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onKeyDown={e => {
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.currentTarget.blur() }
      }}
      onBlur={e => {
        const t = e.currentTarget.innerText.replace(/\u00a0/g, ' ').replace(/\n+$/, '')
        if (t !== value) onCommit(t)
      }}
    >
      {value}
    </Tag>
  )
}

/* Text stored under an id */
export function Editable({ id, def, as, style, className, multiline }) {
  const c = useContent()
  return (
    <EditText
      as={as}
      value={c.get(id, def)}
      onCommit={t => c.setDraft(id, t)}
      style={style}
      className={className}
      multiline={multiline}
    />
  )
}

/* "Change photo" button (only visible in edit mode). Position it inside a position:relative box. */
export function ChangePhoto({ id, onUrl, style, label = 'Change photo' }) {
  const c = useContent()
  const input = useRef(null)
  if (!c.editing) return null
  return (
    <>
      <button
        type="button"
        className="edit-photo-btn"
        style={style}
        onClick={e => { e.preventDefault(); e.stopPropagation(); input.current?.click() }}
      >
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          const f = e.target.files[0]
          if (f) c.uploadImage(id, f, onUrl)
          e.target.value = ''
        }}
      />
    </>
  )
}

/* A normal <img> whose photo can be swapped in edit mode */
export function EditableImg({ id, def, alt = '', style, wrapperStyle }) {
  const c = useContent()
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}>
      <img src={c.get(id, def)} alt={alt} style={{ display: 'block', width: '100%', ...style }} />
      <ChangePhoto id={id} style={{ position: 'absolute', right: 14, bottom: 14 }} />
    </div>
  )
}

/* A button/link whose web address can be changed (or a PDF uploaded) while editing.
   Hidden from visitors if no address is set. */
export function LinkButton({ id, def = '', className = 'btn', style, children }) {
  const c = useContent()
  const url = safeUrl(c.get(`${id}.url`, def))
  const fileInput = useRef(null)
  if (!c.editing) {
    if (!url) return null
    return <a href={url} target="_blank" rel="noopener noreferrer" className={className} style={style}>{children}</a>
  }
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
      <span className={className} style={{ ...style, cursor: 'default' }}>{children}</span>
      <span className="edit-link-tools">
        <button
          type="button"
          className="edit-chip"
          onClick={() => {
            const v = window.prompt('Web address this button should open (for example https://…):', url)
            if (v === null) return
            const next = safeUrl(v)
            if (next !== url) c.setDraft(`${id}.url`, next)
          }}
        >
          Change link
        </button>
        <button type="button" className="edit-chip" onClick={() => fileInput.current?.click()}>Upload a PDF instead</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf"
          hidden
          onChange={e => {
            const f = e.target.files[0]
            if (f) c.uploadFile(id, f)
            e.target.value = ''
          }}
        />
        <span className="edit-chip-note">
          {url ? `Opens: ${url.length > 60 ? url.slice(0, 57) + '…' : url}` : 'No link set yet — visitors won’t see this button until you add one.'}
        </span>
      </span>
    </span>
  )
}

/* A list kept as plain lines of text (one item per line). Visitors get `render(lines)`;
   editors get a simple typeable box. */
export function EditableLines({ id, def, render, hint = 'One per line. For people, write “Name — Role”. Press Enter for a new line.' }) {
  const c = useContent()
  const value = c.get(id, def)
  if (!c.editing) return render(value.split('\n').map(l => l.trim()).filter(Boolean))
  return (
    <div>
      <EditText as="div" value={value} onCommit={t => c.setDraft(id, t)} style={{ lineHeight: 1.9, fontSize: 15 }} />
      <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 8 }}>{hint}</div>
    </div>
  )
}

/* Links stop being links while editing, so you can click into the words */
export function SmartLink({ to, children, ...rest }) {
  const c = useContent()
  if (c?.editing) return <span className={rest.className} style={rest.style}>{children}</span>
  return <Link to={to} {...rest}>{children}</Link>
}

/* Floating bar shown to signed-in staff */
export function EditBar() {
  const c = useContent()
  const { pathname } = useLocation()
  if (!c.canEdit || pathname.startsWith('/admin')) return null

  const finish = () => {
    if (c.dirty && !window.confirm('You have unsaved changes. Leave editing and throw them away?')) return
    c.discard()
    c.setEditing(false)
  }

  if (!c.editing) {
    return (
      <div className="edit-bar edit-bar-idle">
        <button type="button" className="edit-bar-primary" onClick={() => c.setEditing(true)}>Edit this page</button>
        <Link to="/admin" className="edit-bar-link">Admin</Link>
        {c.message && <span className="edit-bar-msg">{c.message}</span>}
      </div>
    )
  }

  return (
    <div className="edit-bar edit-bar-active">
      <span className="edit-bar-hint">
        Editing — click any text to change it. Use “Change photo” on photos.
      </span>
      <button type="button" className="edit-bar-primary" onClick={c.save} disabled={!c.dirty || c.saving}>
        {c.saving ? 'Saving…' : c.dirty ? `Save ${c.dirty} change${c.dirty === 1 ? '' : 's'}` : 'Nothing to save'}
      </button>
      {c.dirty > 0 && <button type="button" className="edit-bar-secondary" onClick={c.discard}>Discard</button>}
      <button type="button" className="edit-bar-secondary" onClick={finish}>Done</button>
      {c.message && <span className="edit-bar-msg">{c.message}</span>}
    </div>
  )
}
