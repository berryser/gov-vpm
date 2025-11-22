## gov-vpm - Vendor Performance Manager (Server + Client)

Features:
- Dashboard with vendor list, risk filters, and risk distribution chart
- Vendor detail with evaluations, AI score suggestions (Gemini), Executive Brief, What‑if analysis, policy check, and risk explanation
- Compare page: AI recommendation between two vendors
- SQLite via better-sqlite3, Express API, Vite + React client, Tailwind v4

---

## Local Development

1) Server
```bash
cd server
npm install
npm run seed      # seed demo data (optional)
npm run dev       # starts on :4000
```
Env vars in `server` (create `.env`):
```
GEMINI_API_KEY=your_key_here
# Optional:
DB_PATH=./vpm.db
# Set in prod to lock CORS to your client:
CLIENT_ORIGIN=http://localhost:5173
```

2) Client
```bash
cd client
npm install
# optional: set API URL in .env.local
# VITE_API_URL=http://localhost:4000
npm run dev       # opens on :5173/5174
```

---

## Deployment

### API (Render)
Recommended: Render Web Service using the provided `render.yaml`.
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js` (first deploy you can seed locally or run once)
- Environment Variables:
  - `GEMINI_API_KEY` (required)
  - `DB_PATH=./vpm.db` (optional)
  - `CLIENT_ORIGIN=https://<your-client-domain>` (recommended)
Your server listens on the port Render provides (we use `process.env.PORT`).

Alternatively deploy to Railway/Fly with the same commands/envs.

### Client (Vercel or Netlify)
Vercel:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable:
  - `VITE_API_URL=https://<your-api-domain>`

Netlify:
- `netlify.toml` (optional)
  - Build Command: `npm run build`
  - Publish Directory: `dist`
- Env: `VITE_API_URL=https://<your-api-domain>`

After deploy, open the client URL and verify:
- Dashboard lists seeded vendors
- Detail page AI actions return responses
- Compare page returns a recommendation

---

## API Routes Summary
- `GET /api/vendors` → list vendors with avg_score and risk
- `GET /api/vendors/:id` → vendor + evaluations
- `POST /api/vendors` → create vendor
- `POST /api/vendors/:id/evaluations` → add evaluation

AI:
- `POST /api/ai/suggest-score` → fills form fields
- `POST /api/ai/recommend-vendor` → compare 2 vendors
- `POST /api/ai/executive-brief` → exec summary for vendor
- `POST /api/ai/what-if` → explain changes under weights
- `POST /api/ai/risk-explain` → explain anomalies/trends
- `POST /api/ai/policy-check` → compliant vs needs review

---

## Production Tips
- Set `CLIENT_ORIGIN` on the server to your client URL to restrict CORS
- Use the included simple rate limit on `/api/ai/*`
- Do not commit `.env` files
- For stable demo data, run `npm run seed` locally before your final build or once on your live DB, then keep `start` as `node index.js`

---

## Troubleshooting
- 500 errors from AI: check `GEMINI_API_KEY` server env; ensure model name is valid
- Client cannot reach API: verify `VITE_API_URL` and CORS `CLIENT_ORIGIN`
- Blank screen: open browser console; ensure all pages export default components and routes exist

