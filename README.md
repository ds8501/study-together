# Study Together

A shared study workspace with separate roadmaps for each member. The frontend is a Next.js app and the API and PostgreSQL setup live in [`study-together-BE`](../study-together-BE).

## Local development

Start PostgreSQL and the API using the steps in the backend README. Then run the frontend:

```bash
pnpm install
pnpm dev
```

The frontend calls `http://localhost:4000` by default. Set `NEXT_PUBLIC_API_URL` in `.env.local` to override it. Create an account to start a workspace, then share its invite code so one other person can register into that workspace. Each member owns a separate roadmap.
