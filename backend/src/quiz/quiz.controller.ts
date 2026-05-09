import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
export class QuizController {
    constructor(private quizService: QuizService) { }

    @Get('season/:seasonId/questions')
    @UseGuards(JwtAuthGuard)
    getQuestions(@Param('seasonId') seasonId: string) {
        return this.quizService.getSeasonQuestions(seasonId);
    }

    @Get('show/:showId/all-questions')
    @UseGuards(JwtAuthGuard)
    getAllShowQuestions(@Param('showId') showId: string) {
        return this.quizService.getAllShowQuestions(showId);
    }

    @Post('attempt')
    @UseGuards(JwtAuthGuard)
    submitQuiz(@CurrentUser() user: any, @Body() dto: SubmitQuizDto) {
        return this.quizService.submitQuiz(user.id, dto);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    getHistory(@CurrentUser() user: any) {
        return this.quizService.getAttemptHistory(user.id);
    }

    @Get('attempt/:id')
    @UseGuards(JwtAuthGuard)
    getAttempt(@Param('id') id: string) {
        return this.quizService.getAttempt(id);
    }
}
