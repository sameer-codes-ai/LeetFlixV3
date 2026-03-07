# LeetFlix V3 🚀

A premium, full-stack gamified quiz platform designed for TV show enthusiasts. Test your knowledge, track your binge activity, and climb the global leaderboards in a high-octane neon-themed ecosystem.

## ✨ Core Features

### 🎬 Immersive Show Exploration
- **Cinematic Discovery**: Full-bleed hero banners and horizontal carousels with vibrant movie poster art.
- **Dynamic Content**: Real-time "New Quiz" and "Coming Soon" badges based on seasonal data availability.
- **Show Hierarchy**: Detailed show pages with metadata, seasonal breakdowns, and show-specific leaderboards.

### 🧠 Advanced Quiz Engine
- **Focus Mode**: Isolated, full-screen quiz interface to minimize distractions.
- **Gamified Feedback**: Interactive progress bars and a live mm:ss countdown timer.
- **Real-time Stats**: Post-quiz analysis including Accuracy, Average Response Time, and Rank updates.

### 📊 Professional User Profiles
- **Dashboard Sidebar**: Full-height navigation sidebar for quick access to core features.
- **Activity Heatmap**: GitHub-style grid tracking your "Binge Activity" and daily streaks.
- **Leveling System**: Earn XP from quizzes to level up your profile from "Standard" to "Premium Member".
- **Live Metrics**: At-a-glance cards showing Total Score, Global Rank, and overall Accuracy.

### 🏆 Competitive Ecosystem
- **Global Leaderboard**: Compete against the entire community for the top spot.
- **Show Rankings**: Prove your expertise in specific series like *Breaking Bad* or *The Office*.
- **Rank Badges**: Dynamic badges showing your status compared to other fans.

### 💬 Community & Discussion
- **Forum Hub**: Show-specific discussion threads for fans to engage and debate.
- **Real-time Threads**: Post questions, share theories, and comment on trending topics.

### 🛡️ Admin Command Center
- **Bulk Ingestion**: Intelligent JSON upload tool for mass-importing seasons and questions.
- **User Management**: Administrative tools to promote users, moderate content, and manage the platform.

---

## 🛠️ Technological Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: NestJS, Firebase Admin SDK, JWT Authentication.
- **Database**: Google Cloud Firestore (NoSQL).
- **Design**: Premium Dark Mode with a curated Orange/Violet/Neon-Green palette.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Firebase project with Firestore enabled

### 1. Backend Setup
```bash
cd backend
# Copy env and fill in your values
cp .env.example .env

# Place your Firebase service account JSON at:
# backend/firebase-service-account.json

npm install
npm run start:dev
# API runs at http://localhost:3001/api
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

---

## ⚙️ Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or use an existing project
3. Enable **Firestore Database** (Native mode)
4. Go to Project Settings → Service Accounts → Generate new private key
5. Save the JSON as `backend/firebase-service-account.json`

### Required Firestore Indexes

Create composite indexes in Firebase Console for:
- `attempts`: `userId` (ASC), `completedAt` (DESC)
- `leaderboard_entries`: `showId` (ASC), `totalScore` (DESC)
- `activity`: `userId` (ASC), `date` (ASC)
- `posts`: `showId` (ASC), `createdAt` (DESC)
- `comments`: `postId` (ASC), `createdAt` (ASC)

---

## 📝 Project Structure

```
LeetFlixV3/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # JWT authentication & Security
│       ├── users/    # Stats & Profile logic
│       ├── shows/    # Show & Season management
│       ├── quiz/     # Core scoring & Engine
│       ├── leaderboard/ # Competitive rankings
│       ├── activity/ # Heatmap & Streak tracking
│       ├── forum/    # Community discussions
│       ├── admin/    # Data ingestion & Management
│       └── firebase/ # Database connectivity
└── frontend/         # Next.js Application
    └── app/
        ├── page.tsx          # Dynamic Landing Page
        ├── login/            # Auth Management
        ├── profile/[id]/     # Sidebar-based Dashboard
        ├── shows/[slug]/     # Cinematic Details
        │   └── quiz/[id]/    # Isolated Quiz Interface
        ├── results/[id]/     # Performance Analysis
        ├── leaderboard/      # Ranking Hub
        ├── forum/            # Discussion Center
        └── admin/            # Administrative Control
```
