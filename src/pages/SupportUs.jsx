import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { Editable, EditableLines, LinkButton } from '../lib/content.jsx'

// Archdiocese of Armagh online giving (Republic of Ireland parishes)
const DONATE_URL = 'https://platform.payzone.ie/customer/11154/product-list'
// Revenue's explanation of the Charitable Donation Scheme
const REVENUE_URL = 'https://www.revenue.ie/en/companies-and-charities/charities-and-sports-bodies/charitable-donation-scheme/index.aspx'

const councilDefault = [
  'Aidan Berrill — Chair',
  'Michael Murphy',
  'Nicola Courtney',
  'Orla Devine',
  'Bridget Robinson',
  'Andrew Ford',
  'Rosie Grimes',
  'Denis Mulroy',
  'Alison Finglas',
  'Fr Paddy Rushe — Secretary',
].join('\n')

const wrap = { padding: 'clamp(36px, 8vw, 56px) var(--pad) 8px', display: 'flex', justifyContent: 'center' }
const inner = { width: '100%', maxWidth: 1100 }
const card = { background: 'var(--cream)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }
const h2 = { fontSize: 'clamp(24px, 6vw, 30px)', fontWeight: 800, margin: 0 }
const lead = { fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0, maxWidth: 760 }
const small = { fontSize: 13, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }

export default function SupportUs() {
  const [accounts, setAccounts] = useState(null)

  useEffect(() => {
    supabase.from('parish_accounts').select('*').order('year', { ascending: false })
      .then(({ data }) => setAccounts(data || []))
  }, [])

  const latest = accounts && accounts[0]
  const earlier = accounts ? accounts.slice(1) : []

  return (
    <div>
      <Nav />

      <div style={{ background: 'var(--cream)', padding: 'clamp(36px, 8vw, 56px) var(--pad)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--faint)' }}>Home / Support Us</div>
        <Editable as="h1" id="support.title" def="Support Your Parish" multiline={false} style={{ fontSize: 'clamp(30px, 8vw, 40px)', fontWeight: 800, margin: 0 }} />
        <Editable as="p" id="support.intro"
          def="Our two churches, the Parochial House and the whole life of the parish are supported directly by the weekly contributions and regular donations of parishioners. Thank you for your generosity."
          style={{ ...lead, maxWidth: 680 }} />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 6 }}>
          <LinkButton id="support.donate" def={DONATE_URL} className="btn"><Editable id="support.donate.label" def="Donate now" multiline={false} /></LinkButton>
          <a href="#accounts" className="btn-outline">Parish accounts</a>
        </div>
      </div>

      <div style={{ padding: '22px var(--pad)', display: 'flex', gap: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--line)' }}>
        {[['#ways', 'Ways to give'], ['#tax', 'Tax relief'], ['#accounts', 'Parish accounts'], ['#fees', 'Fees & charges'], ['#council', 'Finance Council'], ['#enquiries', 'Enquiries']].map(([href, label]) => (
          <a key={href} href={href} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{label}</a>
        ))}
      </div>

      {/* WAYS TO GIVE */}
      <div id="ways" style={wrap}>
        <div style={{ ...inner, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="div" id="support.ways.tag" def="WAYS TO GIVE" multiline={false} style={small} />
            <Editable as="h2" id="support.ways.title" def="Giving to your parish" multiline={false} style={h2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 22 }}>
            <div style={card}>
              <Editable as="h3" id="support.env.title" def="Parish envelopes" multiline={false} style={{ fontSize: 20, fontWeight: 800, margin: 0 }} />
              <Editable as="p" id="support.env.text"
                def="Parish envelopes are distributed once a year. Please contact the Parish Office if you would like to receive a box, or to get the details you need to contribute online."
                style={{ ...lead, fontSize: 15 }} />
            </div>
            <div style={card}>
              <Editable as="h3" id="support.online.title" def="Online giving" multiline={false} style={{ fontSize: 20, fontWeight: 800, margin: 0 }} />
              <Editable as="p" id="support.online.text"
                def={'Give securely at any time, from home or abroad. Choose Monasterboice from the list of parishes, then select "Parish Sunday Envelope / Offertory Collection". Online giving is provided by the Archdiocese of Armagh.'}
                style={{ ...lead, fontSize: 15 }} />
              <div><LinkButton id="support.donate" def={DONATE_URL} className="btn"><Editable id="support.donate.label" def="Donate now" multiline={false} /></LinkButton></div>
            </div>
            <div style={card}>
              <Editable as="h3" id="support.bank.title" def="Bank transfer" multiline={false} style={{ fontSize: 20, fontWeight: 800, margin: 0 }} />
              <Editable as="p" id="support.bank.text" def={'BIC: AIBKIE2D\nIBAN: IE68 AIBK 9320 9421 7710 85\nPlease give your envelope number or surname as the reference.'}
                style={{ ...lead, fontSize: 15 }} />
            </div>
            <div style={card}>
              <Editable as="h3" id="support.legacy.title" def="Gifts in wills" multiline={false} style={{ fontSize: 20, fontWeight: 800, margin: 0 }} />
              <Editable as="p" id="support.legacy.text"
                def="Legacy gifts are an important source of income for a parish, allowing us to plan for the long term and helping you to support your church after you are gone. Please contact the Parish Office for further details."
                style={{ ...lead, fontSize: 15 }} />
            </div>
          </div>
        </div>
      </div>

      {/* TAX RELIEF */}
      <div id="tax" style={{ ...wrap, paddingTop: 72 }}>
        <div style={{ ...inner, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="div" id="support.tax.tag" def="TAX RELIEF ON YOUR DONATION" multiline={false} style={small} />
            <Editable as="h2" id="support.tax.title" def="Make your gift go further, at no cost to you" multiline={false} style={h2} />
            <Editable as="p" id="support.tax.text"
              def="Under the Charitable Donation Scheme, if you pay Irish income tax (PAYE or self-assessed) and your donations to the parish total €250 or more in a calendar year, the parish can claim back the tax you have already paid on them from Revenue. That adds roughly 31% to your gift — a €250 donation is worth about €362 to the parish — and it costs you nothing extra."
              style={lead} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 22 }}>
            {[
              ['1', 'Give in a way that is recorded', 'Parish envelopes, online giving, bank transfer or standing order all qualify. Loose cash in the collection cannot be claimed.'],
              ['2', 'Sign a CHY3 form', 'The CHY3 “enduring certificate” lets the parish claim on your donations for five years. You will need your PPS number. It does not oblige you to keep giving.'],
              ['3', 'Return it to the Parish Office', 'Hand it in at the Parish Office or send it to us. The parish takes care of the claim with Revenue.'],
            ].map(([n, t, x]) => (
              <div key={n} style={card}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--accent)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
                <Editable as="h3" id={`support.tax.step${n}.title`} def={t} multiline={false} style={{ fontSize: 18, fontWeight: 800, margin: 0 }} />
                <Editable as="p" id={`support.tax.step${n}.text`} def={x} style={{ ...lead, fontSize: 15 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <LinkButton id="support.chy3" def="" className="btn"><Editable id="support.chy3.label" def="Download the CHY3 form" multiline={false} /></LinkButton>
            <LinkButton id="support.revenue" def={REVENUE_URL} className="btn-outline"><Editable id="support.revenue.label" def="How the scheme works (Revenue.ie)" multiline={false} /></LinkButton>
          </div>
          <Editable as="p" id="support.tax.note" def="Not sure whether you qualify, or would like a form posted to you? Please contact the Parish Office."
            style={{ ...lead, fontSize: 14 }} />
        </div>
      </div>

      {/* ACCOUNTS */}
      <div id="accounts" style={{ ...wrap, paddingTop: 72 }}>
        <div style={{ ...inner, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="div" id="support.acc.tag" def="PARISH ACCOUNTS" multiline={false} style={small} />
            <Editable as="h2" id="support.acc.title" def="How your contributions are used" multiline={false} style={h2} />
            <Editable as="p" id="support.acc.text"
              def="The parish’s certified accounts are published each year so that everyone can see how donations are received and spent. Accounts are available below going back to 2019."
              style={lead} />
          </div>
          {latest ? (
            <div style={{ background: 'var(--ink)', borderRadius: 18, padding: '30px 34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>LATEST ACCOUNTS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Parish Accounts {latest.year}</div>
              </div>
              <a href={latest.file_url} target="_blank" rel="noreferrer" className="btn">Download PDF</a>
            </div>
          ) : (
            accounts && (
              <div style={card}>
                <Editable as="p" id="support.acc.empty" def="The latest accounts are available from the Parish Office on request." style={{ ...lead, fontSize: 15 }} />
              </div>
            )
          )}
          {earlier.length > 0 && (
            <div>
              <div style={{ fontSize: 13, letterSpacing: '0.06em', color: 'var(--faint)', fontWeight: 700, marginBottom: 10 }}>EARLIER YEARS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))', gap: 12 }}>
                {earlier.map(a => (
                  <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                    <span>{a.year}</span>
                    <span style={{ color: 'var(--accent)', fontSize: 13 }}>PDF →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FEES */}
      <div id="fees" style={{ ...wrap, paddingTop: 72 }}>
        <div style={{ ...inner, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="div" id="support.fees.tag" def="FEES & CHARGES" multiline={false} style={small} />
            <Editable as="h2" id="support.fees.title" def="Caring for our churches" multiline={false} style={h2} />
            <Editable as="p" id="support.fees.text"
              def="There is no charge for a sacrament itself. The parish does, however, ask for the following, which help meet the real costs of running and caring for our churches."
              style={lead} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 22 }}>
            {[
              ['church', 'Use of the church for weddings', 'A charge applies for the use of the church for a wedding. It helps cover heating, lighting, insurance, cleaning and general upkeep.'],
              ['sacristan', 'Sacristan', 'The sacristan looks after the church and assists at ceremonies. A sacristan’s fee applies and is separate from the charge for the use of the church.'],
              ['certs', 'Certificates', 'An administration charge applies when the Parish Office prepares and issues certificates, to cover the time and cost involved.'],
            ].map(([k, t, x]) => (
              <div key={k} style={card}>
                <Editable as="h3" id={`support.fee.${k}.title`} def={t} multiline={false} style={{ fontSize: 18, fontWeight: 800, margin: 0 }} />
                <Editable as="p" id={`support.fee.${k}.text`} def={x} style={{ ...lead, fontSize: 15 }} />
                <Editable as="div" id={`support.fee.${k}.amount`} def="Please contact the Parish Office for the current amount." style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINANCE COUNCIL */}
      <div id="council" style={{ ...wrap, paddingTop: 72 }}>
        <div style={{ ...inner, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Editable as="div" id="support.council.tag" def="PARISH FINANCE COUNCIL" multiline={false} style={small} />
            <Editable as="h2" id="support.council.title" def="Those who help guide the parish’s finances" multiline={false} style={h2} />
            <Editable as="p" id="support.council.text"
              def="The Finance Council advises the Parish Priest in looking after the parish’s finances and property. Our thanks to each of its members for their time and care."
              style={lead} />
          </div>
          <EditableLines id="support.council.list" def={councilDefault} render={lines => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))', gap: 14 }}>
              {lines.map((line, i) => {
                const { name, role } = parseMember(line)
                return (
                  <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '16px 20px' }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{name}</div>
                    {role && <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>{role}</div>}
                  </div>
                )
              })}
            </div>
          )} />
        </div>
      </div>

      {/* ENQUIRIES */}
      <div id="enquiries" style={{ ...wrap, paddingTop: 72, paddingBottom: 72 }}>
        <div className="enq-box" style={{ ...inner, background: 'var(--ink)', borderRadius: 20, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Editable as="h2" id="support.enq.title" def="Questions about parish finances?" multiline={false} style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#fff' }} />
          <Editable as="p" id="support.enq.text" def="All finance enquiries go to the Parish Office."
            style={{ fontSize: 16, color: '#E7DFD2', margin: 0 }} />
          <Editable as="div" id="support.enq.details" def={'087 379 1443\nmonasterboiceparishoffice@gmail.com\nMonday–Thursday, 9am–1pm'}
            style={{ fontSize: 16, color: '#fff', fontWeight: 700, lineHeight: 1.8 }} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

// "Name — Role", "Name - Role" or "Name (Role)"
function parseMember(line) {
  const parts = line.split(/\s[—–-]\s/)
  if (parts.length > 1) return { name: parts[0].trim(), role: parts.slice(1).join(' — ').trim() }
  const m = line.match(/^(.*?)\s*\((.+)\)\s*$/)
  if (m) return { name: m[1].trim(), role: m[2].trim() }
  return { name: line.trim(), role: '' }
}
