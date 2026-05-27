# AFORA by Sidra Shahzad

A luxury skincare e-commerce store built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Animations:** Framer Motion
- **Emails:** EmailJS
- **Deployment:** Netlify

## Features

### Customer Side
- 6-step facial ritual products + bundle
- Product browsing with category filters & sorting
- Cart with promo code support, wishlist
- Checkout with COD (PKR 250 delivery, free over 5,000)
- Order tracking & history, verified-purchase reviews
- Contact form, FAQ, About page
- Fully responsive with mobile bottom navigation

### Admin Side
- Dashboard with analytics
- Products CRUD with image upload & ingredients
- Categories, Bundles, Orders, Users, Reviews, Promo Codes, FAQs, Settings

## Setup
1. Fill `.env.local` with your keys
2. Run `supabase-schema.sql` in Supabase SQL editor
3. Set up EmailJS templates (see `EMAILJS_TEMPLATES.md`)
4. `npm install && npm run dev`
