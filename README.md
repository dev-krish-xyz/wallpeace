# Wallpeace

A small, curated library of original desktop wallpapers, previewed on a 3D MacBook.

Next.js 15 · Tailwind v4 · React Three Fiber · Supabase (Postgres, Storage, Auth) · Vercel

## Setup

1. **Create a Supabase project** in the same region you'll deploy Vercel functions to.
2. **Apply the schema.** Run `supabase/migrations/0001_init.sql` in the SQL editor, or `npx supabase link && npx supabase db push`.
   It creates the `wallpapers` table, the `admins` allowlist, RLS policies and the public `wallpapers` storage bucket.
3. **Lock down auth.** Public signups are disabled via `supabase/config.toml` (`npx supabase config push`).
   Create the admin user once (Authentication → Users → Add user, auto-confirm), then allow it:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
4. **Env.** `cp .env.example .env.local`, fill in the Supabase URL, publishable key and `ADMIN_EMAIL`.
5. **Password.** `npm run admin:password` (prompts, hidden input, min 12 characters).
6. `npm run dev` → sign in at `/admin/login` with username `admin`.

## Deploy

Import the repo in Vercel, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_USERNAME` and `ADMIN_EMAIL`, deploy.
No service-role key is needed: every write runs as the signed-in admin and is enforced by RLS.

## How it works

- **Gallery `/`** and **detail `/w/[slug]`** are statically rendered from one cached query (tag `wallpapers`), revalidated whenever the admin publishes, renames, features or deletes.
- **Storage layout:** `wallpapers/{id}/original.*` (download), `display.webp` (2560w, gallery via `next/image`), `screen.webp` (2560×1600 cover crop, 3D screen texture).
- **Upload:** the browser sends the original straight to Storage via a signed URL, then a server action validates it with sharp, renders the derivatives and a blur placeholder, and inserts the row.
- **3D MacBook** is ["Macbook pro 16 silver" by sugcx](https://sketchfab.com/3d-models/macbook-pro-16-silver-3a53a9dba68f45a48f4fd216fb43ca02) (CC BY 4.0, credited on the site).
  `node scripts/optimize-model.mjs <source.glb>` rebuilds `public/models/macbook-pro-16.glb` (8.1 MB → 1.6 MB: meshopt geometry, WebP textures, baked screen texture removed).
  At runtime the `ScreenImage` mesh gets the wallpaper shader and a glass dock, and the lid swings open on a hinge pivot. A flat CSS laptop paints first and remains as the fallback without WebGL.
