import { IsString, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class SubmitQuizDto {
    @IsString()
    seasonId: string;

    @IsString()
    showId: string;

    @IsArray()
    @ArrayMinSize(1)
    answers: { questionId: string; selected: string }[];
}
