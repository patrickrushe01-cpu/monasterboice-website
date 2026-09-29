import { Editable, SmartLink } from '../lib/content.jsx'

export default function Footer() {
  return (
    <div style={{ width: '100%', background: 'var(--ink)', boxSizing: 'border-box', padding: 'clamp(36px, 8vw, 56px) var(--pad) 30px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Editable as="h3" id="footer.name" def="Monasterboice Parish" multiline={false} style={{ fontSize: 18, color: '#fff', fontWeight: 800, margin: 0 }} />
          <Editable as="div" id="footer.address" def={'The Parochial House\nTenure, Dunleer, Co. Louth\nA92 D344'} style={{ fontSize: 14, color: '#B5AC9C', lineHeight: 1.7 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="h3" id="footer.office.title" def="Parish Office" multiline={false} style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, margin: 0 }} />
            <Editable as="div" id="footer.office.text" def={'Mon–Thu, 9am–1pm\n087 379 1443\nmonasterboiceparishoffice@gmail.com'} style={{ fontSize: 14, color: '#B5AC9C', lineHeight: 1.7 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="h3" id="footer.priest.title" def="Fr. Paddy Rushe" multiline={false} style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, margin: 0 }} />
            <Editable as="div" id="footer.priest.text" def={'(086) 880 7470 (Via WhatsApp)\nmonasterboiceparishoffice@gmail.com'} style={{ fontSize: 14, color: '#B5AC9C', lineHeight: 1.7 }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Editable as="h3" id="footer.links.title" def="Quick links" multiline={false} style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, margin: 0 }} />
          <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: 0, fontSize: 14, color: '#B5AC9C' }}>
            <SmartLink to="/bulletins" className="navlink"><Editable id="footer.l1" def="Parish Bulletins" multiline={false} /></SmartLink>
            <SmartLink to="/news" className="navlink"><Editable id="footer.l2" def="Latest News" multiline={false} /></SmartLink>
            <SmartLink to="/webcam" className="navlink"><Editable id="footer.l5" def="Watch Mass Live" multiline={false} /></SmartLink>
            <SmartLink to="/resources" className="navlink"><Editable id="footer.l6" def="Resources" multiline={false} /></SmartLink>
            <SmartLink to="/support" className="navlink"><Editable id="footer.l3" def="Support the Parish" multiline={false} /></SmartLink>
            <SmartLink to="/contact" className="navlink"><Editable id="footer.l4" def="Contact Us" multiline={false} /></SmartLink>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A7367', flexWrap: 'wrap', gap: 8 }}>
        <div>© {new Date().getFullYear()} Monasterboice Parish, Archdiocese of Armagh</div>
        <Editable as="div" id="footer.churches" def="The Church of The Immaculate Conception, Tenure (TEN) · The Church of The Nativity of Our Lady, Fieldstown (F/T)" multiline={false} />
      </div>
    </div>
  )
}
