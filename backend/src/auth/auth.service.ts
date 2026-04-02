import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
    constructor(
        private firebaseService: FirebaseService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const db = this.firebaseService.getDb();

        // Check if email already exists
        const emailSnap = await db
            .collection('users')
            .where('email', '==', dto.email)
            .limit(1)
            .get();

        if (!emailSnap.empty) {
            throw new ConflictException('Email already registered');
        }

        // Check if username taken
        const usernameSnap = await db
            .collection('users')
            .where('username', '==', dto.username)
            .limit(1)
            .get();

        if (!usernameSnap.empty) {
            throw new ConflictException('Username already taken');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);
        const userId = uuidv4();

        await db.collection('users').doc(userId).set({
            id: userId,
            email: dto.email,
            username: dto.username,
            passwordHash,
            role: 'user',
            totalScore: 0,
            quizzesAttempted: 0,
            createdAt: new Date().toISOString(),
        });

        const token = this.signToken(userId, dto.email, 'user');
        return {
            access_token: token,
            user: { id: userId, email: dto.email, username: dto.username, role: 'user' },
        };
    }

    async login(dto: LoginDto) {
        const db = this.firebaseService.getDb();

        const isEmail = dto.identifier.includes('@');

        const snap = await db
            .collection('users')
            .where(isEmail ? 'email' : 'username', '==', dto.identifier)
            .limit(1)
            .get();

        if (snap.empty) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const userDoc = snap.docs[0];
        const user = userDoc.data();

        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.signToken(userDoc.id, user.email, user.role);
        return {
            access_token: token,
            user: {
                id: userDoc.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        };
    }

    async googleLogin(idToken: string) {
        // Verify the Firebase Google ID token using the Admin SDK
        let decoded: admin.auth.DecodedIdToken;
        try {
            decoded = await admin.auth().verifyIdToken(idToken);
        } catch {
            throw new UnauthorizedException('Invalid Google token');
        }

        const { email, name, uid } = decoded;
        const db = this.firebaseService.getDb();

        // Check if a user with this email already exists
        const emailSnap = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        let userId: string;
        let username: string;
        let role: string = 'user';

        if (!emailSnap.empty) {
            // Existing user — log them in
            const existingUser = emailSnap.docs[0].data();
            userId = emailSnap.docs[0].id;
            username = existingUser['username'];
            role = existingUser['role'] || 'user';
        } else {
            // New user — create account using Firebase UID as the Firestore doc ID
            userId = uid;
            // Derive a username from display name or email prefix; keep it clean
            const rawName = name || (email ? email.split('@')[0] : 'user');
            username = rawName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24);

            // Ensure username uniqueness (append random digits if needed)
            const usernameSnap = await db
                .collection('users')
                .where('username', '==', username)
                .limit(1)
                .get();
            if (!usernameSnap.empty) {
                username = `${username}_${Math.floor(Math.random() * 9000) + 1000}`;
            }

            await db.collection('users').doc(userId).set({
                id: userId,
                email,
                username,
                role: 'user',
                totalScore: 0,
                quizzesAttempted: 0,
                createdAt: new Date().toISOString(),
                provider: 'google',
            });
        }

        const token = this.signToken(userId, email || '', role);
        return {
            access_token: token,
            user: { id: userId, email, username, role },
        };
    }

    private signToken(userId: string, email: string, role: string) {
        return this.jwtService.sign({ sub: userId, email, role });
    }
}

