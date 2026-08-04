# Usman Dental Studio — Dental Clinic Landing Page

**CloudExify Web Dev Internship — Month 2, Project 3**

- **Name:** Muhammad Usman Dastgir
- **Registration Number:** CX-INT-2026-GEN-541
- **Build Track Chosen:** Luxury Dental (dark premium background, gold accents, elegant serif headings)
- **Signature Feature(s) Implemented:**
  1. Animated Stats Counter — counts up on scroll via `IntersectionObserver` (required signature feature)
  2. FAQ Accordion — Bootstrap accordion, one item open at a time
  3. Appointment Booking Modal — full client-side form validation (name, phone, email, date, time, service)
  4. Before & After Draggable Comparison Slider — bonus signature feature, pointer-drag + range input, keyboard accessible
- **Live Vercel Link:** _add after deploying, https://usman-dental-store.vercel.app/

## Tech Stack

HTML5, CSS3 (custom design system, no framework overrides beyond Bootstrap grid/components), Vanilla JavaScript, Bootstrap 5.3, Bootstrap Icons, Google Fonts (Playfair Display + Inter).

## Project Structure

```
dental-clinic/
├── index.html
├── admin.html
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── script.js
│   ├── admin.js
│   └── supabase-config.js
├── supabase/
│   └── schema.sql
├── assets/
└── README.md
```

## Backend: Supabase

The appointment modal on `index.html` writes directly to a Supabase table, and `admin.html` is a
password-protected dashboard for staff to review, confirm, cancel, or delete requests.

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → **New Project** (free tier is enough).

### 2. Run the schema
Open **SQL Editor** in your Supabase project and run `supabase/schema.sql`. This creates the
`appointments` table and locks it down with Row Level Security:
- The public can only **insert** (submit the booking form).
- Only a logged-in admin can **view, update, or delete** rows.

### 3. Create your admin login
Go to **Authentication → Users → Add user** and create yourself an email + password. This is the
only way to sign in to `admin.html` — there's no public sign-up form.

### 4. Connect the site to your project
Open `js/supabase-config.js` and replace the two placeholders with the values from
**Project Settings → API** in your Supabase dashboard:

```js
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```

The anon key is safe to expose in client-side code — Row Level Security is what actually protects
the data, not keeping this key secret.

### 5. (Optional) Turn on realtime
So the admin dashboard live-refreshes when a new request comes in: **Database → Replication** →
toggle on the `appointments` table.

### Admin dashboard (`admin.html`)
- Sign in with the email/password you created in step 3
- See totals for pending / confirmed / cancelled requests
- Filter the list by status
- Change a request's status from the dropdown in each row
- Delete a request
- List refreshes automatically if realtime is enabled (step 5), or click **Refresh**

`admin.html` has `<meta name="robots" content="noindex, nofollow">` so it won't be indexed, but
it's still publicly reachable at `/admin.html` on Vercel — the login screen and RLS policies are
what actually protect the data, not the URL being unlisted.

## Sections Implemented

1. Sticky navbar with logo, nav links, and Book Appointment CTA
2. Hero with fade-in animation and dual CTAs
3. Services grid — 6 cards (General Cleaning, Whitening, Braces & Aligners, Root Canal, Implants, Veneers)
4. Animated stats counter (500+ patients, 15+ years, 98% satisfaction, 12 specialists)
5. About section — studio story/values + doctor profile card with certifications
6. Before & After draggable comparison slider
7. Testimonials carousel — 6 patients across 2 slides, star ratings, treatment type
8. Pricing — 3 tiers (Essential, Signature "Most Popular", Bespoke)
9. FAQ accordion — 7 questions, single-open behavior
10. Appointment booking modal with full JS validation
11. Contact section (address, phone, email, embedded Google Map) + footer

## Notes

- No backend — the appointment form validates and shows a confirmation message client-side only, per spec.
- Images are placeholder stock photography (Unsplash) styled with a grayscale/duotone filter to match the Luxury Dental palette; swap for real clinic photography before production use.
- Deploy as a static site on Vercel — Framework Preset: **Other**, no build command required.

## Deployment Steps

1. Push this folder to a GitHub repository named `cloudexify-web-p3-usman`
2. Go to vercel.com → **Add New Project** → import the repository
3. Framework preset: **Other** (static site)
4. Deploy — copy the live `.vercel.app` link into this README and your submission message
5. Add at least 2 screenshots (desktop + mobile) to the repo before submitting
