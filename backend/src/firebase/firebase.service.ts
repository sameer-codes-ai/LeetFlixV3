import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private db: admin.firestore.Firestore;

    onModuleInit() {
        if (admin.apps.length === 0) {
            const serviceAccountPath = path.resolve(
                process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
                './firebase-service-account.json',
            );

            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(
                    fs.readFileSync(serviceAccountPath, 'utf8'),
                );
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                this.logger.log('Firebase initialized with service account');
            } else {
                // Initialize with default app (for local dev without service account)
                admin.initializeApp({
                    projectId: 'leetflix-demo',
                });
                this.logger.warn(
                    'Firebase service account not found. Using demo mode. Place firebase-service-account.json in backend root.',
                );
            }
        }

        this.db = admin.firestore();
    }

    getDb(): admin.firestore.Firestore {
        return this.db;
    }
}
