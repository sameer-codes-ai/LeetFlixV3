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

        // Detect whether the identifier is an email or a username
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

    private signToken(userId: string, email: string, role: string) {
        return this.jwtService.sign({ sub: userId, email, role });
    }
}
