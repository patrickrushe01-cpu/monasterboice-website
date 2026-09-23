import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => navigate('/admin'), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: '#fff', padding: 40, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 40px rgba(25,23,20,0.1)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Set a New Password</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Choose a new password for your parish admin account.</p>
        <input type="password" required placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
        <input type="password" required placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {error && <div style={{ color: '#8B1E3F', fontSize: 13 }}>{error}</div>}
        {done && <div style={{ color: '#2F5233', fontSize: 13 }}>Password updated — taking you to the admin page…</div>}
        <button type="submit" className="btn" style={{ background: 'var(--ink)', textAlign: 'center' }} disabled={loading || done}>
          {loading ? 'Saving…' : 'Set Password'}
        </button>
      </form>
    </div>
  )
}
