# ChainSight — AI-Powered Supply Chain Disruption Intelligence

![React](https://img.shields.io/badge/Frontend-React%2018-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%201.5-4285F4?style=flat-square&logo=google-gemini)
![Hackathon](https://img.shields.io/badge/Hackathon-Build%20with%20AI%202026-FFD700?style=flat-square)
![Team](https://img.shields.io/badge/Team-Prompt%20Warrior-red?style=flat-square)

## 📌 Problem Statement
Global supply chains are increasingly vulnerable to unpredictable disruptions like port congestion, extreme weather, and geopolitical shifts. Traditional tracking systems are reactive, leaving logistics managers to deal with cascading delays and rising costs after a bottleneck has already formed.

## 🚀 Solution Overview
ChainSight is a production-ready intelligence platform that transforms supply chain management from reactive to proactive. By combining real-time data ingestion with **Google Gemini 1.5 Flash**, the platform detects disruption patterns early, predicts their impact on specific shipments, and generates optimized alternate routes with natural language reasoning. ChainSight provides a "command center" experience that enables managers to resolve complex logistics crises in seconds rather than days.

## ✨ Key Features
- 🔴 **Real-time Disruption Detection**: Automated scanning of global fleet data with severity scoring (Critical to Low).
- 🧠 **Gemini AI Route Optimization**: Dynamic reroute recommendations with structured comparison of time, cost, and risk metrics.
- 🗺️ **Live World Map**: Stylized high-tech visualization with animated route flows and pulsing location nodes.
- 💬 **AI Command Assistant**: A natural language chat interface to query fleet health and performance metrics instantly.
- 📊 **Intelligent KPI Dashboard**: Real-time monitoring of "Cost Saved Today," "On-Time %," and "Active Risks."
- ⚡ **Batch Recovery**: Single-click computational pass to optimize all at-risk shipments simultaneously.

## 🏗️ Architecture
```text
┌────────────────┐      ┌───────────────────────────┐      ┌───────────────────────┐
│  React Frontend│ ────▶│      FastAPI Backend      │ ────▶│   Google Gemini AI    │
│ (Vite + TS)    │      │ (Business Logic & Routes) │      │  (Analysis & Reason)  │
└────────────────┘      └─────────────┬─────────────┘      └───────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │     Mock Data Engine      │
                        │ (Deterministic Simulation)│
                        └───────────────────────────┘
```

## 🛠️ Tech Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| **AI/ML** | Google Gemini 1.5 Flash (via `google-generativeai` SDK) |
| **State/Data** | React Hooks, Axios, Deterministic Mock Engine |

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey) (Gemini API)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=8000
   ```
5. Start the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Documentation

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/shipments` | Retrieve all shipments with current status and metrics. |
| `GET` | `/api/metrics` | Fetch global supply chain performance KPIs. |
| `GET` | `/api/disruptions` | List all active disruption alerts detected by the system. |
| `POST` | `/api/disruptions/analyze` | Trigger Gemini AI to identify top 5 risks across the fleet. |
| `POST` | `/api/optimizer/{id}` | Generate a Gemini-optimized alternate route for a specific shipment. |
| `POST` | `/api/assistant/chat` | Query the AI assistant with natural language context. |
| `WS` | `/ws/alerts` | Real-time WebSocket feed for live disruption updates. |

## 📸 Screenshots
Visual demonstrations of the Dashboard, Optimizer, and AI Assistant are available in the `/demo` folder.

## 👥 Team: Prompt Warrior
- **Mayank Joshi** — Lead Full-Stack & AI Engineer

## 📄 License
This project is licensed under the MIT License.
