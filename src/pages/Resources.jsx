import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { Editable, EditableLines, safeUrl } from '../lib/content.jsx'

// One resource per line:  Name | https://web-address | Short description
const defaultResources = [
  'Archdiocese of Armagh | https://www.armagharchdiocese.org | The website for the Archdiocese',
  'Irish Catholic Bishops’ Conference | https://www.catholicbishops.ie | The website for the Irish Episcopal Conference',
  'Vatican | https://www.vatican.va/content/vatican/en.html | The main website for the Vatican',
  'Vatican News | https://www.vaticannews.va/en.html | An excellent additional resource for news and resources from the Vatican',
  'iCatholic | https://www.icatholic.ie | An Irish Catholic media provider',
  'Catholic Ireland | https://www.catholicireland.net | An online resource for the Irish Church',
  'Church Services TV | https://www.churchservices.tv | Church webcams and streaming services',
  'Church Media | https://churchmedia.ie | Church webcams and streaming services',
  'Universalis | https://universalis.com | A website for the daily readings (including the Divine Office)',
  'Radio Maria | https://www.radiomaria.ie | A multimedia outreach of faith and evangelisation',
  'The Way | https://theway.ie/welcome/ | A digital multimedia platform set up by the Irish Bishops’ Conference, dedicated to sharing the Good News and the witness of the Catholic Church in Ireland',
].join('\n')

function parse(line) {
  const [name = '', url = '', ...rest] = line.split('|').map(s => s.trim())
  return { name, url: safeUrl(url), desc: rest.join(' | ') }
}

export default function Resources() {
  return (
    <div>
      <Nav />
      <div style={{ background: 'var(--cream)', padding: 'clamp(36px, 8vw, 56px) var(--pad)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Resources</div>
        <Editable as="h1" id="resources.title" def="Resources" multiline={false} style={{ fontSize: 'clamp(30px, 8vw, 40px)', fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="resources.intro"
          def="A list of important websites and other resources which you might find useful."
          style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 620, margin: 0 }} />
      </div>

      <div style={{ padding: '40px var(--pad) clamp(48px, 10vw, 80px)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          <EditableLines
            id="resources.list"
            def={defaultResources}
            hint="One website per line, written like: Name | https://web-address | Short description. Press Enter for a new line."
            render={lines => (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20 }}>
                {lines.map((line, i) => {
                  const { name, url, desc } = parse(line)
                  const body = (
                    <>
                      <div style={{ fontSize: 18, fontWeight: 800, color: url ? 'var(--accent)' : 'var(--ink)' }}>{name}{url ? ' →' : ''}</div>
                      {desc && <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>}
                    </>
                  )
                  const box = { display: 'flex', flexDirection: 'column', gap: 8, padding: '22px 24px', border: '1px solid var(--line)', borderRadius: 16, background: '#fff' }
                  return url
                    ? <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="photocard" style={box}>{body}</a>
                    : <div key={i} style={box}>{body}</div>
                })}
              </div>
            )}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
