import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ShowsService } from '../shows/shows.service';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';

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

        const showIdCache: Record<string, string> = {};
        const seasonIdCache: Record<string, string> = {};
        const seasonCountIncrement: Record<string, number> = {};
        // Cache existing questions per season to allow O(1) duplicate checks
        const existingQuestionsBySeason: Record<string, Set<string>> = {};

        const BATCH_SIZE = 499;

        for (let i = 0; i < valid.length; i += BATCH_SIZE) {
            const chunk = valid.slice(i, i + BATCH_SIZE);
            const batch = db.batch();

            for (const { entry, idx } of chunk) {
                try {
                    // Get/create show
                    if (!showIdCache[entry.showName]) {
                        showIdCache[entry.showName] =
                            await this.showsService.getOrCreateShow(
                                entry.showName,
                                entry.posterUrl,
                            );
                    } else if (entry.posterUrl) {
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

                    // Pre-fetch questions for this season once if not cached yet
                    if (!existingQuestionsBySeason[seasonId]) {
                        const existingSnap = await db
                            .collection('questions')
                            .where('seasonId', '==', seasonId)
                            .select('question')
                            .get();
                        const questionSet = new Set<string>();
                        existingSnap.docs.forEach((doc) => {
                            const qText = doc.data().question;
                            if (qText) questionSet.add(qText);
                        });
                        existingQuestionsBySeason[seasonId] = questionSet;
                    }

                    const questionSet = existingQuestionsBySeason[seasonId];

                    // O(1) memory lookup for duplicate questions instead of network call
                    if (questionSet.has(entry.question)) {
                        result.failed++;
                        result.errors.push({
                            index: idx,
                            entry,
                            reason: 'Duplicate question (already exists in this season)',
                        });
                        continue;
                    }

                    // Add question to set to prevent duplicates within the same bulk upload batch
                    questionSet.add(entry.question);

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

        // Update question counts on seasons atomically with FieldValue.increment
        if (Object.keys(seasonCountIncrement).length > 0) {
            const countBatch = db.batch();
            for (const [seasonId, increment] of Object.entries(seasonCountIncrement)) {
                const seasonRef = db.collection('seasons').doc(seasonId);
                countBatch.update(seasonRef, {
                    questionCount: FieldValue.increment(increment),
                });
            }
            await countBatch.commit();
        }

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
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return dateB.localeCompare(dateA);
            });
    }

    async promoteToAdmin(userId: string) {
        const db = this.firebaseService.getDb();
        await db.collection('users').doc(userId).update({ role: 'admin' });
        return { message: 'User promoted to admin' };
    }
}
