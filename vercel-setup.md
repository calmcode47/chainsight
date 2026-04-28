# Vercel Deployment Guide for ChainSight Frontend

Follow these steps to deploy the ChainSight React frontend to Vercel and connect it to your Railway backend.

## 1. Initial Setup
1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
3.  Import your `chainsight` repository.

## 2. Project Configuration
In the **"Configure Project"** screen:
- **Project Name:** `chainsight-frontend`
- **Framework Preset:** `Vite`
- **Root Directory:** Click "Edit" and select the `frontend` folder.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## 3. Environment Variables
Add the following variable in the **"Environment Variables"** section:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend-url.railway.app/api` |

*Note: Ensure the URL ends with `/api` to match the backend router configuration.*

## 4. Security & Routing
The project includes a `vercel.json` file in the `frontend` directory. Vercel will automatically detect this and apply:
- **SPA Rewrites:** All routes will correctly point to `index.html`.
- **Security Headers:** Prevents clickjacking and MIME-type sniffing.
- **Caching:** Optimized caching for static assets in the `/assets` folder.

## 5. Redeployment
Whenever you update your backend URL or deployment environment:
1.  Go to the Project Settings in Vercel.
2.  Update the `VITE_API_BASE_URL` value.
3.  Go to the **"Deployments"** tab, click the three dots on the latest deployment, and select **"Redeploy"** (ensure "Use existing Build Cache" is unchecked if you want a clean build).

---
**Build with AI 2026 Hackathon**  
*Team Prompt Warrior*
