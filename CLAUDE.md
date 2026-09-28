# Monasterboice Parish Website

React + Vite + Supabase site for Monasterboice Parish (Tenure & Fieldstown, Co. Louth, Ireland),
replacing an old WordPress.com site. Deployed on Vercel, currently live at
https://monasterboice-website.vercel.app — the real domain (monasterboiceparish.com) still points
at WordPress and will be switched over later, once content is finalized.

## Stack & structure
- React 18 + Vite 5 + react-router-dom 6, plain inline styles (no CSS framework)
- `src/pages/` — Home, News, Bulletins, Sacraments, Contact, Admin, AdminLogin, ResetPassword, NotFound
- `src/components/` — Nav.jsx, Footer.jsx (shared across all pages)
- `src/styles/global.css` — small shared stylesheet (buttons, nav links, cards)
- `src/lib/supabaseClient.js` — has hardcoded fallback URL/anon key so it works without a .env file

## Supabase
- Project: `monasterboice-parish`, project_id `vkuedrqdpixdzlnpskzl`
- Tables: `news_posts`, `bulletins` (4-week rolling window, auto-expires on query), `contact_messages`
- Storage bucket: `parish-media` (public read, authenticated write)
- Auth: email/password login at `/admin/login`, reset flow at `/admin/reset`
- RLS: public read on content tables, authenticated-only write/delete

## Design language
- Warm off-white/cream background, accent orange `var(--accent)` (#C1622E), near-black ink text
- Manrope font, generous whitespace, rounded cards (16–20px radius), soft shadows
- Two churches: full formal names are:
  - "The Church of The Immaculate Conception, Tenure (TEN)"
  - "The Church of The Nativity of Our Lady, Fieldstown (F/T)"
  - Short form "Tenure (TEN)" / "Fieldstown (F/T)" for compact contexts (mass times etc.)

## In-page editing (WYSIWYG)
- Signed-in staff see an "Edit this page" button (bottom right). Text becomes clickable; photos get "Change photo".
- Edits are saved to the Supabase table `site_content` (key = element id, value = text or image URL) and override
  the defaults written in the code. Public visitors only ever read; only authenticated users can write (RLS).
- Core code is `src/lib/content.jsx`: `<Editable id="..." def="...">` for text, `<EditableImg>` / `<ChangePhoto>` for photos,
  `<SmartLink>` for links that must not navigate while editing. The homepage quote band is stored as JSON under `home.quotes`.
- `<LinkButton id="..." def="https://...">` is a button whose web address (or an uploaded PDF) can be changed while editing;
  it hides itself from visitors if no address is set. `<EditableLines>` edits a list as one-item-per-line text.
- To make NEW text editable, wrap it in `<Editable>` with a unique id and the current wording as `def`.
  Layout/structure changes still need code.

## Support Us page (`/support`)
- Ways to give (envelopes, online giving via the Archdiocese of Armagh Payzone link, bank transfer, legacies), Charitable
  Donation Scheme / CHY3 tax relief, parish accounts, fees & charges (amounts deliberately NOT stated — "contact the Parish Office"),
  Parish Finance Council members, and finance enquiries.
- Parish accounts PDFs live in the `parish_accounts` table (year + file_url), uploaded from the Admin page; latest year is featured.
- `vercel.json` redirects old WordPress addresses (/support-the-parish, /contact-us, /parish-bulletin, /latest-news, /welcome).

## Deployment workflow
- GitHub repo: patrickrushe01-cpu/monasterboice-website, connected to Vercel for auto-deploy on push to `main`
- Standard flow: edit files → `npm run build` to confirm no errors → `git add . && git commit -m "..." && git push`
- Vercel auto-redeploys on push; check the Deployments tab at vercel.com to confirm

## Known housekeeping
- `.gitignore` should cover `node_modules`, `dist`, `.env`, `.env.local`, `.DS_Store` — if `.DS_Store`
  files ever get committed, just `git rm --cached` them and make sure they're in `.gitignore`
- Paddy (the parish priest, real name Fr. Paddy Rushe) is non-technical — prefer plain explanations,
  confirm before anything destructive (force-push, delete, drop table), and always verify a build
  succeeds before considering a task done

## Content status (as of this session)
- Home, Sacraments, Contact copy is real parish content, reviewed by Paddy
- Quote band on homepage is a placeholder rotation (2-3 Scripture/saint quotes) — Paddy will supply
  the real set plus more parish-life photos to rotate through
- News section seeded with the 6 real posts from the live WordPress site
