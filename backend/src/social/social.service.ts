import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SocialService {
    constructor(private firebaseService: FirebaseService) { }

    async follow(followerId: string, targetUserId: string): Promise<void> {
        if (followerId === targetUserId) {
            throw new BadRequestException('You cannot follow yourself');
        }
        const db = this.firebaseService.getDb();

        // Verify target user exists
        const targetDoc = await db.collection('users').doc(targetUserId).get();
        if (!targetDoc.exists) throw new NotFoundException('User not found');

        // Check if already following
        const existing = await db
            .collection('follows')
            .where('followerId', '==', followerId)
            .where('followingId', '==', targetUserId)
            .limit(1)
            .get();

        if (!existing.empty) return; // Already following, idempotent

        const id = uuidv4();
        await db.collection('follows').doc(id).set({
            id,
            followerId,
            followingId: targetUserId,
            createdAt: new Date().toISOString(),
        });
    }

    async unfollow(followerId: string, targetUserId: string): Promise<void> {
        const db = this.firebaseService.getDb();
        const existing = await db
            .collection('follows')
            .where('followerId', '==', followerId)
            .where('followingId', '==', targetUserId)
            .limit(1)
            .get();

        if (existing.empty) return; // Not following, idempotent
        await existing.docs[0].ref.delete();
    }

    async getFollowers(userId: string): Promise<any[]> {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('follows')
            .where('followingId', '==', userId)
            .get();

        const followerIds = snap.docs.map((d) => d.data().followerId as string);
        if (followerIds.length === 0) return [];

        // Fetch user data for each follower
        const userDocs = await Promise.all(
            followerIds.map((id) => db.collection('users').doc(id).get()),
        );
        return userDocs
            .filter((d) => d.exists)
            .map((d) => {
                const u = d.data() as Record<string, any>;
                return { id: d.id, username: u['username'], totalScore: u['totalScore'] || 0 };
            });
    }

    async getFollowing(userId: string): Promise<any[]> {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('follows')
            .where('followerId', '==', userId)
            .get();

        const followingIds = snap.docs.map((d) => d.data().followingId as string);
        if (followingIds.length === 0) return [];

        const userDocs = await Promise.all(
            followingIds.map((id) => db.collection('users').doc(id).get()),
        );
        return userDocs
            .filter((d) => d.exists)
            .map((d) => {
                const u = d.data() as Record<string, any>;
                return { id: d.id, username: u['username'], totalScore: u['totalScore'] || 0 };
            });
    }

    async isFollowing(followerId: string, targetUserId: string): Promise<boolean> {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('follows')
            .where('followerId', '==', followerId)
            .where('followingId', '==', targetUserId)
            .limit(1)
            .get();
        return !snap.empty;
    }

    async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
        const db = this.firebaseService.getDb();
        const [followersSnap, followingSnap] = await Promise.all([
            db.collection('follows').where('followingId', '==', userId).get(),
            db.collection('follows').where('followerId', '==', userId).get(),
        ]);
        return { followers: followersSnap.size, following: followingSnap.size };
    }
}
