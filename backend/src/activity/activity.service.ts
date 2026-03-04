import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ActivityService {
    constructor(private firebaseService: FirebaseService) { }

    async getUserActivity(userId: string, year?: string) {
        const db = this.firebaseService.getDb();

        const targetYear = year || new Date().getFullYear().toString();

        // Single-field filter only — no composite index needed
        // Then filter date range in JS
        const snap = await db
            .collection('activity')
            .where('userId', '==', userId)
            .get();

        const activityMap: Record<string, number> = {};
        snap.docs.forEach((d) => {
            const data = d.data();
            const entryYear = (data.date as string).split('-')[0];
            if (entryYear === targetYear) {
                activityMap[data.date] = data.count;
            }
        });

        const streak = this.calculateStreak(activityMap);

        return {
            userId,
            year: targetYear,
            activity: activityMap,
            streak,
            totalDays: Object.keys(activityMap).length,
            totalQuizzes: Object.values(activityMap).reduce((a, b) => a + b, 0),
        };
    }

    private calculateStreak(activityMap: Record<string, number>): number {
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            if (activityMap[dateStr]) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}
