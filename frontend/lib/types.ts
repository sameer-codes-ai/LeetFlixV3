export interface User {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    totalScore: number;
    quizzesAttempted: number;
    createdAt: string;
}

export interface Show {
    id: string;
    name: string;
    slug: string;
    description: string;
    posterUrl?: string;   // show artwork image URL (optional)
    createdAt: string;
    seasons?: Season[];
}

export interface Season {
    id: string;
    showId: string;
    name: string;
    order: number;
    questionCount: number;
}

export interface Question {
    id: string;
    seasonId: string;
    showId: string;
    question: string;
    options: string[];
    answer: string;
}

export interface SubmitAnswer {
    questionId: string;
    selected: string;
}

export interface AttemptResult {
    attemptId: string;
    score: number;
    total: number;
    percentage: number;
    answers: {
        questionId: string;
        questionText?: string;
        selected: string;
        correct: boolean;
        correctAnswer: string;
    }[];
}

export interface Attempt {
    id: string;
    userId: string;
    seasonId: string;
    showId: string;
    score: number;
    total: number;
    percentage: number;
    completedAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    id: string;
    userId: string;
    username: string;
    showId: string;
    totalScore: number;
    quizzesAttempted: number;
}

export interface ActivityData {
    userId: string;
    year: string;
    activity: Record<string, number>;
    streak: number;
    totalDays: number;
    totalQuizzes: number;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    showId: string;
    title: string;
    content: string;
    isLocked: boolean;
    commentCount: number;
    createdAt: string;
    comments?: Comment[];
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export interface UploadReport {
    total: number;
    success: number;
    failed: number;
    errors: { index: number; entry: any; reason: string }[];
}
