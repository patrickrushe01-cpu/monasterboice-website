# Monasterboice Parish Website

React + Vite + Supabase. Matches the approved photo-led design.

## Local development
```
npm install
npm run dev
```

## Supabase
Project: monasterboice-parish (eu-west-1)
URL: https://vkuedrqdpixdzlnpskzl.supabase.co
Tables: news_posts, bulletins, contact_messages (schema in supabase/schema.sql)
Storage bucket: parish-media (public read, admin write)

### Create an admin login (for you / Ann / Rosey)
Supabase dashboard → Authentication → Users → Add user.
Set an email + password for each person who'll post news/bulletins.
They log in at yoursite.com/admin

## Deploy
This is a static Vite build — deploy the `dist/` folder to Vercel (or any static host).
Set these environment variables in Vercel:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
(values in .env — do not commit .env to git)

Once deployed, point monasterboiceparish.com's DNS (in the WordPress.com dashboard)
at the new Vercel deployment.
