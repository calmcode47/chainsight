# ChainSight — AI-Powered Supply Chain Intelligence 🛰️

> **Real-time disruption detection and autonomous route optimization powered by Google Gemini 1.5 Flash.**

[![React](https://img.shields.io/badge/Frontend-React%2018-blue)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-emerald)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-orange)](https://deepmind.google/technologies/gemini/)
[![Firebase](https://img.shields.io/badge/Deploy-Firebase-yellow)](https://firebase.google.com/)
[![GCP](https://img.shields.io/badge/Deploy-Cloud%20Run-blue)](https://cloud.google.com/run)

## 🔗 Live Demo & Links
- **Production URL:** [https://projects-a1f07.web.app](https://projects-a1f07.web.app)
- **Backend API:** [https://chainsight-backend-783471324229.asia-south1.run.app/health](https://chainsight-backend-783471324229.asia-south1.run.app/health)
- **API Docs:** [https://chainsight-backend-783471324229.asia-south1.run.app/docs](https://chainsight-backend-783471324229.asia-south1.run.app/docs)

## 📊 Project Status (v1.2)
- ✅ **Production Live**: Frontend deployed on Firebase, Backend on Google Cloud Run.
- ✅ **AI Fault Tolerance**: Implemented a "Smart Heuristic" fallback engine to ensure the Assistant remains functional during Gemini API quota exhaustion.
- ✅ **Guest Mode**: Demonstration access enabled for judges via "Enter as Guest" on the login page.

---

## 🛑 The Problem
Modern supply chains are vulnerable to unpredictable disruptions—weather, port strikes, and infrastructure failures. Manual monitoring is slow, error-prone, and reactive, leading to millions in lost revenue and increased carbon footprints due to inefficient re-routing.

## ✅ The Solution
ChainSight leverages **Gemini 1.5 Flash** to autonomously detect risk patterns across global shipments. It provides real-time visibility through a high-performance React dashboard and recommends optimized alternative routes that balance time, cost, and risk reduction.

---

## 🏗️ Architecture
```text
[ Global Shipments ] --> [ Supabase (PostgreSQL) ] <--> [ FastAPI Backend ]
                                  ^                         |
                                  |                         v
[ Live Notifications ] <--- [ Real-time Sub ] <--- [ Gemini 1.5 AI Service ]
                                  |                         |
                                  v                         v
                          [ React Frontend ] <---- [ Recharts Analytics ]
```

---

## ✨ Key Features
- 🔴 **Real-Time Disruption Detection**: Event-driven alerts with severity scoring.
- 🗺️ **Interactive Logistics Map**: Live tracking with animated shipment vectors.
- 🧠 **AI Route Optimization**: Alternative route generation with natural language reasoning.
- 📊 **Historical Analytics**: 7-day trend analysis for supply chain health and efficiency.
- 💬 **Supply Chain Assistant**: Natural language query interface for inventory and logistics status.
- ⚡ **Autonomous Simulation**: Background workers simulate real-world disruptions for demo resilience.

---

## 🛠️ Tech Stack
| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts, Lucide |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| **Database** | Supabase (PostgreSQL) + Realtime Subscriptions |
| **AI Engine** | Google Gemini 1.5 Flash (via Generative AI SDK) |
| **CI/CD** | GitHub Actions (Linting, Testing, Building) |
| **Hosting** | Vercel (Frontend), Railway (Backend) |

---

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Supabase Project
- Gemini API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.development
# Edit .env.development
npm run dev
```

---

## 🚢 Deployment Guide

### Railway (Backend)
1. Create a new Project on Railway.
2. Connect your GitHub repository and select the `backend` directory as root.
3. Add the following Environment Variables:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, `FRONTEND_URL`, `RAILWAY_ENVIRONMENT=production`

### Vercel (Frontend)
1. Create a new Project on Vercel.
2. Connect your GitHub repository and select the `frontend` directory as root.
3. Add the following Environment Variable:
   - `VITE_API_BASE_URL` (Pointing to your Railway URL + /api)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 🧪 Testing
```bash
cd backend
pytest tests/ -v
```

---

## 👥 Team
**Team Prompt Warrior**  
- **Lead Developer:** Mayank Joshi  
- **Submission:** Build with AI 2026 Hackathon (hack2skill.com)

---
**License:** [MIT](LICENSE)
