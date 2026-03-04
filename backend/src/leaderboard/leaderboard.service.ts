import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class LeaderboardService {
    constructor(private firebaseService: FirebaseService) { }

    async getGlobalLeaderboard(page: number = 1, limit: number = 20) {
        const db = this.firebaseService.getDb();
        // Filter by showId only — sort in JS to avoid composite index
        const snap = await db
            .collection('leaderboard_entries')
            .where('showId', '==', 'global')
            .get();

        const sorted = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ rank: idx + 1, ...entry }));

        const start = (page - 1) * limit;
        return sorted.slice(start, start + limit);
    }

    async getShowLeaderboard(
        showId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('leaderboard_entries')
            .where('showId', '==', showId)
            .get();

        const sorted = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ rank: idx + 1, ...entry }));

        const start = (page - 1) * limit;
        return sorted.slice(start, start + limit);
    }

    async getUserRank(userId: string) {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('leaderboard_entries')
            .where('showId', '==', 'global')
            .get();

        const sorted = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort((a, b) => b.totalScore - a.totalScore);

        const idx = sorted.findIndex((e) => e.userId === userId);
        return idx === -1 ? null : idx + 1;
    }
}
