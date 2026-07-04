# 🚀 Zero to Modern AI

<p align="center">
  <strong>A gamified, multi-user learning platform built to master modern AI concepts.</strong>
</p>

<p align="center">
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-6495ED?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
</p>

---

## ✨ Overview

**Zero to Modern AI** is a real, multi-user, deployable learning platform converted from the gamified Command Deck HTML tracker. It is designed to provide a highly interactive and engaging learning experience, bridging premium visual aesthetics with robust full-stack state management. 

Drawing inspiration from platforms like **DataCamp** and **Duolingo**, the platform features a dynamic path engine, progress checkpoints, and an isolated per-user experience powered by **Supabase**.

---

## 🚀 Key Features

### 🎮 Gamified Learning Experience
- **DataCamp × Duolingo UI:** Premium light/dark theme aesthetics with responsive navigation sidebars and interactive 3D buttons.
- **Dynamic Path Engine:** Interactive rendering of winding paths, JIT evaluation checkpoints, optional sidequests (Naive Bayes, PCA, k-means), project bosses, and gates.
- **Achievements & Stats:** Track XP, levels, learning streaks, and streak freezes to keep motivation high.

### 🛡️ Cloud Sync & Data Management
- **Supabase Cloud Sync:** Robust email/password authentication and Google OAuth sign-in. All user stats and progress checkpoints are securely isolated per user via Row-Level Security (RLS).
- **Seamless Offline Data Migration:** On first login, the platform detects legacy offline progress data (`zeroToModernAI_v2`) and offers a one-click cloud import helper to ensure zero data loss.

### 🛠️ Interactive Workspace
- **Workspace Utilities:** Integrated Pomodoro clock and auto-saving Brain Dump notepad with 1-second debouncing to keep you focused.
- **Audio Synthesizer:** Custom synthesized audio effects using browser AudioContext oscillators for interactive feedback.

---

## 🛠️ Technology Stack

- **Framework & Bundler:** Vite + React 18 (SPA)
- **Language:** TypeScript
- **Styling & Theme:** Tailwind CSS for a premium gamified aesthetic, supporting light and dark modes.
- **Backend Integrations:** Supabase (Auth, PostgreSQL Database, Row-Level Security).
- **Audio Effects:** Native Web Audio API (`AudioContext`).

---

## 📁 Project Structure

```text
Zero to Modern AI/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI widgets and interactive components
│   ├── context/            # React Context (AuthContext for user login and cloud progress)
│   ├── data/               # Static dataset and core Phase 0-3 detailed curriculum structures (`roadmapData.ts`)
│   ├── hooks/              # Custom hooks (e.g., `useAudio.ts` for synthesizer oscillators)
│   ├── pages/              # Main application views
│   ├── App.tsx             # App Shell, routing, and modal coordinator
│   ├── supabase.ts         # Supabase JS client initializer
│   └── main.tsx            # Main DOM entrypoint
├── supabase_schema.sql     # Database layouts, RLS policies, indices, and triggers
├── package.json            # Project dependencies
└── vite.config.ts          # Vite build pipeline
```

---

## ⚙️ Getting Started

Follow these instructions to run the platform locally on your system.

### 1. Supabase Backend Configuration

1. Create a new project on the [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**, click **New query**, paste the entire contents of `supabase_schema.sql`, and click **Run**.
   - *This creates tables (`profiles`, `stats`, `progress`, etc.), enables RLS, and sets up auth triggers.*
3. Configure your **Authentication Providers**:
   - Enable **Email** provider.
   - For **Google OAuth**, create credentials in the Google Cloud Console and add the Client ID/Secret to Supabase > Authentication > Providers > Google.

### 2. Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Configure Environment Variables:**
   Create a `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase API variables inside `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Install Dependencies & Run:**
   ```bash
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` to view the application in your browser!

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub and import the project into the [Vercel Dashboard](https://vercel.com).
2. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Set the Framework Preset to **Vite** and the Build Command to `npm run build`.
4. Click **Deploy**. Vercel will build and publish your platform!
