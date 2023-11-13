import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ControllerAuthGuard } from "../guards/auth.guard";
import { ResetPasswordDto } from "../user.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('refresh-token')
  async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('send-verify-link')
  async sendVerifyLink(@Req() { email }: { email: string }) {
    return this.authService.createVerifyLink(email);
  }

  @Post('verify-user')
  async verifyUser(@Body() { verifyToken }: { verifyToken: string }) {
    return this.authService.verifyUser(verifyToken);
  }

  @Post('send-forgot-password-link')
  async sendForgotPasswordLink(@Body() { email }: { email: string }) {
    return this.authService.createForgotPasswordLink(email);
  }

  @Post('verify-forgot-password')
  async verifyForgotPassword(@Body() { verifyToken }: { verifyToken: string }) {
    return this.authService.verifyForgotPassword(verifyToken);
  }

  @Post('reset-password')
  async resetPassword(@Body() { password, confirmPassword, forgotPasswordToken }: ResetPasswordDto) {
    return this.authService.resetPassword(
      password,
      confirmPassword,
      forgotPasswordToken,
    );
  }
}