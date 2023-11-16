import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../user.dto';
import { ControllerAuthGuard } from '../guards/auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @UseGuards(ControllerAuthGuard)
  @Get('me')
  async getProfile(@Req() { email }: { email: string }) {
    return this.userService.getProfile(email);
  }

  @Get()
  async getAllUser() {
    return this.userService.getAllUser();
  }

  @Post('login')
  async login(@Body() { email }: { email: string }) {
    return this.userService.login(email);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('follow')
  async followUser(
    @Body() { followUserId }: { followUserId: string },
    @Req() { _id }: { _id: string },
  ) {
    return this.userService.followUser(_id, followUserId);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('unfollow')
  async unfollowUser(
    @Body() { followUserId }: { followUserId: string },
    @Req() { _id }: { _id: string },
  ) {
    return this.userService.unfollowUser(_id, followUserId);
  }
}
