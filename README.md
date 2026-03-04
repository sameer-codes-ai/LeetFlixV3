# LeetFlix V3 🚀

A full-stack gamified quiz platform for TV show enthusiasts.

## Quick Start

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

npm run start:dev
# API runs at http://localhost:3001/api
```

### 2. Frontend Setup
```bash
cd frontend
npm run dev
# App runs at http://localhost:3000
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or use an existing project
3. Enable **Firestore Database** (Native mode)
4. Go to Project Settings → Service Accounts → Generate new private key
5. Save the JSON as `backend/firebase-service-account.json`

### Required Firestore Indexes

Create composite indexes in Firebase Console for:
- `attempts` — userId ASC, completedAt DESC
- `leaderboard_entries` — showId ASC, totalScore DESC
- `activity` — userId ASC, date ASC
- `posts` — showId ASC, createdAt DESC
- `comments` — postId ASC, createdAt ASC

## Creating Your First Admin

After registering through the app, use Firestore Console to set `role: "admin"` on your user document, or use another admin's "Promote" button in the admin dashboard.

## Bulk Quiz Upload Format

```json
[
  {
    "showName": "Breaking Bad",
    "seasonName": "Season 1",
    "question": "What subject does Walter White teach?",
    "options": ["Chemistry", "Physics", "Biology", "Math"],
    "answer": "Chemistry"
  }
]
```

## Project Structure

```
LeetFlixV3/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # JWT authentication
│       ├── users/    # User profiles
│       ├── shows/    # Shows & seasons
│       ├── quiz/     # Quiz engine
│       ├── leaderboard/
│       ├── activity/ # Heatmap data
│       ├── forum/    # Discussion forum
│       ├── admin/    # Bulk upload
│       └── firebase/ # Firebase admin
└── frontend/         # Next.js app
    └── app/
        ├── page.tsx          # Home / shows grid
        ├── login/            # Authentication
        ├── register/
        ├── shows/[slug]/     # Show detail
        │   └── quiz/[id]/    # Quiz page
        ├── results/[id]/     # Score results
        ├── leaderboard/      # Rankings
        ├── profile/[id]/     # User profile + heatmap
        ├── forum/            # Discussion forum
        └── admin/            # Admin dashboard
```
# LeetFlixV3
