import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private db: admin.firestore.Firestore;

    onModuleInit() {
        if (admin.apps.length > 0) {
            // Already initialized (e.g. hot-reload) — just grab the Firestore instance
            this.db = admin.firestore();
            return;
        }

        let credential: admin.credential.Credential | undefined;

        // ── Priority 1: Inline JSON string via env var (Railway / Render / Heroku) ──
        const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (inlineJson) {
            try {
                const serviceAccount = JSON.parse(inlineJson);
                credential = admin.credential.cert(serviceAccount);
                this.logger.log('Firebase initialised from FIREBASE_SERVICE_ACCOUNT env var');
            } catch {
                this.logger.error('FIREBASE_SERVICE_ACCOUNT env var is not valid JSON');
            }
        }

        // ── Priority 2: Path to a JSON file (local dev with service account file) ──
        if (!credential) {
            const serviceAccountPath = path.resolve(
                process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
                './firebase-service-account.json',
            );

            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(
                    fs.readFileSync(serviceAccountPath, 'utf8'),
                );
                credential = admin.credential.cert(serviceAccount);
                this.logger.log(`Firebase initialised from file: ${serviceAccountPath}`);
            }
        }

        if (credential) {
            admin.initializeApp({ credential });
        } else {
            // ── Fallback: no credentials (demo / CI mode) ──
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'leetflix-demo',
            });
            this.logger.warn(
                'Firebase: no service account found. Set FIREBASE_SERVICE_ACCOUNT env var in production.',
            );
        }

        this.db = admin.firestore();
    }

    getDb(): admin.firestore.Firestore {
        return this.db;
    }
}
