import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Bulletins() {
  const [bulletins, setBulletins] = useState([])

  useEffect(() => {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    supabase
      .from('bulletins')
      .select('*')
      .gte('issue_date', fourWeeksAgo.toISOString())
      .order('issue_date', { ascending: false })
      .then(({ data }) => setBulletins(data || []))
  }, [])

  const [latest, ...older] = bulletins

  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Bulletins</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>Parish Bulletins</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 620, margin: 0 }}>
          This week's bulletin, plus the last four weeks for anyone catching up. Older bulletins are archived by the parish office on request.
        </p>
      </div>

      {latest ? (
        <div style={{ padding: '48px 64px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100, background: 'var(--ink)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PdfIcon />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}>THIS WEEK</div>
                <div style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>
                  {new Date(latest.issue_date).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
        <div style={{ padding: '24px 64px 16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--faint)', fontWeight: 700, padding: '0 8px' }}>PREVIOUS WEEKS</div>
            {older.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', border: '1px solid var(--line)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <PdfIcon small />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      {new Date(b.issue_date).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <a href={b.file_url} target="_blank" rel="noreferrer" className="textlink" style={{ fontSize: 14 }}>Download →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '24px 64px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, background: 'var(--cream)', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Bulletins older than four weeks are removed from this page automatically. Looking for an older one? <a href="/contact" className="textlink">Contact the parish office</a> and we'll dig it out.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function EmptyNotice() {
  return (
    <div style={{ padding: '24px 64px', display: 'flex', justifyContent: 'center' }}>
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
