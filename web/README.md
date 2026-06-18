# ✦ Tet Studio

> A few words in. A perfect prompt out.

Tet turns a quick idea into a structured, paste-ready creative brief for
**photo, video, music, art and poetry** — with a realtime community feed, full
auth, a personal library, and an admin dashboard.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Realtime + RLS) ·
Clerk (auth) · shadcn/ui · Tailwind v4 · TypeScript.

---

## 🚀 Copy-paste & live in 4 minutes

You'll need three free accounts: [Clerk](https://clerk.com),
[Supabase](https://supabase.com), [Vercel](https://vercel.com).

### 1 · Supabase (≈90s)

1. Create a new project.
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2 · Clerk (≈90s)

1. Create an application (Email + Google is a great default).
2. **API Keys** → copy the Publishable key and Secret key.
3. **Configure → Sign-in & Sign-up** is fine on defaults.
4. Connect Clerk to Supabase (the modern, zero-JWT-template way):
   - In **Supabase → Authentication → Sign In / Providers → Third-Party Auth**,
     add **Clerk** and paste your Clerk **Frontend API / domain**
     (Clerk shows the exact value under *Connect with Supabase*).
   - That's it — Supabase now trusts Clerk session tokens and RLS reads
     `auth.jwt() ->> 'sub'`.

### 3 · Run it

```bash
cd web
cp .env.example .env.local      # paste your keys
npm install
npm run dev                     # → http://localhost:3000
```

Open the app, sign up, and you're in the studio. 🎉

### 4 · Deploy (≈60s)

```bash
# from the repo root, or set "Root Directory = web" in the Vercel UI
vercel --cwd web
```

Add the same `.env.local` variables in **Vercel → Settings → Environment
Variables**, then redeploy. Done.

---

## 🔔 Optional: auto-create profiles on sign-up

The app already creates a profile row lazily on first load, so this is optional.
For instant sync:

1. **Clerk → Webhooks → Add Endpoint** → `https://YOUR_DOMAIN/api/webhooks/clerk`
2. Subscribe to `user.created`, `user.updated`, `user.deleted`.
3. Copy the **Signing Secret** → `CLERK_WEBHOOK_SIGNING_SECRET`.

## 👑 Admin access

Put your email in `ADMIN_EMAILS` (comma-separated). On next sign-in your
profile is promoted to `admin` and `/admin` unlocks — live stats, recent
prompts, and recent creators.

---

## 🧠 How it fits together

| Layer        | Where                                                        |
| ------------ | ----------------------------------------------------------- |
| Prompt brain | `src/lib/prompt-engine.ts` — pure, typed, runs anywhere      |
| Auth         | `src/middleware.ts` + Clerk components                       |
| DB access    | `src/lib/supabase/{server,client,admin}.ts`                  |
| Realtime     | `src/components/community-feed.tsx` (Supabase channels)      |
| Security     | Postgres **RLS** in `supabase/schema.sql` — public is opt-in |
| API          | `src/app/api/**` (prompts CRUD, likes RPC, onboarding, hook) |

### Scripts

```bash
npm run dev        # local dev
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

Made with joy. It just works. ✦
