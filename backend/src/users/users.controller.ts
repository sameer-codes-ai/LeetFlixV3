import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser() user: any) {
        return this.usersService.getMe(user.id);
    }

    @Get(':id/stats')
    @UseGuards(JwtAuthGuard)
    getStats(@Param('id') id: string) {
        return this.usersService.getUserStats(id);
    }

    @Get(':id/profile')
    getPublicProfile(@Param('id') id: string) {
        return this.usersService.getPublicProfile(id);
    }
}
