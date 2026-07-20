# japi — Johann Adolf Pengel Airport chatbot

Monorepo for the airport's AI chatbot and public information site.

| Directory | Stack | Role |
|---|---|---|
| `airport-chatbot-backend/` | Express, TypeScript, Mongoose, OpenAI | REST API, admin auth, chat |
| `airport-chatbot-frontend/` | Next.js 16, React 19, Tailwind v4 | Public site + admin UI |

The frontend is entirely client-rendered — no API routes, no server-side data fetching. All data flows through `lib/api.ts` to the backend over `NEXT_PUBLIC_API_URL`.

## Local development

Run both, in separate terminals:

```bash
# backend → http://localhost:5000
cd airport-chatbot-backend
npm install
cp .env.example .env      # then fill in real values
npm run dev

# frontend → http://localhost:3000
cd airport-chatbot-frontend
npm install
npm run dev
```

`airport-chatbot-frontend/.env.local` points at the backend for local work:

```
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## Environment variables

Backend (`airport-chatbot-backend/.env`, never committed — see `.env.example`):

| Variable | Notes |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | Server-side only; never exposed to the browser |
| `JWT_SECRET` | **Required** — startup throws without it, so admin tokens can't be forged against a default |
| `CORS_ORIGIN` | Exact origin of the deployed frontend, scheme included |
| `PORT` | Defaults to `5000`; hosts that inject `PORT` work unmodified |
| `NODE_ENV`, `LOG_LEVEL` | Optional |

Frontend:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Inlined at **build time**, not read at runtime |

## Deployment

The two halves deploy to different places, because Hostinger shared/cloud hosting is LiteSpeed + PHP with no Node runtime — it can serve the static frontend but cannot run the backend.

### Frontend → Hostinger `public_html`

`next.config.ts` sets `output: "export"`, so `next build` emits a static `out/` directory.

```bash
cd airport-chatbot-frontend
NEXT_PUBLIC_API_URL=https://<your-backend-host> npm run build
```

Upload the **contents** of `out/` to `public_html`. Add `public_html/.htaccess`:

```apache
ErrorDocument 404 /404.html
```

Because `NEXT_PUBLIC_API_URL` is baked in at build time, changing the backend URL requires a rebuild and re-upload.

### Backend → any Node host (Render, Railway, Fly, or a VPS)

| Setting | Value |
|---|---|
| Root directory | `airport-chatbot-backend` |
| Build | `npm install && npm run build` |
| Start | `npm start` |

Set the environment variables above in the host's dashboard. On MongoDB Atlas, allow `0.0.0.0/0` under Network Access if the host has no static egress IP.

Two things to watch:

- The frontend is served over HTTPS, so the backend URL **must** also be HTTPS — browsers block mixed content and every API call would fail.
- `CORS_ORIGIN` must match the frontend origin exactly. A mismatch shows up as a CORS error in DevTools, not a server error.
- `src/utils/logger.ts` writes `error.log` and `combined.log` to the working directory. On hosts with ephemeral filesystems these vanish on redeploy; use the platform's log stream instead.
# japi
