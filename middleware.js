// Vercel Edge Middleware.
//
// Real visitors are completely unaffected by this file — it only steps in for the
// automated "link preview" crawlers that Facebook, WhatsApp, Slack, etc. send out the
// moment someone pastes a link. Those crawlers don't run JavaScript, so without this
// they only ever see the generic title/photo in index.html, never a story's own.
// This intercepts just those requests for a specific /news/:slug story and hands back
// a tiny HTML page with that story's real title, summary and photo in the tags those
// crawlers read, then sends a real visitor on to the actual page straight after.
//
// Tested separately in a plain Node/vitest environment (see PR/build notes) since the
// Edge Runtime itself can't run in a normal local test — the logic below is unchanged
// from those tests.

export const config = { matcher: '/news/:slug' }

const BOT_UA = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|Slackbot|LinkedInBot|TelegramBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Googlebot|bingbot|AppleBot/i

const SUPABASE_URL = 'https://vkuedrqdpixdzlnpskzl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWVkcnFkcGl4ZHpsbnBza3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODE3MDQsImV4cCI6MjEwNTI1NzcwNH0.IQLOpOrElFXT3hCrHsEVK-vkAQfRbTlzVehWckXwdeg'

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function absoluteUrl(url, origin) {
  if (!url) return origin
  try { return new URL(url, origin).toString() } catch { return origin }
}

function trimExcerpt(s, max = 200) {
  const t = String(s ?? '').trim()
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t
}

function renderPreviewHtml({ title, description, image, url, siteName = 'Monasterboice Parish' }) {
  const t = escapeHtml(title), d = escapeHtml(description), img = escapeHtml(image), u = escapeHtml(url)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${t} – ${escapeHtml(siteName)}</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="${escapeHtml(siteName)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${u}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=${u}">
</head><body>${t}</body></html>`
}

function parseNewsRequest(urlString, userAgent) {
  const url = new URL(urlString)
  const m = url.pathname.match(/^\/news\/([^/]+)\/?$/)
  if (!m) return null
  if (!BOT_UA.test(userAgent || '')) return null
  return { slug: decodeURIComponent(m[1]) }
}

export default async function middleware(request) {
  const match = parseNewsRequest(request.url, request.headers.get('user-agent'))
  if (!match) return // not a bot, or not a story page — the real site loads as normal

  try {
    const api = `${SUPABASE_URL}/rest/v1/news_posts?slug=eq.${encodeURIComponent(match.slug)}&select=title,excerpt,image_url&limit=1`
    const res = await fetch(api, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } })
    if (!res.ok) return
    const rows = await res.json()
    const post = rows[0]
    if (!post) return // unknown story — let the site show its own "not found" page

    const origin = new URL(request.url).origin
    const html = renderPreviewHtml({
      title: post.title,
      description: trimExcerpt(post.excerpt),
      image: absoluteUrl(post.image_url, origin) || `${origin}/images/hero-both-churches.jpg`,
      url: request.url,
    })
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch {
    return // if anything goes wrong, fall through to the normal site rather than error
  }
}
