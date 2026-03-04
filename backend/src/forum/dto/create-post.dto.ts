import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    showId: string;

    @IsString()
    @MinLength(3)
    @MaxLength(150)
    title: string;

    @IsString()
    @MinLength(10)
    content: string;
}
