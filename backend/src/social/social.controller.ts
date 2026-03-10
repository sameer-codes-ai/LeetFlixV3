import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
export class SocialController {
    constructor(private socialService: SocialService) { }

    /** Follow a user */
    @Post('follow/:targetUserId')
    @UseGuards(JwtAuthGuard)
    follow(@Req() req: any, @Param('targetUserId') targetUserId: string) {
        return this.socialService.follow(req.user.id, targetUserId);
    }

    /** Unfollow a user */
    @Delete('follow/:targetUserId')
    @UseGuards(JwtAuthGuard)
    unfollow(@Req() req: any, @Param('targetUserId') targetUserId: string) {
        return this.socialService.unfollow(req.user.id, targetUserId);
    }

    /** Check if current user follows target */
    @Get('follow/:targetUserId/status')
    @UseGuards(JwtAuthGuard)
    isFollowing(@Req() req: any, @Param('targetUserId') targetUserId: string) {
        return this.socialService.isFollowing(req.user.id, targetUserId);
    }

    /** Get followers of a user */
    @Get(':userId/followers')
    getFollowers(@Param('userId') userId: string) {
        return this.socialService.getFollowers(userId);
    }

    /** Get following list of a user */
    @Get(':userId/following')
    getFollowing(@Param('userId') userId: string) {
        return this.socialService.getFollowing(userId);
    }

    /** Get follower/following counts */
    @Get(':userId/counts')
    getFollowCounts(@Param('userId') userId: string) {
        return this.socialService.getFollowCounts(userId);
    }
}
