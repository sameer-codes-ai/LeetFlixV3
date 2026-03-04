import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('forum')
export class ForumController {
    constructor(private forumService: ForumService) { }

    @Get('posts')
    getPosts(@Query('showId') showId?: string, @Query('page') page = '1') {
        return this.forumService.getPosts(showId, +page);
    }

    @Get('posts/:id')
    getPost(@Param('id') id: string) {
        return this.forumService.getPost(id);
    }

    @Post('posts')
    @UseGuards(JwtAuthGuard)
    createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
        return this.forumService.createPost(user.id, user.username, dto);
    }

    @Post('posts/:id/comments')
    @UseGuards(JwtAuthGuard)
    createComment(
        @Param('id') postId: string,
        @CurrentUser() user: any,
        @Body() dto: CreateCommentDto,
    ) {
        return this.forumService.createComment(
            postId,
            user.id,
            user.username,
            dto,
        );
    }

    @Delete('posts/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    deletePost(@Param('id') id: string) {
        return this.forumService.deletePost(id);
    }

    @Patch('posts/:id/lock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    lockPost(@Param('id') id: string) {
        return this.forumService.lockPost(id);
    }

    @Patch('posts/:id/unlock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    unlockPost(@Param('id') id: string) {
        return this.forumService.unlockPost(id);
    }
}
