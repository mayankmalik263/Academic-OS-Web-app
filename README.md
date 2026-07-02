# Zero to Modern AI — Gamified Learning Platform

A real, multi-user, deployable learning platform converted from the gamified Command Deck HTML tracker. It is built on React + Vite + TypeScript + Tailwind CSS and powered by Supabase (Auth, database, and Row-Level Security).

## Features
- **DataCamp × Duolingo UI**: Premium light/dark theme aesthetics with responsive navigation sidebars and 3D buttons.
- **Supabase Cloud Sync**: Email/password authentication and Google OAuth sign-in. All stats (XP, level, streaks, freezes) and progress checkpoints are isolated per user via Row-Level Security (RLS).
- **Offline Data Migration**: On first login, the platform detects legacy offline progress data (`zeroToModernAI_v2`) and offers a one-click cloud import helper so users don't lose their data.
- **Gamified Path Engine**: Dynamic rendering of winding paths, JIT evaluation checkpoints, optional sidequests (Naive Bayes, PCA, k-means), project bosses, and gates.
- **Audio Synthesizer**: Custom synthesized audio effects using browser AudioContext oscillators.
- **Workspace Utilities**: Integrated Pomodoro clock and auto-saving Brain Dump notepad with 1-second debouncing.

---

## Step-by-Step Setup Guide

### 1. Supabase Backend Configuration

1. Go to the [Supabase Dashboard](https://supabase.com) and create a new project.
2. Once the project is provisioned, navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New query**, paste the entire contents of `supabase_schema.sql` (found in this repository), and click **Run**.
   - This creates all necessary tables (`profiles`, `stats`, `progress`, `activity`, `consumed_freezes`, `achievements`, `brain_dump`).
   - It enables Row-Level Security (RLS) on each table and creates access policies tied to `auth.uid()`.
   - It installs a Postgres trigger to automatically provision user profiles, stats, and dumps on sign-up.

### 2. Configure Authentication Providers

#### A. Email / Password (Default)
1. Go to **Authentication** > **Providers** > **Email**.
2. Ensure it is enabled.
3. We recommend disabling **Confirm email** for testing environments to allow immediate log-in on signup, or configure your SMTP redirect URL.

#### B. Google OAuth
1. Go to your [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project, navigate to **APIs & Services** > **Credentials**, and configure an **OAuth consent screen**.
3. Create an **OAuth 2.0 Client ID** as a *Web application*.
4. Under **Authorized redirect URIs**, add your Supabase redirect URI. You can find this in Supabase under **Authentication** > **Providers** > **Google** (format: `https://<your-project-ref>.supabase.co/auth/v1/callback`).
5. Copy the **Client ID** and **Client Secret**.
6. Go back to Supabase, navigate to **Authentication** > **Providers** > **Google**, enable it, paste the Client ID and Client Secret, and click **Save**.

---

## 3. Local Development Setup

1. Clone or copy this repository to your local system.
2. In the root directory, create a `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Set your Supabase API variables inside `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g. `https://xxx.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project public anon key.
4. Install package dependencies and launch the dev server:
   ```bash
   npm install
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

---

## 4. Deployment on Vercel

1. Push your repository to your GitHub account.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under the **Environment Variables** accordion, add your Supabase credentials:
   - Name: `VITE_SUPABASE_URL` | Value: *Your Supabase Project URL*
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: *Your Supabase Public Anon Key*
4. Ensure the build configuration is:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**. Vercel will build your assets and publish the live platform!

---

## File Structure

- `supabase_schema.sql` - Database table layouts, RLS policies, indices, and triggers.
- `src/App.tsx` - App Shell, router, and modal coordinator.
- `src/supabase.ts` - Supabase JS client initializer.
- `src/context/AuthContext.tsx` - User login context, cloud progress tracker, and legacy data migration helper.
- `src/hooks/useAudio.ts` - Audio synthesizer oscillators.
- `src/data/roadmapData.ts` - Core Phase 0-3 detailed curriculum structures.
