import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuizService {
    constructor(private firebaseService: FirebaseService) { }

    async getSeasonQuestions(seasonId: string) {
        const db = this.firebaseService.getDb();

        const seasonDoc = await db.collection('seasons').doc(seasonId).get();
        if (!seasonDoc.exists) throw new NotFoundException('Season not found');

        // Single-field filter only — no composite index needed
        const questionsSnap = await db
            .collection('questions')
            .where('seasonId', '==', seasonId)
            .get();

        return questionsSnap.docs.map((d) => {
            const data = d.data() as Record<string, any>;
            const { answer: _a, ...question } = data;
            return { id: d.id, ...question };
        });
    }

    async submitQuiz(userId: string, dto: SubmitQuizDto) {
        const db = this.firebaseService.getDb();

        const questionsSnap = await db
            .collection('questions')
            .where('seasonId', '==', dto.seasonId)
            .get();

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
                selected: a.selected,
                correct,
                correctAnswer: question?.answer,
            };
        });

        const total = questionsMap.size;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        const attemptId = uuidv4();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        const batch = db.batch();

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

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = (userDoc.data() as Record<string, any>) || {};
        batch.update(userRef, {
            totalScore: (userData['totalScore'] || 0) + score,
            quizzesAttempted: (userData['quizzesAttempted'] || 0) + 1,
        });

        // Update activity — single-field query to avoid composite index
        const activitySnap = await db
            .collection('activity')
            .where('userId', '==', userId)
            .get();

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

        await this.updateLeaderboard(
            db,
            batch,
            userId,
            userData['username'] || '',
            'global',
            score,
        );

        await this.updateLeaderboard(
            db,
            batch,
            userId,
            userData['username'] || '',
            dto.showId,
            score,
        );

        await batch.commit();

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
        // Single-field filter only — sort in JS to avoid composite index
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
