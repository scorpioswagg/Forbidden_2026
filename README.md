# Forbidden 2026

## Deployment checklist (Vercel + Supabase)

1. **Create the Supabase project**
   - Enable email/password auth.
   - Configure Storage buckets: `vault` (private) and `posts` (private).

2. **Set Vercel environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY` (Resend test key for dev)
   - `RESEND_FROM_EMAIL` (e.g. `Forbidden 2026 <no-reply@yourdomain.com>`)
   - `SUPER_ADMIN_EMAILS` (comma-separated list of super admin emails)

3. **Supabase redirect URLs**
   - Add these in **Authentication → URL Configuration**:
     - `https://your-vercel-domain.vercel.app/auth/login`
     - `https://your-vercel-domain.vercel.app/auth/signup`
     - `https://your-vercel-domain.vercel.app/auth/reset`
     - `https://your-vercel-domain.vercel.app/onboarding`
     - `http://localhost:3000/auth/login`
     - `http://localhost:3000/auth/signup`
     - `http://localhost:3000/auth/reset`
     - `http://localhost:3000/onboarding`

4. **Run SQL migrations**
   - Execute `schema.sql`, then `rls.sql`, then `seed.sql` in the Supabase SQL editor.

5. **Verify admin access**
   - Log in with a `SUPER_ADMIN_EMAILS` account to promote it to `super_admin`.
   - Confirm `/admin` is accessible.

6. **Send test emails (dev)**
   - POST to `/api/emails/test` with JSON body `{"email":"you@example.com"}`.
   - The endpoint uses the Resend test key to send the welcome email.

## Local development

```bash
npm install
npm run dev
```

If you cannot install dependencies due to registry restrictions, rely on CI or a local
machine with npm access.
