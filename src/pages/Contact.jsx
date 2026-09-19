import { useState } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert([form])
    setStatus(error ? 'error' : 'sent')
    if (!error) setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Contact</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>Get in Touch</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 560, margin: 0 }}>Whether it's a sacrament, a bulletin notice, or just a question — we're here.</p>
      </div>

      <div style={{ padding: '56px 64px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 }}>
          <InfoCard label="Phone" value="087 379 1443" />
          <InfoCard label="Email" value="monasterboiceparishoffice@gmail.com" />
          <InfoCard label="Office Hours" value="Monday–Thursday, 9am–1pm" />
        </div>
      </div>

      <div style={{ padding: '40px 64px 64px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'start', flexWrap: 'wrap' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 280 }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Send a message</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input required placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <input required placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <textarea required placeholder="How can we help?" rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <button type="submit" className="btn" style={{ background: 'var(--ink)', textAlign: 'center' }} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'sent' && <div style={{ color: '#2F5233', fontSize: 14 }}>Thank you — we'll be in touch soon.</div>}
            {status === 'error' && <div style={{ color: '#8B1E3F', fontSize: 14 }}>Something went wrong — please try again or call the office directly.</div>}
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 260 }}>
            <ChurchBlock label="CHURCH ONE" name="Church of the Immaculate Conception" address="Tenure, Dunleer, Co. Louth, A92 D344" />
            <div style={{ height: 1, background: 'var(--line)' }} />
            <ChurchBlock label="CHURCH TWO" name="Church of the Nativity of Our Lady" address="Fieldstown, Co. Louth" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 15, color: 'var(--muted)' }}>{value}</div>
    </div>
  )
}

function ChurchBlock({ label, name, address }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: 15, color: 'var(--muted)' }}>{address}</div>
    </div>
  )
}
