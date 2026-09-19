import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

const sections = [
  { id: 'baptism', num: '01', tag: 'BAPTISM', title: 'Welcoming new life into the parish family', text: "Baptisms take place on Saturdays at 5pm and Sundays at 12.15pm, after the last Mass, in either church of the parish. Contact the parish office to arrange a date — a short preparation meeting is offered beforehand for parents and godparents.", image: '/images/insta-planting.jpg' },
  { id: 'communion', num: '02', tag: 'FIRST COMMUNION & CONFIRMATION', title: 'A milestone the whole parish shares in', text: "First Communion and Confirmation are prepared for through the local national schools in partnership with the parish. Dates are confirmed each year with the schools — the parish office can point you to the right class or teacher.", image: '/images/insta-communion.jpg', reverse: true },
  { id: 'confession', num: '03', tag: 'CONFESSION', title: 'Available before or after every Mass', text: "Confession is heard before or after any weekday or weekend Mass, in either church. If you'd prefer a specific time, just ask the priest directly or call the parish office.", image: '/images/ordination.jpg' },
  { id: 'marriage', num: '04', tag: 'MARRIAGE', title: "Marking the start of a new family", text: "Couples should contact the parish office at least six months before their wedding date to begin preparation, including the pre-nuptial enquiry and a marriage preparation course.", image: '/images/wedding.jpg', reverse: true },
  { id: 'anointing', num: '05', tag: 'ANOINTING & FUNERALS', title: "Walking with your family through loss", text: "Calls to the sick or housebound for the Anointing of the Sick are arranged directly with the parish office, any time. Funeral arrangements are made with the undertaker and parish office together, whatever the hour.", image: '/images/news-graves.jpg' },
  { id: 'orders', num: '06', tag: 'HOLY ORDERS', title: "Giving thanks for a life of service", text: "From ordinations to priestly jubilees, the parish gathers to give thanks for the men who have given their lives in service here and beyond.", image: '/images/ordination.jpg', reverse: true },
]

export default function Sacraments() {
  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Sacraments</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>Sacraments &amp; Parish Life</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 620, margin: 0 }}>Walking with you through every stage of faith — from baptism to burial, in Tenure and Fieldstown alike.</p>
      </div>

      <div style={{ padding: '28px 64px', display: 'flex', gap: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--line)' }}>
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{s.tag.split(' & ').join(' & ')}</a>
        ))}
      </div>

      {sections.map(s => (
        <div key={s.id} id={s.id} style={{ padding: '64px 64px 20px', display: 'flex', alignItems: 'center', gap: 64, flexDirection: s.reverse ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }}>{s.num} · {s.tag}</div>
            <h3 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>{s.title}</h3>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.text}</p>
          </div>
          <img src={s.image} alt="" style={{ flex: 1, minWidth: 300, height: 340, objectFit: 'cover', borderRadius: 20 }} />
        </div>
      ))}

      <div style={{ height: 40 }} />
      <Footer />
    </div>
  )
}
