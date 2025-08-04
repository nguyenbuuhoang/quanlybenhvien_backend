
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  password: string;
}