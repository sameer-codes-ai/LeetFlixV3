import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShowsService {
    constructor(private firebaseService: FirebaseService) { }

    async getAllShows() {
        const db = this.firebaseService.getDb();
        const snap = await db.collection('shows').get();
        return snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    async getShowBySlug(slug: string) {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('shows')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snap.empty) throw new NotFoundException('Show not found');

        const showDoc = snap.docs[0];
        const show = { id: showDoc.id, ...showDoc.data() };

        const seasonsSnap = await db
            .collection('seasons')
            .where('showId', '==', showDoc.id)
            .get();

        const seasons = seasonsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => a.order - b.order);

        return { ...show, seasons };
    }

    async getOrCreateShow(name: string, posterUrl?: string): Promise<string> {
        const db = this.firebaseService.getDb();
        const slug = name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const existing = await db
            .collection('shows')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (!existing.empty) {
            // Update posterUrl if provided on an existing show
            if (posterUrl) {
                await existing.docs[0].ref.update({ posterUrl });
            }
            return existing.docs[0].id;
        }

        const id = uuidv4();
        await db.collection('shows').doc(id).set({
            id,
            name,
            slug,
            description: '',
            posterUrl: posterUrl || '',
            createdAt: new Date().toISOString(),
        });
        return id;
    }

    async updateShowPoster(showId: string, posterUrl: string): Promise<void> {
        const db = this.firebaseService.getDb();
        await db.collection('shows').doc(showId).update({ posterUrl });
    }

    async getOrCreateSeason(showId: string, seasonName: string): Promise<string> {
        const db = this.firebaseService.getDb();
        const existing = await db
            .collection('seasons')
            .where('showId', '==', showId)
            .where('name', '==', seasonName)
            .limit(1)
            .get();

        if (!existing.empty) return existing.docs[0].id;

        const seasonsSnap = await db
            .collection('seasons')
            .where('showId', '==', showId)
            .get();

        const id = uuidv4();
        await db.collection('seasons').doc(id).set({
            id,
            showId,
            name: seasonName,
            order: seasonsSnap.size + 1,
            questionCount: 0,
            createdAt: new Date().toISOString(),
        });
        return id;
    }
}
