import { createClient } from 'npm:@supabase/supabase-js@2'

// Contact-form messages, called from the Contact page.
// 1) Validates and SAVES the message (so it always appears under Messages in Admin).
// 2) Emails it to the office, if email sending is configured. Replying to that email
//    answers the person who wrote in (Reply-To is set to their address).
//
// Secrets (set in the Supabase dashboard under Edge Functions > Secrets). All three are
// needed for the email alert; without them the message is still saved:
//   RESEND_API_KEY      an API key from resend.com with "Sending access"
//   CONTACT_NOTIFY_TO   where alerts go, e.g. monasterboiceparishoffice@gmail.com
//   CONTACT_FROM        the sender shown on the alert, on a domain verified in Resend,
//                       e.g.  Monasterboice Parish website <website@yourdomain.com>
//
// Browsers ask permission before calling a function from another website (a "preflight"
// OPTIONS request), so every response, including that one, carries the CORS headers below.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}
const EMAIL_OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const clean = (v: unknown) => String(v ?? '').trim()
const oneLine = (v: string) => v.replace(/[\r\n\u2028\u2029]+/g, ' ').trim()

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* fall through to validation below */ }
  const name = oneLine(clean(body.name))
  const email = clean(body.email)
  const subject = oneLine(clean(body.subject))
  const message = clean(body.message)

  if (name.length < 1 || name.length > 120) return json({ error: 'invalid name' }, 400)
  if (!EMAIL_OK.test(email) || email.length < 3 || email.length > 254) return json({ error: 'invalid email' }, 400)
  if (subject.length < 1 || subject.length > 200) return json({ error: 'invalid subject' }, 400)
  if (message.length < 1 || message.length > 4000) return json({ error: 'invalid message' }, 400)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // blunt scripted-flood guard: a real person never sends more than a handful a minute
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).gt('created_at', oneMinuteAgo)
  if ((count ?? 0) >= 10) return json({ error: 'too many requests' }, 429)

  const { error: dbError } = await supabase.from('contact_messages').insert([{ name, email, subject, message }])
  if (dbError) return json({ error: 'could not save' }, 500)

  const key = Deno.env.get('RESEND_API_KEY')
  const to = Deno.env.get('CONTACT_NOTIFY_TO')
  const from = Deno.env.get('CONTACT_FROM')
  let notified: 'skipped' | 'sent' | 'failed' = 'skipped'

  if (key && to && from) {
    try {
      const sent = new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'full', timeStyle: 'short' })
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `Website message: ${subject}`,
          // plain text only: nothing the sender typed is ever treated as HTML
          text: `From: ${name} <${email}>\nSent: ${sent}\n\n${message}\n\n—\nSent from the Contact form on the parish website. Press Reply to answer ${name} directly.`,
        }),
      })
      notified = res.ok ? 'sent' : 'failed'
      if (!res.ok) console.error('email alert failed', res.status, (await res.text()).slice(0, 300))
    } catch (e) {
      notified = 'failed'
      console.error('email alert error', String(e))
    }
  }

  // A mail hiccup never loses a message: it is already saved and visible in Admin.
  return json({ ok: true, notified })
})
