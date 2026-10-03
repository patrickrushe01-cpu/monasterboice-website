import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { Editable } from '../lib/content.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Bulletins() {
  const [bulletins, setBulletins] = useState([])

  useEffect(() => {
    // This week's bulletin plus the four before it; older ones drop off as new ones are added
    supabase
      .from('bulletins')
      .select('*')
      .order('issue_date', { ascending: false })
      .limit(5)
      .then(({ data }) => setBulletins(data || []))
  }, [])

  const [latest, ...older] = bulletins

  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: 'clamp(36px, 8vw, 56px) var(--pad)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Bulletins</div>
        <Editable as="h1" id="bulletins.title" def="Parish Bulletins" multiline={false} style={{ fontSize: 'clamp(30px, 8vw, 40px)', fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="bulletins.intro" def="This week's bulletin, plus the last four weeks for anyone catching up. Older bulletins are archived by the parish office on request."
          style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 620, margin: 0 }} />
      </div>

      {latest ? (
        <div style={{ padding: '48px var(--pad) 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100, background: 'var(--ink)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PdfIcon />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}>THIS WEEK</div>
                <div style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>
                  {new Date(latest.issue_date).toLocaleDateString('en-IE', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 14, color: '#B5AC9C' }}>Both churches · PDF</div>
              </div>
            </div>
            <a href={latest.file_url} target="_blank" rel="noreferrer" className="btn">Download PDF</a>
          </div>
        </div>
      ) : (
        <EmptyNotice />
      )}

      {older.length > 0 && (
        <div style={{ padding: '24px var(--pad) 16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--faint)', fontWeight: 700, padding: '0 8px' }}>PREVIOUS WEEKS</div>
            {older.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', border: '1px solid var(--line)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <PdfIcon small />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      {new Date(b.issue_date).toLocaleDateString('en-IE', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <a href={b.file_url} target="_blank" rel="noreferrer" className="textlink" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>Download →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <SubscribeBox />

      <div style={{ padding: '24px var(--pad) clamp(48px, 10vw, 80px)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, background: 'var(--cream)', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Only this week's bulletin and the four before it are shown here. Looking for an older one? <a href="/contact" className="textlink">Contact the parish office</a> and we'll dig it out.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function EmptyNotice() {
  return (
    <div style={{ padding: '24px var(--pad)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1100, textAlign: 'center', padding: '40px', color: 'var(--faint)' }}>
        No bulletin uploaded yet for this week — check back soon, or contact the office.
      </div>
    </div>
  )
}

function PdfIcon({ small }) {
  const s = small ? 22 : 28
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={small ? 'var(--ink)' : '#fff'} strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <path d="M14 2v6h6"></path>
    </svg>
  )
}

function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('') // hidden field: real people never fill it in, bots do
  const [state, setState] = useState('idle') // idle | sending | done | error

  async function submit(e) {
    e.preventDefault()
    if (trap) { setState('done'); return }
    setState('sending')
    const { data, error } = await supabase.functions.invoke('subscribe', { body: { email } })
    if (!error && data?.error) { setState('error'); return }
    setState(error ? 'error' : 'done')
  }

  return (
    <div style={{ padding: '24px var(--pad) 8px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1100, background: 'var(--cream)', borderRadius: 18, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Editable as="h3" id="bulletins.sub.title" def="Get the bulletin by email" multiline={false} style={{ fontSize: 22, fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="bulletins.sub.text" def="Subscribe to receive the Parish Bulletin by email each week." style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }} />
        {state === 'done' ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2F5233' }}>Thank you — you're on the list.</div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="email" required placeholder="Your email address" aria-label="Your email address"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 'min(240px, 100%)', maxWidth: 420 }}
            />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={e => setTrap(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
            <button type="submit" className="btn" style={{ background: 'var(--accent)' }} disabled={state === 'sending'}>
              {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
        {state === 'error' && <div style={{ fontSize: 13, color: '#8B1E3F' }}>That didn't work — please check the address and try again.</div>}
        <Editable as="p" id="bulletins.sub.note"
          def="Your email address is used only to send you the parish bulletin. You can ask the Parish Office to remove you from the list at any time."
          style={{ fontSize: 12, color: 'var(--faint)', margin: 0, lineHeight: 1.6 }} />
      </div>
    </div>
  )
}
