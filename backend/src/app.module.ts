import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShowsModule } from './shows/shows.module';
import { QuizModule } from './quiz/quiz.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ActivityModule } from './activity/activity.module';
import { ForumModule } from './forum/forum.module';
import { AdminModule } from './admin/admin.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // In-memory cache — works with zero config, upgrade to Redis via env later
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // default 60 seconds
      max: 500,   // max 500 cached items
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    ShowsModule,
    QuizModule,
    LeaderboardModule,
    ActivityModule,
    ForumModule,
    AdminModule,
    SocialModule,
  ],
})
export class AppModule { }

