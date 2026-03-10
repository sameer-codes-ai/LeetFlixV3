import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
    constructor(private firebaseService: FirebaseService) { }

    async getMe(userId: string) {
        const db = this.firebaseService.getDb();
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new NotFoundException('User not found');
        const data = doc.data() as Record<string, any>;
        const { passwordHash: _p, ...user } = data;
        return user;
    }

    async getUserStats(userId: string) {
        const db = this.firebaseService.getDb();
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new NotFoundException('User not found');

        const user = doc.data() as Record<string, any>;

        // Single-field filter only — sort in JS to avoid composite index
        const attemptsSnap = await db
            .collection('attempts')
            .where('userId', '==', userId)
            .get();

        const attempts = attemptsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort(
                (a, b) =>
                    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
            )
            .slice(0, 20);

        return {
            id: userId,
            username: user['username'],
            email: user['email'],
            role: user['role'],
            totalScore: user['totalScore'] || 0,
            quizzesAttempted: user['quizzesAttempted'] || 0,
            createdAt: user['createdAt'],
            recentAttempts: attempts,
        };
    }

    async getPublicProfile(userId: string) {
        const db = this.firebaseService.getDb();
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new NotFoundException('User not found');

        const user = doc.data() as Record<string, any>;
        return {
            id: userId,
            username: user['username'],
            totalScore: user['totalScore'] || 0,
            quizzesAttempted: user['quizzesAttempted'] || 0,
            createdAt: user['createdAt'],
        };
    }

    async searchUsers(query: string) {
        if (!query || query.trim().length === 0) return [];
        const db = this.firebaseService.getDb();
        const snap = await db.collection('users').get();
        const q = query.toLowerCase().trim();
        return snap.docs
            .map((d) => {
                const u = d.data() as Record<string, any>;
                return { id: d.id, username: u['username'], totalScore: u['totalScore'] || 0 };
            })
            .filter((u) => u.username && u.username.toLowerCase().includes(q))
            .slice(0, 10);
    }
}
