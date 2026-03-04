import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private firebaseService: FirebaseService,
    ) {
        const opts: StrategyOptionsWithoutRequest = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        };
        super(opts);
    }

    async validate(payload: { sub: string; email: string; role: string }) {
        const db = this.firebaseService.getDb();
        const userDoc = await db.collection('users').doc(payload.sub).get();

        if (!userDoc.exists) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            ...(userDoc.data() as Record<string, any>),
        };
    }
}
