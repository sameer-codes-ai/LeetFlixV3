import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShowsService {
    constructor(
        private firebaseService: FirebaseService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) { }

    async getAllShows() {
        // Cache for 2 minutes — this is hit on every page load
        const cacheKey = 'shows:all';
        const cached = await this.cache.get<any[]>(cacheKey);
        if (cached) return cached;

        const db = this.firebaseService.getDb();
        const [showsSnap, seasonsSnap] = await Promise.all([
            db.collection('shows').get(),
            db.collection('seasons').get(),
        ]);

        const shows = showsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));

        const seasonsByShowId: Record<string, any[]> = {};
        seasonsSnap.docs.forEach((doc) => {
            const data = doc.data();
            if (!seasonsByShowId[data.showId]) seasonsByShowId[data.showId] = [];
            seasonsByShowId[data.showId].push({ id: doc.id, ...data });
        });

        const result = shows.map((show: any) => ({
            ...show,
            seasons: seasonsByShowId[show.id] || []
        }));

        await this.cache.set(cacheKey, result, 120000); // 2 min TTL
        return result;
    }

    async getShowBySlug(slug: string) {
        const cacheKey = `shows:slug:${slug}`;
        const cached = await this.cache.get<any>(cacheKey);
        if (cached) return cached;

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

        const result = { ...show, seasons };
        await this.cache.set(cacheKey, result, 120000);
        return result;
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
            if (posterUrl) {
                await existing.docs[0].ref.update({ posterUrl });
            }
            // Invalidate show caches after update
            await Promise.all([
                this.cache.del('shows:all'),
                this.cache.del(`shows:slug:${slug}`),
            ]);
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
        // Invalidate shows list cache
        await this.cache.del('shows:all');
        return id;
    }

    async updateShowPoster(showId: string, posterUrl: string): Promise<void> {
        const db = this.firebaseService.getDb();
        await db.collection('shows').doc(showId).update({ posterUrl });
        // Invalidate caches
        await this.cache.del('shows:all');
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
        // Invalidate shows cache (seasons embedded in show data)
        await this.cache.del('shows:all');
        return id;
    }
}
