# 📚 Padhega — Your Ultimate Study Companion

> Level up your learning experience with AI-powered focus tools and collaborative study rooms.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-padhega.vercel.app-blue?style=for-the-badge)](https://padhega.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-Real--time-orange?style=for-the-badge)](https://livekit.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## 📖 What is Padhega?

**Padhega** (Hindi: *"will study"*) is a full-stack productivity and learning platform built for students. It combines AI-powered study tools, real-time collaborative study rooms, focus music, a gamified task manager, and community features — all in one place.

---

## ✨ Features

### Study Timer
A Pomodoro-style timer with three modes — **Pomodoro**, **Short Break**, and **Long Break** — to help you stay focused using the proven time-boxing technique.

### 🎵 Focus Music Player
Search YouTube for focus music or pick from curated presets: Lofi Study, Ambient Focus, Deep Work, Nature Sounds, Rainy Night, and Classical Focus. Full playback controls built in.

### 🤖 AI-Powered Resources
Search any topic and get an **instant AI study guide** (powered by Google Gemini) alongside curated YouTube video tutorials. Covers anything from Quantum Physics to Python for Beginners.

### 📝 Smart Notes
A rich-text notes editor with heading levels (H1, H2, H3), live word/character count, and **auto-save**. Supports AI-assisted note generation.

### ✅ Gamified Study Tasks
A task manager with **XP and level progression** to keep you motivated. Track task completion with a live progress bar.

### 🚪 Live Study Rooms
Real-time collaborative study rooms powered by **LiveKit**. Create or join a room to study alongside others — accountability made easy.

### 📊 Stats Dashboard
Track your study habits and progress over time with charts powered by Chart.js.

### 👥 Community
A community space to connect with other learners.

### 🌙 Light / Dark Mode
Full theme support with a beautiful sakura-accented UI.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js (MongoDB Adapter) |
| Database | MongoDB + Mongoose |
| Real-time Rooms | LiveKit (client + server SDK) |
| AI Study Guides | Google Gemini (`@google/generative-ai`) |
| Email | Resend |
| Charts | Chart.js + react-chartjs-2 |
| YouTube Integration | react-youtube + yt-search |
| Testing | Vitest (unit) + Playwright (e2e) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)
- A [LiveKit](https://livekit.io/) account (for study rooms)
- A [Resend](https://resend.com/) API key (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/ashish03124/Padhega.git
cd Padhega
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google Gemini (AI Study Guides)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# LiveKit (Study Rooms)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url

# Email
RESEND_API_KEY=your_resend_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run unit tests with Vitest:

```bash
npm test
```

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```

---

## 📂 Project Structure

```
Padhega/
├── src/                    # Next.js app source
│   └── app/                # App Router pages & API routes
├── public/                 # Static assets (images, icons)
├── e2e/                    # Playwright end-to-end tests
├── playwright-report/      # Playwright test reports
├── test-results/           # Test output
├── next.config.ts          # Next.js configuration
├── playwright.config.ts    # Playwright configuration
├── vitest.config.ts        # Vitest configuration
├── tailwind.config         # Tailwind CSS configuration
└── package.json            # Dependencies & scripts
```

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Home — Study Timer, Focus Music, Smart Notes, Tasks, Live Rooms |
| `/resources` | AI Study Guide + YouTube tutorials for any topic |
| `/study-rooms` | Browse and join live collaborative study rooms |
| `/community` | Community space for learners |
| `/stats` | Personal study stats and charts |
| `/about` | About the project |

---

## 🌐 Deployment

The app is deployed on **Vercel** and accessible at [padhega.vercel.app](https://padhega.vercel.app).

To deploy your own instance, push to GitHub and import the repository into [Vercel](https://vercel.com/). Add all environment variables in the Vercel project settings.

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">Built with ❤️ by <a href="https://github.com/ashish03124">ashish03124</a></p>
