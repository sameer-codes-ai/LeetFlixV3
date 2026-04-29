import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseService } from '../firebase/firebase.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { v4 as uuidv4 } from 'uuid';

/** Fisher-Yates (Knuth) in-place shuffle */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function sanitizeQuestion(d: FirebaseFirestore.DocumentSnapshot) {
    const data = d.data() as Record<string, any>;
    return { id: d.id, ...data, options: shuffle(data.options || []) };
}

@Injectable()
export class QuizService {
    constructor(
        private firebaseService: FirebaseService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) { }

    async getSeasonQuestions(seasonId: string) {
        const cacheKey = `quiz:season:${seasonId}:structure`; // structure (no shuffled answers)
        const db = this.firebaseService.getDb();

        // Always verify season exists (lightweight single-doc fetch)
        const seasonDoc = await db.collection('seasons').doc(seasonId).get();
        if (!seasonDoc.exists) throw new NotFoundException('Season not found');

        // Fetch questions — cache the raw list, shuffle on the way out
        let rawQuestions = await this.cache.get<any[]>(cacheKey);
        if (!rawQuestions) {
            const questionsSnap = await db
                .collection('questions')
                .where('seasonId', '==', seasonId)
                .get();
            rawQuestions = questionsSnap.docs.map((d) => {
                const data = d.data() as Record<string, any>;
                return { id: d.id, ...data };
            });
            await this.cache.set(cacheKey, rawQuestions, 300000); // 5 min TTL
        }

        // Shuffle a fresh copy for each request (so order is always random)
        return shuffle(rawQuestions.map((q) => ({ ...q, options: shuffle(q.options || []) })));
    }

    async getAllShowQuestions(showId: string) {
        const db = this.firebaseService.getDb();

        // Fetch all seasons first
        const seasonsSnap = await db.collection('seasons').where('showId', '==', showId).get();
        if (seasonsSnap.empty) throw new NotFoundException('No seasons found for this show');

        const seasonIds = seasonsSnap.docs.map((d) => d.id);

        // Fetch all season question lists in PARALLEL
        const questionSnaps = await Promise.all(
            seasonIds.map((sid) =>
                db.collection('questions').where('seasonId', '==', sid).get(),
            ),
        );

        const allQuestions: any[] = [];
        const seenQuestions = new Set<string>();
        questionSnaps.forEach((snap) => {
            snap.docs.forEach((d) => {
                const data = d.data() as Record<string, any>;
                // Deduplicate by question text to handle re-uploads
                if (seenQuestions.has(data.question)) return;
                seenQuestions.add(data.question);
                allQuestions.push({ id: d.id, ...data, options: shuffle(data.options || []) });
            });
        });

        // TEMP: hardcode max 120 questions for all-seasons quiz (remove after DB rebuild)
        return shuffle(allQuestions).slice(0, 120);
    }

    async getLearnData(showId: string) {
        const db = this.firebaseService.getDb();

        const [seasonsSnap, questionsSnap] = await Promise.all([
            db.collection('seasons').where('showId', '==', showId).get(),
            db.collection('questions').where('showId', '==', showId).get(),
        ]);

        if (seasonsSnap.empty) throw new NotFoundException('No seasons found for this show');

        // Build season list sorted by order + natural name
        const seasons = seasonsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort((a: any, b: any) => {
                const orderDiff = (a.order || 0) - (b.order || 0);
                if (orderDiff !== 0) return orderDiff;
                const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                return numA - numB;
            });

        // Group questions by seasonId
        const questionsBySeason: Record<string, any[]> = {};
        questionsSnap.docs.forEach((d) => {
            const data = d.data() as Record<string, any>;
            const sid = data.seasonId;
            if (!questionsBySeason[sid]) questionsBySeason[sid] = [];
            questionsBySeason[sid].push({
                id: d.id,
                question: data.question,
                options: data.options || [],
                answer: data.answer,
            });
        });

        return seasons.map((s: any) => ({
            seasonId: s.id,
            seasonName: s.name,
            order: s.order,
            questions: questionsBySeason[s.id] || [],
        }));
    }

    async submitQuiz(userId: string, dto: SubmitQuizDto) {
        const db = this.firebaseService.getDb();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();
        const attemptId = uuidv4();

        // ─── Parallelise all independent reads ──────────────────────────────
        const isAllSeasons = dto.seasonId === 'all';

        const [questionsSnap, userDoc, activitySnap] = await Promise.all([
            // For "all" season quizzes, fetch by showId; otherwise by seasonId
            isAllSeasons
                ? db.collection('questions').where('showId', '==', dto.showId).get()
                : db.collection('questions').where('seasonId', '==', dto.seasonId).get(),
            db.collection('users').doc(userId).get(),
            db.collection('activity').where('userId', '==', userId).get(),
        ]);
        // ────────────────────────────────────────────────────────────────────

        // Build answers map
        const questionsMap = new Map<string, any>();
        questionsSnap.docs.forEach((d) =>
            questionsMap.set(d.id, { id: d.id, ...d.data() }),
        );

        let score = 0;
        const detailedAnswers = dto.answers.map((a) => {
            const question = questionsMap.get(a.questionId);
            const correct = question ? a.selected === question.answer : false;
            if (correct) score++;
            return {
                questionId: a.questionId,
                questionText: question?.question || '',
                selected: a.selected,
                correct,
                correctAnswer: question?.answer,
            };
        });

        const total = dto.answers.length; // Use submitted answer count, not DB total (which may include duplicates)
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        const userData = (userDoc.data() as Record<string, any>) || {};

        const batch = db.batch();

        // Write attempt
        batch.set(db.collection('attempts').doc(attemptId), {
            id: attemptId,
            userId,
            seasonId: dto.seasonId,
            showId: dto.showId,
            score,
            total,
            percentage,
            answers: detailedAnswers,
            completedAt: now,
        });

        // Update user totals
        batch.update(db.collection('users').doc(userId), {
            totalScore: (userData['totalScore'] || 0) + score,
            quizzesAttempted: (userData['quizzesAttempted'] || 0) + 1,
        });

        // Update daily activity
        const todayDoc = activitySnap.docs.find((d) => d.data().date === today);
        if (!todayDoc) {
            const actId = uuidv4();
            batch.set(db.collection('activity').doc(actId), {
                id: actId,
                userId,
                date: today,
                count: 1,
            });
        } else {
            batch.update(todayDoc.ref, { count: (todayDoc.data().count || 0) + 1 });
        }

        // Update both leaderboards (global + show-specific)
        await Promise.all([
            this.updateLeaderboard(db, batch, userId, userData['username'] || '', 'global', score),
            this.updateLeaderboard(db, batch, userId, userData['username'] || '', dto.showId, score),
        ]);

        // Commit all writes in a single round-trip
        await batch.commit();

        // Invalidate leaderboard caches
        await Promise.all([
            this.cache.del('leaderboard:global'),
            this.cache.del(`leaderboard:show:${dto.showId}`),
        ]);

        return { attemptId, score, total, percentage, answers: detailedAnswers };
    }

    private async updateLeaderboard(
        db: any,
        batch: any,
        userId: string,
        username: string,
        showId: string,
        additionalScore: number,
    ) {
        const snap = await db
            .collection('leaderboard_entries')
            .where('userId', '==', userId)
            .where('showId', '==', showId)
            .limit(1)
            .get();

        if (snap.empty) {
            const id = uuidv4();
            batch.set(db.collection('leaderboard_entries').doc(id), {
                id,
                userId,
                username,
                showId,
                totalScore: additionalScore,
                quizzesAttempted: 1,
            });
        } else {
            const existing = snap.docs[0];
            batch.update(existing.ref, {
                totalScore: (existing.data().totalScore || 0) + additionalScore,
                quizzesAttempted: (existing.data().quizzesAttempted || 0) + 1,
            });
        }
    }

    async getAttemptHistory(userId: string) {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('attempts')
            .where('userId', '==', userId)
            .get();

        return snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort(
                (a, b) =>
                    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
            )
            .slice(0, 50);
    }

    async getAttempt(attemptId: string) {
        const db = this.firebaseService.getDb();
        const doc = await db.collection('attempts').doc(attemptId).get();
        if (!doc.exists) throw new NotFoundException('Attempt not found');
        return { id: doc.id, ...doc.data() };
    }
}
