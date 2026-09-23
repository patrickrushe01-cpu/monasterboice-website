import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabaseClient.js'

// Quotes for the rotating band on the homepage — mostly Irish saints and Church documents.
// Translations of older texts vary; "(attributed)" marks sayings handed down by tradition.
const heroQuotes = [
  { text: 'Christ with me, Christ before me, Christ behind me, Christ in me, Christ beneath me, Christ above me.', source: "St Patrick's Breastplate" },
  { text: 'I arise today through a mighty strength, the invocation of the Trinity.', source: "St Patrick's Breastplate" },
  { text: 'I am greatly God\'s debtor, who gave me such grace that through me many people were reborn in God.', source: 'St Patrick, Confessio' },
  { text: 'I would like a great lake of ale for the King of Kings; I would like the people of heaven to be drinking it through all time.', source: 'St Brigid (attributed)' },
  { text: 'My children, this is my last word to you: be at peace, and have sincere love for one another.', source: 'St Colmcille, as told by Adomnán' },
  { text: 'If you wish to know the Creator, learn to know His creation.', source: 'St Columbanus (attributed)' },
  { text: 'If you take away freedom, you take away dignity.', source: 'St Columbanus (attributed)' },
  { text: 'Shall I abandon, O King of mysteries, the soft comforts of home? Shall I turn my back on my native land, and my face towards the sea?', source: 'Prayer of St Brendan (attributed)' },
  { text: 'Three things please God most: true faith with a pure heart, a simple life with a grateful spirit, and generosity inspired by charity.', source: 'St Ita (attributed)' },
  { text: 'The highest recommendation of his teaching was that he taught nothing he did not live.', source: 'St Bede, of St Aidan' },
  { text: 'I do forgive all who had a hand, directly or indirectly, in my death.', source: 'St Oliver Plunkett, Archbishop of Armagh, 1681' },
  { text: 'The poor need help today, not next week.', source: 'Venerable Catherine McAuley' },
  { text: 'There are three things the poor prize more highly than gold: the kind word, the gentle compassionate look, and the patient hearing of their sorrows.', source: 'Venerable Catherine McAuley' },
  { text: 'If I could be of any service in saving souls in any part of the globe, I would willingly do all in my power.', source: 'Venerable Nano Nagle' },
  { text: 'Not words, but deeds.', source: 'Venerable Nano Nagle (attributed)' },
  { text: 'Never be too hard on the man who can\'t give up drink. It is hard — but it is possible, and even easy, for Our Lord.', source: 'Venerable Matt Talbot' },
  { text: 'Be Thou my vision, O Lord of my heart; naught be all else to me, save that Thou art.', source: 'Ancient Irish hymn, Rop tú mo Baile' },
  { text: 'Ar scáth a chéile a mhaireann na daoine — people live in one another\'s shelter.', source: 'Irish seanfhocal' },
  { text: 'On my knees I beg you to turn away from the paths of violence and to return to the ways of peace.', source: 'Pope St John Paul II, Drogheda, 1979' },
  { text: 'The parish is the Church living in the midst of the homes of her sons and daughters.', source: 'Pope St John Paul II, Christifideles Laici' },
  { text: 'The joys and hopes, the griefs and anxieties of the people of this age, especially the poor, are the joys and hopes, the griefs and anxieties of the followers of Christ.', source: 'Second Vatican Council, Gaudium et Spes' },
  { text: 'The liturgy is the summit toward which the activity of the Church is directed; it is also the font from which all her power flows.', source: 'Second Vatican Council, Sacrosanctum Concilium' },
  { text: 'The parish is a community of communities, a sanctuary where the thirsty come to drink in the midst of their journey.', source: 'Pope Francis, Evangelii Gaudium' },
  { text: 'The Church is called to be the house of the Father, with doors always wide open.', source: 'Pope Francis, Evangelii Gaudium' },
  { text: 'The joy of the Gospel fills the hearts and lives of all who encounter Jesus.', source: 'Pope Francis, Evangelii Gaudium' },
  { text: 'I prefer a Church which is bruised, hurting and dirty because it has been out on the streets, rather than a Church which is unhealthy from being confined.', source: 'Pope Francis, Evangelii Gaudium' },
  { text: 'Being Christian is not the result of a lofty idea, but the encounter with a person, which gives life a new horizon and a decisive direction.', source: 'Pope Benedict XVI, Deus Caritas Est' },
  { text: 'They devoted themselves to the apostles\' teaching and fellowship, to the breaking of bread and the prayers.', source: 'Acts 2:42' },
  { text: 'Where two or three are gathered in my name, I am there among them.', source: 'Matthew 18:20' },
  { text: 'I am the vine; you are the branches. Whoever remains in me, and I in him, will bear much fruit.', source: 'John 15:5' },
]

// Photos shown behind the quotes, cycling independently of the quotes.
// To add a photo: put it in public/images/ and add its filename here.
const quotePhotos = [
  '/images/street-dancing.jpg',
  '/images/altar-flowers.jpg',
  '/images/first-communion.jpg',
  '/images/outdoor-mass-evening.jpg',
  '/images/wedding-selfie.jpg',
  '/images/jubilee-altar.jpg',
  '/images/confirmation.jpg',
  '/images/parish-welcome.jpg',
  '/images/clergy-with-bishop.jpg',
  '/images/sacred-heart-sanctuary.jpg',
  '/images/wedding-congregation.jpg',
  '/images/jubilee-mass.jpg',
  '/images/community.jpg',
  '/images/insta-stbrigid.jpg',
  '/images/insta-grotto.jpg',
  '/images/insta-stboice.jpg',
  '/images/insta-shine.jpg',
  '/images/feast-fieldstown.jpg',
]

export default function Home() {
  const [news, setNews] = useState([])
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setNews(data || []))
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex(i => (i + 1) % heroQuotes.length)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const quote = heroQuotes[quoteIndex]
  const quotePhoto = quotePhotos[quoteIndex % quotePhotos.length]

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
        <div style={{ position: 'relative', zIndex: 2, padding: '0 64px 60px', marginTop: 'auto', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, color: '#fff', fontWeight: 800, margin: 0 }}>
            A parish centred on Christ,<br />ablaze with His love.
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
            <MassLine church="Immaculate Conception, Tenure (TEN)" times="Tue 9.30am, Fri 7pm" />
            <MassLine church="Nativity of Our Lady, Fieldstown (F/T)" times="Wed 9.30am" />
          </div>
          <div style={{ borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '0 32px' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>WEEKEND MASSES</div>
            <MassLine church="Nativity of Our Lady, Fieldstown (F/T)" times="Sun 9.45am" />
            <MassLine church="Immaculate Conception, Tenure (TEN)" times="Sun 11.30am" />
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
        tag="FEAST DAYS & SEASONS"
        title="Both churches, dressed for every season"
        text="From Advent and Christmas to Lent and Easter, Tenure and Fieldstown are decorated together throughout the liturgical year — each with its own character, both part of the one parish family."
        linkTo="/news" linkLabel="See more from the parish calendar"
        image="/images/feast-fieldstown.jpg"
      />
      <Section
        tag="PARISH LIFE"
        title="Every celebration, every gathering, one family"
        text="From ordinations and jubilees to first Communions and community days, the parish comes together often — here's a look at what's been happening lately."
        linkTo="/news" linkLabel="See the latest from the parish"
        image="/images/ordination.jpg"
      />

      <div style={{
        width: '100%', height: 420, marginTop: 60, position: 'relative',
        backgroundImage: `url(${quotePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center 20%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-image 0.6s ease',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.55)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, textAlign: 'center', padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 28, color: '#fff', fontWeight: 700, lineHeight: 1.45 }}>
            {quote.text}
          </div>
          <div style={{ fontSize: 14, color: '#E7DFD2', letterSpacing: '0.06em', fontWeight: 600 }}>
            — {quote.source}
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

function MassLine({ church, times }) {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{church}</div>
      <div style={{ color: 'var(--muted)' }}>{times}</div>
    </div>
  )
}
