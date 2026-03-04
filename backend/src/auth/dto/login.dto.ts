import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    identifier: string; // accepts username OR email

    @IsString()
    @MinLength(6)
    password: string;
}
