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
            const { _id, email, active } = this.jwtService.verify(accesstoken);

            const user = await this.authService.validateUser(email);

            if (!user) {
                throw new ForbiddenException('Invalid authorization token')
            }
            request.email = email;
            request._id = _id;
            request.active = active;
            
            return true;
        } catch (error) {
            console.log(error)
        }
    }
}