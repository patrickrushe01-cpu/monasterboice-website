import { createClient } from 'npm:@supabase/supabase-js@2'
import { createHash } from 'node:crypto'

// Bulletin email sign-up, called from the Bulletins page.
// Always saves the address to this project's own subscriber list.
// If Mailchimp is configured (three secrets, set in the Supabase dashboard under
// Edge Functions > Secrets), it ALSO adds/updates the person in that Mailchimp audience.
//
//   MAILCHIMP_API_KEY        e.g. abcdef123456...-us7
//   MAILCHIMP_SERVER_PREFIX  the part after the dash, e.g. us7
//   MAILCHIMP_LIST_ID        the Audience ID
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let email = ''
  try { ({ email } = await req.json()) } catch { /* fall through to validation below */ }
  email = String(email ?? '').trim().toLowerCase()
  if (!EMAIL_OK.test(email) || email.length > 254) return json({ error: 'invalid email' }, 400)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // blunt scripted-flood guard
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase.from('bulletin_subscribers').select('*', { count: 'exact', head: true }).gt('created_at', oneMinuteAgo)
  if ((count ?? 0) > 60) return json({ error: 'too many requests' }, 429)

  const { error: dbError } = await supabase.from('bulletin_subscribers').upsert([{ email }], { onConflict: 'email', ignoreDuplicates: true })
  if (dbError) return json({ error: 'could not save' }, 500)

  const key = Deno.env.get('MAILCHIMP_API_KEY')
  const dc = Deno.env.get('MAILCHIMP_SERVER_PREFIX')
  const listId = Deno.env.get('MAILCHIMP_LIST_ID')
  let mailchimp: 'skipped' | 'synced' | 'failed' = 'skipped'

  if (key && dc && listId) {
    try {
      const hash = createHash('md5').update(email).digest('hex')
      const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`, {
        method: 'PUT',
        headers: { Authorization: `Basic ${btoa('anystring:' + key)}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email, status_if_new: 'subscribed' }),
      })
      mailchimp = res.ok ? 'synced' : 'failed'
      if (!res.ok) console.error('mailchimp sync failed', res.status, (await res.text()).slice(0, 300))
    } catch (e) {
      mailchimp = 'failed'
      console.error('mailchimp sync error', String(e))
    }
  }

  // A Mailchimp hiccup never stops the sign-up itself: the address is always safely saved here.
  return json({ ok: true, mailchimp })
})
