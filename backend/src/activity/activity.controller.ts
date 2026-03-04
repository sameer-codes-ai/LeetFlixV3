import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activity')
export class ActivityController {
    constructor(private activityService: ActivityService) { }

    @Get(':userId')
    @UseGuards(JwtAuthGuard)
    getUserActivity(
        @Param('userId') userId: string,
        @Query('year') year?: string,
    ) {
        return this.activityService.getUserActivity(userId, year);
    }
}
