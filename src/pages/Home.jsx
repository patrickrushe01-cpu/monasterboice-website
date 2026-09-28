import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { ChangePhoto, Editable, EditableImg, EditText, SmartLink, useContent } from '../lib/content.jsx'
import { postPath } from '../lib/news.js'

// Starting set of rotating quotes. Once you edit them on the page, your saved version replaces these.
const defaultQuotes = [
  { text: '"I am the vine; you are the branches. Whoever remains in me, and I in him, will bear much fruit."', source: 'John 15:5', image: '/images/community.jpg' },
  { text: '"Charity is patient, is kind... Charity never faileth."', source: '1 Corinthians 13:4,8', image: '/images/insta-stbrigid.jpg' },
  { text: '"Let nothing disturb you, let nothing frighten you. All things pass away; God never changes."', source: 'St. Teresa of Ávila', image: '/images/insta-grotto.jpg' },
]

export default function Home() {
  const c = useContent()
  const [news, setNews] = useState([])
  const [qi, setQi] = useState(0)

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('id,title,image_url,published_at,slug')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setNews(data || []))
  }, [])

  const rawQuotes = c.get('home.quotes', null)
  const quotes = useMemo(() => {
    try {
      const arr = JSON.parse(rawQuotes)
      return Array.isArray(arr) && arr.length ? arr : defaultQuotes
    } catch { return defaultQuotes }
  }, [rawQuotes])
  const idx = Math.min(qi, quotes.length - 1)
  const quote = quotes[idx]

  useEffect(() => {
    if (c.editing || quotes.length < 2) return
    const t = setInterval(() => setQi(i => (i + 1) % quotes.length), 8000)
    return () => clearInterval(t)
  }, [c.editing, quotes.length])

  const saveQuotes = arr => c.setDraft('home.quotes', JSON.stringify(arr))
  const updateQuote = patch => saveQuotes(quotes.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  const addQuote = () => {
    const blank = { text: '"Type your new quote here."', source: 'Who said it', image: quote.image }
    saveQuotes([...quotes.slice(0, idx + 1), blank, ...quotes.slice(idx + 1)])
    setQi(idx + 1)
  }
  const removeQuote = () => {
    if (quotes.length < 2) { window.alert('There has to be at least one quote.'); return }
    if (!window.confirm('Remove this quote from the rotation?')) return
    saveQuotes(quotes.filter((_, i) => i !== idx))
    setQi(Math.max(0, idx - 1))
  }

  const heroImage = c.get('home.hero.image', '/images/hero-both-churches.jpg')

  return (
    <div>
      <div style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        height: 542, position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <Nav transparent />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(20,15,10,0.82) 0%, rgba(20,15,10,0.25) 55%, rgba(20,15,10,0.05) 100%)' }} />
        <ChangePhoto id="home.hero.image" label="Change top photo" style={{ position: 'absolute', top: 96, right: 24 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 64px 60px', marginTop: 'auto', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Editable as="h1" id="home.hero.title" def={'A parish centred on Christ,\nablaze with His love.'}
            style={{ fontSize: 48, lineHeight: 1.1, color: '#fff', fontWeight: 800, margin: 0 }} />
          <Editable as="p" id="home.hero.sub" def="Serving Tenure and Fieldstown as one parish family — welcoming all who come to worship, celebrate, and grieve together."
            style={{ fontSize: 17, color: '#F0E8DC', lineHeight: 1.6, margin: 0, maxWidth: 520 }} />
          <div style={{ display: 'flex', gap: 14 }}>
            <SmartLink to="/bulletins" className="btn"><Editable id="home.hero.btn1" def="This Week's Bulletin" multiline={false} /></SmartLink>
            <SmartLink to="/contact" className="btn-outline" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid #fff', color: '#fff' }}>
              <Editable id="home.hero.btn2" def="Get in Touch" multiline={false} />
            </SmartLink>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 64px', display: 'flex', justifyContent: 'center', transform: 'translateY(-40px)' }}>
        <div style={{ width: '100%', maxWidth: 1180, background: '#fff', borderRadius: 20, boxShadow: '0 20px 40px rgba(25,23,20,0.14)', padding: '34px 44px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 32 }}>
          <MassColumn
            id="home.mass.ten"
            defName="The Church of The Immaculate Conception, Tenure (TEN)"
            defWeekday="Tue 9.30am, Fri 7pm"
            defWeekend="Sun 11.30am"
          />
          <div style={{ borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '0 32px' }}>
            <MassColumn
              id="home.mass.ft"
              defName="The Church of The Nativity of Our Lady, Fieldstown (F/T)"
              defWeekday="Wed 9.30am"
              defWeekend="Sun 9.45am"
            />
          </div>
          <div>
            <Editable as="div" id="home.mass.conf.title" def="CONFESSIONS & ADORATION"
              style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }} />
            <Editable as="div" id="home.mass.conf.text" def={'Before/after any Mass\nTue & Wed, 30 min after Mass'}
              style={{ fontSize: 15, lineHeight: 1.7 }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 64px 80px', display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
        {[['1,500+', 'PARISHIONERS'], ['2', 'CHURCHES, ONE FAMILY'], ['5th C.', 'ROOTS AT MONASTERBOICE'], ['4', 'MASSES EVERY WEEK']].map(([n, l], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <Editable as="div" id={`home.stat.${i + 1}.num`} def={n} multiline={false} style={{ fontSize: 42, fontWeight: 800 }} />
            <Editable as="div" id={`home.stat.${i + 1}.label`} def={l} multiline={false} style={{ fontSize: 13, color: 'var(--faint)', letterSpacing: '0.04em' }} />
          </div>
        ))}
      </div>

      <Section
        id="home.p1"
        defTag="PARISH LIFE"
        defTitle="Celebrating and grieving, together"
        defText="From weddings and funerals to first Communions and community days, the parish walks with families through every stage of life. Weddings and funerals are arranged directly with the parish office."
        linkTo="/sacraments" defLink="Weddings, funerals and sacraments"
        defImage="/images/wedding.jpg"
      />
      <Section
        reverse
        id="home.p2"
        defTag="FEAST DAYS & SEASONS"
        defTitle="Both churches, dressed for every season"
        defText="From Advent and Christmas to Lent and Easter, Tenure and Fieldstown are decorated together throughout the liturgical year — each with its own character, both part of the one parish family."
        linkTo="/news" defLink="See more from the parish calendar"
        defImage="/images/feast-fieldstown.jpg"
      />
      <Section
        id="home.p3"
        defTag="LATEST FROM THE PARISH"
        defTitle="What's been happening lately"
        defText="Ordinations, jubilees, cemetery blessings and community days — catch up on recent news from both churches."
        linkTo="/news" defLink="Read the latest news"
        defImage="/images/ordination.jpg"
      />

      <div style={{
        width: '100%', height: 420, marginTop: 60, position: 'relative',
        backgroundImage: `url(${quote.image})`, backgroundSize: 'cover', backgroundPosition: 'center 20%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-image 0.6s ease',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.55)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, textAlign: 'center', padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <EditText key={`t${idx}`} as="div" value={quote.text} onCommit={t => updateQuote({ text: t })}
            style={{ fontSize: 28, color: '#fff', fontWeight: 700, lineHeight: 1.45 }} />
          <div style={{ fontSize: 14, color: '#E7DFD2', letterSpacing: '0.06em', fontWeight: 600 }}>
            — <EditText key={`s${idx}`} value={quote.source} onCommit={t => updateQuote({ source: t })} multiline={false} />
          </div>
        </div>
        {c.editing && (
          <div style={{ position: 'absolute', zIndex: 6, left: 0, right: 0, bottom: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="edit-mini-btn" onClick={() => setQi((idx - 1 + quotes.length) % quotes.length)}>← Previous</button>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Quote {idx + 1} of {quotes.length}</span>
            <button type="button" className="edit-mini-btn" onClick={() => setQi((idx + 1) % quotes.length)}>Next →</button>
            <span style={{ width: 12 }} />
            <ChangePhoto id="home.quotes" onUrl={url => updateQuote({ image: url })} label="Change this photo" />
            <button type="button" className="edit-mini-btn" onClick={addQuote}>+ Add a quote</button>
            <button type="button" className="edit-mini-btn" onClick={removeQuote}>Remove this quote</button>
          </div>
        )}
      </div>

      <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Editable as="h2" id="home.news.title" def="Latest news" multiline={false} style={{ fontSize: 30, fontWeight: 800, margin: 0 }} />
          <SmartLink to="/news" className="textlink" style={{ fontSize: 15 }}>
            <Editable id="home.news.link" def="View all news →" multiline={false} />
          </SmartLink>
        </div>
        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28 }}>
          {(news.length ? news : placeholderNews).map((n, i) => (
            <Link key={n.id || i} to={postPath(n)} className="photocard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {n.image_url ? (
                <img src={n.image_url} alt="" style={{ height: 190, width: '100%', objectFit: 'cover', borderRadius: 16 }} />
              ) : (
                <div style={{ height: 190, width: '100%', borderRadius: 16, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 13, letterSpacing: '0.1em', fontWeight: 700 }}>PARISH NEWS</div>
              )}
              <div style={{ fontSize: 13, color: 'var(--faint)' }}>{formatDate(n.published_at)}</div>
              <div className="photocard-title" style={{ fontSize: 18, fontWeight: 700 }}>{n.title}</div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

function MassColumn({ id, defName, defWeekday, defWeekend }) {
  const label = { color: 'var(--accent)', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em' }
  return (
    <div>
      <Editable as="div" id={`${id}.name`} def={defName} multiline={false} style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }} />
      <div style={{ fontSize: 15, lineHeight: 1.7 }}>
        <div><span style={label}>WEEKDAY </span><Editable id={`${id}.weekday`} def={defWeekday} multiline={false} /></div>
        <div><span style={label}>WEEKEND </span><Editable id={`${id}.weekend`} def={defWeekend} multiline={false} /></div>
      </div>
    </div>
  )
}

function Section({ id, defTag, defTitle, defText, defLink, linkTo, defImage, reverse = false }) {
  return (
    <div style={{ padding: '64px 64px 20px', display: 'flex', alignItems: 'center', gap: 64, flexDirection: reverse ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
      <EditableImg id={`${id}.image`} def={defImage} wrapperStyle={{ flex: 1, minWidth: 300 }} style={{ height: 340, objectFit: 'cover', borderRadius: 20 }} />
      <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Editable as="div" id={`${id}.tag`} def={defTag} multiline={false} style={{ fontSize: 13, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }} />
        <Editable as="h3" id={`${id}.title`} def={defTitle} style={{ fontSize: 30, fontWeight: 800, margin: 0 }} />
        <Editable as="p" id={`${id}.text`} def={defText} style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} />
        <SmartLink to={linkTo} className="textlink" style={{ fontSize: 15 }}>
          <Editable id={`${id}.link`} def={defLink} multiline={false} /> →
        </SmartLink>
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IE', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
}

const placeholderNews = [
  { image_url: '/images/news-graves.jpg', title: 'Blessing of Graves 2026', published_at: '2026-07-19' },
  { image_url: '/images/news-jubilee.jpg', title: 'Jubilee Celebration of Priestly Anniversaries', published_at: '2026-05-31' },
  { image_url: '/images/news-easter.jpg', title: 'Easter Message 2026', published_at: '2026-04-04' },
]
