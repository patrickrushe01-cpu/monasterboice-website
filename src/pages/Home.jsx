import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Home() {
  const [news, setNews] = useState([])

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setNews(data || []))
  }, [])

  return (
    <div>
      <div style={{
        backgroundImage: 'url(/images/hero-both-churches.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        height: 542, position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <Nav transparent />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(20,15,10,0.82) 0%, rgba(20,15,10,0.25) 55%, rgba(20,15,10,0.05) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 64px 60px', marginTop: 'auto', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, color: '#fff', fontWeight: 800, margin: 0 }}>
            A parish centred on Christ, ablaze with His love.
          </h1>
          <p style={{ fontSize: 17, color: '#F0E8DC', lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
            Serving Tenure and Fieldstown as one parish family — welcoming all who come to worship, celebrate, and grieve together.
          </p>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link to="/bulletins" className="btn">This Week's Bulletin</Link>
            <Link to="/contact" className="btn-outline" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid #fff', color: '#fff' }}>Get in Touch</Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 64px', display: 'flex', justifyContent: 'center', transform: 'translateY(-40px)' }}>
        <div style={{ width: '100%', maxWidth: 1180, background: '#fff', borderRadius: 20, boxShadow: '0 20px 40px rgba(25,23,20,0.14)', padding: '34px 44px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>WEEKDAY MASSES</div>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>Tenure (IC) — Tue 9.30am, Fri 7pm<br />Fieldstown (FT) — Wed 9.30am</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '0 32px' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>WEEKEND MASSES</div>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>Fieldstown (FT) — Sun 9.45am<br />Tenure (IC) — Sun 11.30am</div>
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>CONFESSIONS &amp; ADORATION</div>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>Before/after any Mass<br />Tue &amp; Wed, 30 min after Mass</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 64px 80px', display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
        {[['1,500+', 'PARISHIONERS'], ['2', 'CHURCHES, ONE FAMILY'], ['5th C.', 'ROOTS AT MONASTERBOICE'], ['4', 'MASSES EVERY WEEK']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 800 }}>{n}</div>
            <div style={{ fontSize: 13, color: 'var(--faint)', letterSpacing: '0.04em' }}>{l}</div>
          </div>
        ))}
      </div>

      <Section
        tag="WEDDINGS & FUNERALS"
        title="Marking life's biggest moments together"
        text="Weddings and funerals are arranged directly with the parish office. We're here to walk with your family through both joyful and difficult days."
        linkTo="/sacraments" linkLabel="Plan a wedding or funeral"
        image="/images/wedding.jpg"
      />
      <Section
        reverse
        tag="ORDINATIONS & JUBILEES"
        title="Celebrating the priests who serve us"
        text="From ordinations to priestly jubilees, the parish gathers to give thanks for the men who have given their lives in service here and beyond."
        linkTo="/news" linkLabel="Read about recent celebrations"
        image="/images/ordination.jpg"
      />
      <Section
        tag="FEAST DAYS & SEASONS"
        title="Both churches, dressed for every season"
        text="From Advent and Christmas to Lent and Easter, Tenure and Fieldstown are decorated together throughout the liturgical year — each with its own character, both part of the one parish family."
        linkTo="/news" linkLabel="See more from the parish calendar"
        image="/images/feast-fieldstown.jpg"
      />

      <div style={{
        width: '100%', height: 420, marginTop: 60, position: 'relative',
        backgroundImage: 'url(/images/community.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 20%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.55)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontSize: 30, color: '#fff', fontWeight: 700, lineHeight: 1.4 }}>
            "A parish that is centred on Christ, and ablaze with His love."
          </div>
        </div>
      </div>

      <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Latest news</h2>
          <Link to="/news" className="textlink" style={{ fontSize: 15 }}>View all news →</Link>
        </div>
        <div style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28 }}>
          {(news.length ? news : placeholderNews).map((n, i) => (
            <Link key={n.id || i} to="/news" className="photocard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <img src={n.image_url || placeholderNews[i]?.image_url} alt="" style={{ height: 190, width: '100%', objectFit: 'cover', borderRadius: 16 }} />
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

function Section({ tag, title, text, linkTo, linkLabel, image, reverse = false }) {
  return (
    <div style={{ padding: '64px 64px 20px', display: 'flex', alignItems: 'center', gap: 64, flexDirection: reverse ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
      <img src={image} alt="" style={{ flex: 1, minWidth: 300, height: 340, objectFit: 'cover', borderRadius: 20 }} />
      <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }}>{tag}</div>
        <h3 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>{title}</h3>
        <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{text}</p>
        <Link to={linkTo} className="textlink" style={{ fontSize: 15 }}>{linkLabel} →</Link>
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
}

const placeholderNews = [
  { image_url: '/images/news-graves.jpg', title: 'Blessing of Graves 2026', published_at: '2026-07-19' },
  { image_url: '/images/news-jubilee.jpg', title: 'Jubilee Celebration of Priestly Anniversaries', published_at: '2026-05-31' },
  { image_url: '/images/news-easter.jpg', title: 'Easter Message 2026', published_at: '2026-04-04' },
]
