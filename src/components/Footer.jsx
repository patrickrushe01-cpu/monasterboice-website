import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div style={{ width: '100%', background: 'var(--ink)', boxSizing: 'border-box', padding: '56px 64px 30px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 18, color: '#fff', fontWeight: 800, margin: 0 }}>Monasterboice Parish</h3>
          <div style={{ fontSize: 14, color: '#B5AC9C', lineHeight: 1.7 }}>
            The Parochial House<br />Tenure, Dunleer, Co. Louth<br />A92 D344
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, margin: 0 }}>Parish Office</h3>
          <div style={{ fontSize: 14, color: '#B5AC9C', lineHeight: 1.7 }}>
            Mon–Thu, 9am–1pm<br />087 379 1443<br />monasterboiceparishoffice@gmail.com
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, margin: 0 }}>Quick links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#B5AC9C' }}>
            <Link to="/bulletins" className="navlink">Parish Bulletins</Link>
            <Link to="/news" className="navlink">Latest News</Link>
            <Link to="/contact" className="navlink">Support the Parish</Link>
            <Link to="/contact" className="navlink">Contact Us</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A7367', flexWrap: 'wrap', gap: 8 }}>
        <div>© {new Date().getFullYear()} Monasterboice Parish, Archdiocese of Armagh</div>
        <div>Church of the Immaculate Conception, Tenure · Church of the Nativity of Our Lady, Fieldstown</div>
      </div>
    </div>
  )
}
