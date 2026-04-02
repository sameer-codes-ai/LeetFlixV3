import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class LeaderboardService {
    constructor(
        private firebaseService: FirebaseService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) { }

    async getGlobalLeaderboard(page: number = 1, limit: number = 20) {
        const cacheKey = 'leaderboard:global';
        let sorted = await this.cache.get<any[]>(cacheKey);

        if (!sorted) {
            const db = this.firebaseService.getDb();
            const snap = await db
                .collection('leaderboard_entries')
                .where('showId', '==', 'global')
                .get();

            sorted = snap.docs
                .map((d) => ({ id: d.id, ...d.data() } as any))
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((entry, idx) => ({ rank: idx + 1, ...entry }));

            await this.cache.set(cacheKey, sorted, 60000); // 60s TTL
        }

        const start = (page - 1) * limit;
        return sorted.slice(start, start + limit);
    }

    async getShowLeaderboard(showId: string, page: number = 1, limit: number = 20) {
        const cacheKey = `leaderboard:show:${showId}`;
        let sorted = await this.cache.get<any[]>(cacheKey);

        if (!sorted) {
            const db = this.firebaseService.getDb();
            const snap = await db
                .collection('leaderboard_entries')
                .where('showId', '==', showId)
                .get();

            sorted = snap.docs
                .map((d) => ({ id: d.id, ...d.data() } as any))
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((entry, idx) => ({ rank: idx + 1, ...entry }));

            await this.cache.set(cacheKey, sorted, 60000); // 60s TTL
        }

        const start = (page - 1) * limit;
        return sorted.slice(start, start + limit);
    }

    async getUserRank(userId: string) {
        const cacheKey = 'leaderboard:global';
        let sorted = await this.cache.get<any[]>(cacheKey);

        if (!sorted) {
            const db = this.firebaseService.getDb();
            const snap = await db
                .collection('leaderboard_entries')
                .where('showId', '==', 'global')
                .get();

            sorted = snap.docs
                .map((d) => ({ id: d.id, ...d.data() } as any))
                .sort((a, b) => b.totalScore - a.totalScore);

            await this.cache.set(cacheKey, sorted, 60000);
        }

        const idx = sorted.findIndex((e) => e.userId === userId);
        return idx === -1 ? null : idx + 1;
    }

    /** Call after quiz submit to invalidate leaderboard caches */
    async invalidate(showId?: string) {
        const toDelete = ['leaderboard:global'];
        if (showId) toDelete.push(`leaderboard:show:${showId}`);
        await Promise.all(toDelete.map((k) => this.cache.del(k)));
    }
}
