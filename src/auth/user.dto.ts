export class CreateUserDto {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
}

export class LoginDto {
    email: string;
    password: string;
}