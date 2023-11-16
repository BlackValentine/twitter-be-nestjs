import {
  HttpException,
  HttpStatus,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { ObjectId } from 'mongodb';
import { Follow } from '../entities/follower.entity';

@Injectable()
export class UserService {
  private saltRounds = 10;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  async createUser(user: CreateUserDto) {
    const hashPassword = await bcrypt.hash(user.password, this.saltRounds);
    return this.userModel.create({
      ...user,
      password: hashPassword,
    });
  }

  async login(email: string) {
    const user = await this.userModel.findOne({ email: email });

    const token = await this.authService._createToken({ email, _id: user._id, active: user.active });

    return {
      ...token,
    };
  }

  async getProfile(email: string) {
    return await this.findUserByEmail(email);
  }

  async findUserByEmail(email: string) {
    return this.userModel
      .findOne({ email })
      .select(['-password', '-refreshToken'])
      .exec();
  }

  async findUserAndUpdate(email: string, updateData: any) {
    const hashRefreshToken = await bcrypt.hash(
      this.reverse(updateData.refreshToken),
      this.saltRounds,
    );
    return this.userModel
      .findOneAndUpdate(
        { email },
        { refreshToken: hashRefreshToken },
        { new: true },
      )
      .exec();
  }

  async getUserByRefresh(refreshToken: string, email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const isEqual = await bcrypt.compareSync(
      this.reverse(refreshToken),
      user.refreshToken,
    );

    if (!isEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async getAllUser() {
    return this.userModel.find().select('-password').exec();
  }

  async followUser(id: string, followUserId: string) {
    const result = await this.followModel.findOneAndUpdate(
      {
        userId: new ObjectId(id),
        followUserId: new ObjectId(followUserId),
      },
      {
        $setOnInsert: {
          userId: new ObjectId(id),
          followUserId: new ObjectId(followUserId),
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
    return result;
  }

  async unfollowUser(id: string, followUserId: string) {
    const result = await this.followModel.findOneAndDelete({
      userId: new ObjectId(id),
      followUserId: new ObjectId(followUserId),
    });
    if (!result) {
      return {
        message: 'This follow was not exist.',
      };
    }
    return {
      data: result,
      message: `Unfollow user: ${followUserId} successfully !!!`,
    };
  }

  private reverse(s: string) {
    return s.split('').reverse().join('');
  }
}
