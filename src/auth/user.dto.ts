import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MaxLength(20)
  @MinLength(8)
  password: string;

  @MaxLength(20)
  @MinLength(8)
  confirmPassword: string;

  @MaxLength(100)
  name: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class ResetPasswordDto {
  @MaxLength(20)
  @MinLength(8)
  password: string;

  @MaxLength(20)
  @MinLength(8)
  confirmPassword: string;

  forgotPasswordToken: string;
}
