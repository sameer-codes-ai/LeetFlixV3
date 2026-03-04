import { Controller, Get, Param, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
    constructor(private leaderboardService: LeaderboardService) { }

    @Get('global')
    getGlobal(@Query('page') page = '1', @Query('limit') limit = '20') {
        return this.leaderboardService.getGlobalLeaderboard(+page, +limit);
    }

    @Get('show/:showId')
    getShowLeaderboard(
        @Param('showId') showId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.leaderboardService.getShowLeaderboard(showId, +page, +limit);
    }
}
