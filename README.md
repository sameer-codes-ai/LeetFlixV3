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

### 🤝 Social Network
- **Follow/Unfollow**: Follow other users directly from their profile page.
- **Followers & Following**: Clickable count badges open a modal listing all followers or accounts you follow.
- **Profile Discovery**: Navigate to any followed user's profile to view their stats, level, heatmap, and accuracy.

### 🔍 Global Search
- **Unified Search**: Search across shows, users, and forum posts from anywhere in the platform.
- **Smart Suggestions**: Real-time suggestions as you type for quick navigation.
- **Multi-entity Results**: Find shows by title, users by username, and discussions by content.

### 📱 Full Responsive Design
- **Mobile-First Approach**: Perfectly scales down to 375px viewports. Features a mobile hamburger menu and collapsible navigation panels.
- **Dynamic Grid Layouts**: Automatic grid scaling across Desktop, Tablet, and Mobile to ensure no horizontal overflow.
- **Touch-Optimized UI**: All interactive elements (quizzes, follow buttons, search) are optimized for touch devices.

### ⚡ Performance & Cloud Integrations
- **Caching Layer**: Intelligent `@nestjs/cache-manager` caching for leaderboards, user searches, and quiz data to minimize database reads.
- **Google OAuth Integration**: Secure Google sign-in workflow built directly on Firebase Admin SDK (Backend) and Firebase Client (Frontend).
- **Production CI/CD Ready**: Fully configured for Vercel (Frontend) and Render (Backend) deployments, utilizing Next.js parallel promise resolutions and `<Suspense>` boundaries for seamless static site generation (SSG).

---

## 🛠️ Technological Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Vanilla CSS Media Queries, Lucide Icons. Hosted on **Vercel**.
- **Backend**: NestJS, Firebase Admin SDK, JWT Authentication, `@nestjs/cache-manager`. Hosted on **Render**.
- **Database**: Google Cloud Firestore (NoSQL).
- **Authentication**: JWT & Full Google OAuth Flow.
- **Design**: Premium Dark Mode with a curated Orange/Violet/Neon-Green palette, responsive across all screen sizes.

---

## 🚀 Quick Start

### ⚡ One-Click Launch (Windows)
Double-click **`start.bat`** in the project root. It will:
1. Open the **backend** in a separate terminal window.
2. Open the **frontend** in a separate terminal window.
3. Wait 3 seconds, then open `http://localhost:3000` in your browser automatically.

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



## 🧪 Development & Testing

### Running Tests
```bash
# Backend unit tests
cd backend
npm run test

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Linting & Code Quality
```bash
# Backend linting
cd backend
npm run lint
npm run lint --fix  # Auto-fix issues

# Frontend linting
cd frontend
npm run lint
```

### Database Seeding
For development, populate Firestore with sample data:
```bash
cd backend
npm run seed  # Imports sample shows, seasons, and questions
```

---

## 📧 Support & Contribution

### Found a Bug?
1. Check if it's already reported in [Issues](https://github.com/sameer-codes-ai/LeetFlixV3/issues)
2. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots if applicable

### Want to Contribute?
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

LeetFlix V3 © 2024. All rights reserved.

---

## 🙏 Credits

Built with ❤️ by the LeetFlix team. Powered by:
- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Firebase](https://firebase.google.com/) - Database & authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon library

---

**Latest Update**: April 2026 | Version 3.0+

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

---

## 🔌 API Endpoints Overview

### 🔐 Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Sign in and receive JWT token
- `POST /auth/refresh` - Refresh authentication token

### 👥 User Management
- `GET /users/:id` - Get user profile and stats
- `PATCH /users/:id` - Update user profile
- `GET /users/:id/leaderboard-position` - Get user's global rank

### 📺 Shows & Quiz
- `GET /shows` - List all TV shows
- `GET /shows/:slug` - Get show details with seasons
- `POST /quiz/submit` - Submit quiz attempt and calculate score
- `GET /quiz/:showId` - Get questions for show quiz

### 📊 Leaderboard
- `GET /leaderboard` - Get global leaderboard rankings
- `GET /leaderboard/shows/:showId` - Get show-specific leaderboard
- `GET /leaderboard/user/:userId` - Get user's leaderboard position

### 💬 Forum
- `GET /forum/posts` - Get forum posts for a show
- `POST /forum/posts` - Create new forum post (requires auth)
- `POST /forum/posts/:id/comments` - Comment on a post (requires auth)
- `DELETE /forum/posts/:id` - Delete post (author or admin only)
- `PATCH /forum/posts/:id` - Edit post (author or admin only)

### 📈 Activity
- `GET /activity/:userId` - Get user's activity heatmap for year

### 🤝 Social
- `POST /social/follow/:userId` - Follow a user
- `DELETE /social/follow/:userId` - Unfollow a user
- `GET /social/:userId/followers` - Get user's followers
- `GET /social/:userId/following` - Get user's following list
- `GET /social/follow/:userId/status` - Check if following status

### ⚙️ Admin
- `POST /admin/bulk-ingest` - Upload JSON to bulk import shows/seasons/questions (admin only)
- `PATCH /admin/users/:id/role` - Promote user to admin (admin only)

---