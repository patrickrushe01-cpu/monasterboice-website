// Helpers shared by the news pages
export const postPath = post => (post && post.slug ? `/news/${post.slug}` : '/news')

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Date-only values are shown in UTC so the day never shifts for viewers in other time zones
export const formatDate = d =>
  d ? new Date(d).toLocaleDateString('en-IE', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }) : ''
