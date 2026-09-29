import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { Editable, EditableImg, useContent } from '../lib/content.jsx'

const sections = [
  { id: 'baptism', num: '01', tag: 'BAPTISM', title: 'Welcoming new life into the parish family', text: "Baptisms take place on Saturdays at 5pm and Sundays at 12.15pm, after the last Mass, in either church of the parish. Contact the parish office to arrange a date — a short preparation meeting is offered beforehand for parents and godparents.", image: '/images/insta-planting.jpg' },
  { id: 'communion', num: '02', tag: 'FIRST COMMUNION & CONFIRMATION', title: 'A milestone the whole parish shares in', text: "First Communion and Confirmation are prepared for through the local national schools in partnership with the parish. Dates are confirmed each year with the schools — the parish office can point you to the right class or teacher.", image: '/images/insta-communion.jpg', reverse: true },
  { id: 'confession', num: '03', tag: 'CONFESSION', title: 'Available before or after every Mass', text: "Confession is heard before or after any weekday or weekend Mass, in either church. If you'd prefer a specific time, just ask the priest directly or call the parish office.", image: '/images/ordination.jpg' },
  { id: 'marriage', num: '04', tag: 'MARRIAGE', title: "Marking the start of a new family", text: "Couples should contact the parish office at least six months before their wedding date to begin preparation, including the pre-nuptial enquiry and a marriage preparation course.", image: '/images/wedding.jpg', reverse: true },
  { id: 'anointing', num: '05', tag: 'ANOINTING & FUNERALS', title: "Walking with your family through loss", text: "Calls to the sick or housebound for the Anointing of the Sick are arranged directly with the parish office, any time. Funeral arrangements are made with the undertaker and parish office together, whatever the hour.", image: '/images/news-graves.jpg' },
  { id: 'orders', num: '06', tag: 'HOLY ORDERS', title: "Giving thanks for a life of service", text: "From ordinations to priestly jubilees, the parish gathers to give thanks for the men who have given their lives in service here and beyond.", image: '/images/ordination.jpg', reverse: true },
]

export default function Sacraments() {
  const c = useContent()
  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: 'clamp(36px, 8vw, 56px) var(--pad)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Sacraments</div>
        <Editable as="h1" id="sacraments.title" def="Sacraments & Parish Life" multiline={false} style={{ fontSize: 'clamp(30px, 8vw, 40px)', fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="sacraments.intro" def="Walking with you through every stage of faith — from baptism to burial, in Tenure and Fieldstown alike."
          style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 620, margin: 0 }} />
      </div>

      <div style={{ padding: '28px var(--pad)', display: 'flex', gap: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--line)' }}>
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{c.get(`sacraments.${s.id}.tag`, s.tag)}</a>
        ))}
      </div>

      {sections.map(s => (
        <div key={s.id} id={s.id} className="split" style={{ padding: 'clamp(40px, 9vw, 64px) var(--pad) 20px', display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)', flexDirection: s.reverse ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }}>
              {s.num} · <Editable id={`sacraments.${s.id}.tag`} def={s.tag} multiline={false} />
            </div>
            <Editable as="h3" id={`sacraments.${s.id}.title`} def={s.title} style={{ fontSize: 'clamp(24px, 6vw, 30px)', fontWeight: 800, margin: 0 }} />
            <Editable as="p" id={`sacraments.${s.id}.text`} def={s.text} style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} />
          </div>
          <EditableImg id={`sacraments.${s.id}.image`} def={s.image} wrapperStyle={{ flex: 1, minWidth: 'min(300px, 100%)' }} style={{ height: 340, objectFit: 'cover', borderRadius: 20 }} />
        </div>
      ))}

      <div style={{ height: 40 }} />
      <Footer />
    </div>
  )
}
