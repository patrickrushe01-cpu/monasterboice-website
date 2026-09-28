import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { Editable, EditableImg, LinkButton } from '../lib/content.jsx'

// The parish webcam is provided by Church Services TV
const WEBCAM_URL = 'https://www.churchservices.tv/monasterboice'

const card = { flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 14 }

export default function Webcam() {
  return (
    <div>
      <Nav />

      <div style={{ background: 'var(--cream)', padding: '56px 64px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Webcam</div>
        <Editable as="h1" id="webcam.title" def="Watch Mass Live" multiline={false} style={{ fontSize: 40, fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="webcam.intro"
          def="Masses and other liturgies at our churches are broadcast live on the parish webcam, so that anyone who cannot be with us — at home, in hospital, or far away — can still join in prayer."
          style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0, maxWidth: 680 }} />
        <div style={{ marginTop: 6 }}>
          <LinkButton id="webcam.watch" def={WEBCAM_URL} className="btn">
            <Editable id="webcam.watch.label" def="Watch live on Church Services TV" multiline={false} />
          </LinkButton>
        </div>
      </div>

      <div style={{ padding: '64px 64px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div style={card}>
            <EditableImg id="webcam.tenure.image" def="/images/tenure-church.jpg" style={{ height: 300, objectFit: 'cover', borderRadius: 18 }} />
            <Editable as="h3" id="webcam.tenure.name" def="The Church of The Immaculate Conception, Tenure (TEN)" multiline={false} style={{ fontSize: 22, fontWeight: 800, margin: 0 }} />
            <Editable as="p" id="webcam.tenure.text"
              def="Our Tenure church has a high-quality webcam installed. Watch live services, or look back at recent recordings, on the Church Services TV page."
              style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} />
          </div>
          <div style={card}>
            <EditableImg id="webcam.fieldstown.image" def="/images/fieldstown-church.jpg" style={{ height: 300, objectFit: 'cover', borderRadius: 18 }} />
            <Editable as="h3" id="webcam.fieldstown.name" def="The Church of The Nativity of Our Lady, Fieldstown (F/T)" multiline={false} style={{ fontSize: 22, fontWeight: 800, margin: 0 }} />
            <Editable as="p" id="webcam.fieldstown.text"
              def="Fieldstown has its own tab on the same page. It works whenever something is being broadcast from Fieldstown. You can check the week’s schedule there."
              style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 64px 72px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          <Editable as="p" id="webcam.note"
            def="The webcam service is provided by Church Services TV. If you have any difficulty watching, please contact the Parish Office."
            style={{ fontSize: 14, color: 'var(--faint)', lineHeight: 1.7, margin: 0 }} />
        </div>
      </div>

      <Footer />
    </div>
  )
}
