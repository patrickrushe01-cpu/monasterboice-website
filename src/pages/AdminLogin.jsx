import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: '#fff', padding: 40, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 40px rgba(25,23,20,0.1)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Parish Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Sign in to post news or upload a bulletin.</p>
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: '#8B1E3F', fontSize: 13 }}>{error}</div>}
        <button type="submit" className="btn" style={{ background: 'var(--ink)', textAlign: 'center' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
