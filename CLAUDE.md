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
- Revenue's blank donor forms live in `public/forms/` (CHY3 enduring certificate = 5 years, CHY4 annual certificate = 1 year) and are linked from
  the tax-relief section via `<LinkButton>` defaults in `SupportUs.jsx`. Staff can swap a form for a newer PDF in Edit mode (Upload a PDF instead).
  The tax-relief maths on the page follows Revenue's own worked example: gifts are grossed up at 31% (€1,000 counts as €1,449.27, i.e. about +45%).
- Parish accounts PDFs live in the `parish_accounts` table (year + file_url), uploaded from the Admin page; latest year is featured.
- `vercel.json` redirects old WordPress addresses (/support-the-parish, /contact-us, /parish-bulletin, /latest-news, /welcome).

## Webcam (`/webcam`) and bulletins
- Live streaming is hosted by Church Services TV (https://www.churchservices.tv/monasterboice); /webcam links to it (editable via LinkButton).
- Bulletins page shows this week's bulletin plus the four before it (five most recent by `issue_date`), not a date window.
- Date-only values (issue_date, published_at) must be displayed with `timeZone: 'UTC'`, otherwise viewers in the Americas see the wrong day.

## News stories, resources and email sign-up
- All 98 old WordPress stories (2019–2026) were imported into `news_posts` with full text (`body`, simple Markdown), a `slug`,
  a `category`, and their photos/PDFs copied into the `parish-media` bucket (`news/<wp-post-id>/…`). Each story lives at `/news/:slug`
  (lazy-loaded page, `src/pages/NewsArticle.jsx`, rendered by `src/components/ArticleBody.jsx` using react-markdown — never raw HTML).
- Old WordPress permalinks (`/YYYY/MM/DD/slug`) redirect to `/news/slug` via `vercel.json`. `/wp-content/*` (old media links) redirects to
  the original WordPress.com site — so keep that WordPress.com site alive (don't delete it) for old media links to work.
- Admin can add, edit (with preview) and delete stories. Two 2021 videos were too large (>15MB) to copy and still point at the old WordPress site.
- `/resources` is an editable list (`Name | https://address | Description`, one per line) using `<EditableLines>`.
- The bulletin email sign-up calls the `subscribe_to_bulletin` database function (the table is not readable by the public). Admin lists,
  exports (CSV) and bulk-adds subscribers. Sending the weekly email is done outside the site (e.g. Mailchimp) using the exported list.
- Date-only values are shown in UTC so the day never shifts for viewers abroad.

## Phone / responsive layout
- `--pad` (CSS var) is the shared side margin (64px desktop, shrinking on smaller screens) — used instead of hard-coded 64px everywhere.
- Under 1100px the top menu collapses into a "Menu" button (`.site-burger`) opening a full-width panel (`Nav.jsx`); above that it's the normal inline links.
- Layout classes that change at breakpoints: `.split` (photo+text sections stack), `.mass-grid`/`.mass-mid` (Mass times card), `.stats` (the four figures, 2x2 on phones),
  `.grid-3`/`.grid-2`/`.grid-2-sm`, `.quote-band`, `.enq-box`. Add a class rather than inline breakpoint logic when a new section needs to reflow.
- Home page hero: `hero-both-churches.jpg` (desktop, landscape) vs `hero-both-churches-mobile.jpg` (phones, Tenure over Fieldstown, portrait) —
  swapped via `useMediaQuery('(max-width: 700px)')` in `src/lib/useMediaQuery.js`. A photo chosen in Edit mode overrides both.
- Checked with a headless-browser script (not checked in) at 320/360/390/768/1024/1440px on every public page: no horizontal overflow anywhere.

## Contact form messages
- The Contact page saves to `contact_messages` (the public can only INSERT; only signed-in staff can read/delete). Admin has a **Messages** section at the top
  listing them newest-first with "Reply by email" (the address is URL-encoded so a crafted address can't add recipients) and Delete. Nothing emails the office yet:
  add an email alert after the domain switch (needs the sending domain verified in an email service such as Resend; DNS lives at WordPress.com).
- Spam protection: hidden honeypot field in the form, input length limits (120/254/200/4000) mirrored by database CHECK constraints.

## Deployment workflow
- GitHub repo: patrickrushe01-cpu/monasterboice-website, connected to Vercel for auto-deploy on push to `main`
- After pulling changes that touch package.json run `npm install`.
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
