import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ShowsService } from '../shows/shows.service';
import { v4 as uuidv4 } from 'uuid';

interface QuizEntry {
    showName: string;
    seasonName: string;
    posterUrl?: string;      // optional show poster image URL
    question: string;
    options: string[];
    answer: string;
}

export interface UploadResult {
    total: number;
    success: number;
    failed: number;
    errors: { index: number; entry: any; reason: string }[];
}

@Injectable()
export class AdminService {
    constructor(
        private firebaseService: FirebaseService,
        private showsService: ShowsService,
    ) { }

    async bulkUploadQuiz(fileBuffer: Buffer): Promise<UploadResult> {
        let entries: QuizEntry[];

        try {
            entries = JSON.parse(fileBuffer.toString('utf8'));
        } catch {
            throw new BadRequestException('Invalid JSON file');
        }

        if (!Array.isArray(entries)) {
            throw new BadRequestException('JSON must be an array of quiz entries');
        }

        const db = this.firebaseService.getDb();
        const result: UploadResult = {
            total: entries.length,
            success: 0,
            failed: 0,
            errors: [],
        };

        // Validate all entries first
        const valid: { entry: QuizEntry; idx: number }[] = [];

        entries.forEach((entry, idx) => {
            const reason = this.validateEntry(entry);
            if (reason) {
                result.failed++;
                result.errors.push({ index: idx, entry, reason });
            } else {
                valid.push({ entry, idx });
            }
        });

        // Process in Firestore batch chunks of 499
        const BATCH_SIZE = 499;

        const showIdCache: Record<string, string> = {};
        const seasonIdCache: Record<string, string> = {};
        const seasonCountIncrement: Record<string, number> = {};

        for (let i = 0; i < valid.length; i += BATCH_SIZE) {
            const chunk = valid.slice(i, i + BATCH_SIZE);
            const batch = db.batch();

            for (const { entry, idx } of chunk) {
                try {
                    // Get/create show — pass posterUrl so it gets stored on the show document
                    if (!showIdCache[entry.showName]) {
                        showIdCache[entry.showName] =
                            await this.showsService.getOrCreateShow(
                                entry.showName,
                                entry.posterUrl,
                            );
                    } else if (entry.posterUrl) {
                        // Update posterUrl if provided in a later entry for same show
                        await this.showsService.updateShowPoster(
                            showIdCache[entry.showName],
                            entry.posterUrl,
                        );
                    }
                    const showId = showIdCache[entry.showName];

                    // Get/create season
                    const cacheKey = `${showId}::${entry.seasonName}`;
                    if (!seasonIdCache[cacheKey]) {
                        seasonIdCache[cacheKey] =
                            await this.showsService.getOrCreateSeason(showId, entry.seasonName);
                    }
                    const seasonId = seasonIdCache[cacheKey];

                    // Check for duplicate questions
                    const dupSnap = await db
                        .collection('questions')
                        .where('seasonId', '==', seasonId)
                        .where('question', '==', entry.question)
                        .limit(1)
                        .get();

                    if (!dupSnap.empty) {
                        result.failed++;
                        result.errors.push({
                            index: idx,
                            entry,
                            reason: 'Duplicate question (already exists in this season)',
                        });
                        continue;
                    }

                    // Add question
                    const qId = uuidv4();
                    batch.set(db.collection('questions').doc(qId), {
                        id: qId,
                        seasonId,
                        showId,
                        question: entry.question,
                        options: entry.options,
                        answer: entry.answer,
                        createdAt: new Date().toISOString(),
                    });

                    seasonCountIncrement[seasonId] =
                        (seasonCountIncrement[seasonId] || 0) + 1;

                    result.success++;
                } catch (err) {
                    result.failed++;
                    result.errors.push({
                        index: idx,
                        entry,
                        reason: err instanceof Error ? err.message : 'Unknown error',
                    });
                }
            }

            await batch.commit();
        }

        // Update question counts on seasons
        const countBatch = db.batch();
        for (const [seasonId, increment] of Object.entries(seasonCountIncrement)) {
            const seasonRef = db.collection('seasons').doc(seasonId);
            const seasonDoc = await seasonRef.get();
            countBatch.update(seasonRef, {
                questionCount: (seasonDoc.data()?.questionCount || 0) + increment,
            });
        }
        await countBatch.commit();

        return result;
    }

    private validateEntry(entry: any): string | null {
        if (!entry.showName || typeof entry.showName !== 'string')
            return 'Missing or invalid showName';
        if (!entry.seasonName || typeof entry.seasonName !== 'string')
            return 'Missing or invalid seasonName';
        if (!entry.question || typeof entry.question !== 'string')
            return 'Missing or invalid question';
        if (!Array.isArray(entry.options) || entry.options.length < 2)
            return 'options must be an array of at least 2 items';
        if (!entry.options.every((o: any) => typeof o === 'string'))
            return 'All options must be strings';
        if (!entry.answer || typeof entry.answer !== 'string')
            return 'Missing answer';
        if (!entry.options.includes(entry.answer))
            return 'answer must exactly match one of the options';
        return null;
    }

    async getAllUsers() {
        const db = this.firebaseService.getDb();
        // No orderBy to avoid needing a Firestore index — sort in JS
        const snap = await db.collection('users').get();
        return snap.docs
            .map((d) => {
                const { passwordHash, ...user } = d.data() as Record<string, any>;
                return { id: d.id, ...user };
            })
            .sort((a: any, b: any) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }

    async promoteToAdmin(userId: string) {
        const db = this.firebaseService.getDb();
        await db.collection('users').doc(userId).update({ role: 'admin' });
        return { message: 'User promoted to admin' };
    }
}
