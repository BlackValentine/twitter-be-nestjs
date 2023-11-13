import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../services/auth.service";

@Injectable()
export class ControllerAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly authService: AuthService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const { accesstoken } = request.headers;

        try {
            const { email } = this.jwtService.verify(accesstoken);

            const user = await this.authService.validateUser(email);

            if (!user) {
                throw new ForbiddenException('Invalid authorization token')
            }
            request.email = email;
            return true;
        } catch (error) {
            console.log('error')
        }
    }
}