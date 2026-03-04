import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ForumService {
    constructor(private firebaseService: FirebaseService) { }

    async getPosts(showId?: string, page: number = 1, limit: number = 20) {
        const db = this.firebaseService.getDb();

        // Single-field filter only — sort in JS to avoid composite index
        let snap: any;
        if (showId) {
            snap = await db.collection('posts').where('showId', '==', showId).get();
        } else {
            snap = await db.collection('posts').get();
        }

        return snap.docs
            .map((d: any) => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .slice(0, limit);
    }

    async getPost(postId: string) {
        const db = this.firebaseService.getDb();
        const doc = await db.collection('posts').doc(postId).get();
        if (!doc.exists) throw new NotFoundException('Post not found');

        // Single-field filter only — sort in JS
        const commentsSnap = await db
            .collection('comments')
            .where('postId', '==', postId)
            .get();

        const comments = commentsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );

        return { id: doc.id, ...doc.data(), comments };
    }

    async createPost(userId: string, username: string, dto: CreatePostDto) {
        const db = this.firebaseService.getDb();
        const id = uuidv4();

        await db.collection('posts').doc(id).set({
            id,
            userId,
            username,
            showId: dto.showId,
            title: dto.title,
            content: dto.content,
            isLocked: false,
            commentCount: 0,
            createdAt: new Date().toISOString(),
        });

        return { id, message: 'Post created successfully' };
    }

    async createComment(
        postId: string,
        userId: string,
        username: string,
        dto: CreateCommentDto,
    ) {
        const db = this.firebaseService.getDb();

        const post = await db.collection('posts').doc(postId).get();
        if (!post.exists) throw new NotFoundException('Post not found');
        if ((post.data() as any)?.isLocked)
            throw new ForbiddenException('Thread is locked');

        const id = uuidv4();
        const batch = db.batch();

        batch.set(db.collection('comments').doc(id), {
            id,
            postId,
            userId,
            username,
            content: dto.content,
            createdAt: new Date().toISOString(),
        });

        batch.update(db.collection('posts').doc(postId), {
            commentCount: ((post.data() as any)?.commentCount || 0) + 1,
        });

        await batch.commit();
        return { id, message: 'Comment added' };
    }

    async deletePost(postId: string) {
        const db = this.firebaseService.getDb();
        await db.collection('posts').doc(postId).delete();
        return { message: 'Post deleted' };
    }

    async lockPost(postId: string) {
        const db = this.firebaseService.getDb();
        await db.collection('posts').doc(postId).update({ isLocked: true });
        return { message: 'Thread locked' };
    }

    async unlockPost(postId: string) {
        const db = this.firebaseService.getDb();
        await db.collection('posts').doc(postId).update({ isLocked: false });
        return { message: 'Thread unlocked' };
    }
}
