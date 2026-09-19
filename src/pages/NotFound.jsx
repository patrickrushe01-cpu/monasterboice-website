import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function NotFound() {
  return (
    <div>
      <Nav />
      <div style={{ padding: '120px 64px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Page not found</h1>
        <p style={{ color: 'var(--muted)' }}>That page doesn't exist — try the homepage instead.</p>
        <Link to="/" className="textlink">Back to Home →</Link>
      </div>
      <Footer />
    </div>
  )
}
