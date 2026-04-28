# 📋 ChainSight Pre-Submission Checklist

Ensure all items are verified before the final hackathon submission.

## 🗄️ Database (Supabase)
- [ ] Supabase project created.
- [ ] SQL schema migrated (`supabase/migrations/001_initial_schema.sql` applied).
- [ ] Row Level Security (RLS) enabled on all tables.
- [ ] Realtime replication enabled for `shipments`, `disruption_alerts`, and `metrics_snapshots`.

## ⚙️ Backend (Railway)
- [ ] `RAILWAY_ENVIRONMENT` set to `production`.
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` verified.
- [ ] `GEMINI_API_KEY` active and quota available.
- [ ] `FRONTEND_URL` points to the final Vercel deployment URL.
- [ ] `/health` endpoint returns `{"status": "healthy", "supabase": true}`.

## 🌐 Frontend (Vercel)
- [ ] `VITE_API_BASE_URL` points to the Railway deployment (ending in `/api`).
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` verified.
- [ ] Deployment root directory set to `frontend`.
- [ ] Navigation works (Dashboard -> Analytics -> Shipments -> Disruptions).
- [ ] No mixed-content (HTTP/HTTPS) errors in console.

## 🧪 Quality & CI/CD
- [ ] `pytest backend/tests/` passing locally.
- [ ] GitHub Actions showing green for both `lint` and `test` jobs.
- [ ] `.gitignore` properly excludes all `.env` files.

## 🎁 Submission Package
- [ ] `README.md` updated with architecture and tech stack.
- [ ] Demo video (mp4/YouTube link) prepared.
- [ ] Code pushed to `main` branch.
- [ ] Prototype deck PDF attached to the hackathon portal.

## 🎭 Demo & Polish
- [ ] Demo controls page accessible at `/demo-controls` with PIN `2026`.
- [ ] "Trigger Critical Alert" button causes visible real-time update on Dashboard in < 3 seconds.
- [ ] "Simulate Route Optimization" button generates 3 distinct AI recommendations.
- [ ] LoadingScreen appears and disappears cleanly on first load.
- [ ] No console errors in production build.
- [ ] PWA manifest valid (check with Chrome DevTools > Application).
- [ ] ErrorBoundary tested: forced render error results in graceful fallback UI.

---
**Hackathon:** Build with AI 2026  
**Team:** Prompt Warrior  
**Deadline:** April 30, 2026
