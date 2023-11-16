import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async _createToken({ email, _id }, refresh = false) {
    //convert email to access token
    const accessToken = this.jwtService.sign({
      email,
      _id
    });
    if (!refresh) {
      const refreshToken = this.jwtService.sign(
        { email },
        {
          secret: process.env.SECRET_KEY_REFRESH,
          expiresIn: process.env.EXPIRESIN_REFRESH,
        },
      );

      await this.userService.findUserAndUpdate(email, {
        refreshToken: refreshToken,
      });

      return {
        email,
        expiresIn: process.env.EXPIRESIN,
        expiresInRefresh: process.env.EXPIRESIN_REFRESH,
        accessToken,
        refreshToken,
      };
    } else {
      return {
        expiresIn: process.env.EXPIRESIN,
        accessToken,
      };
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.SECRET_KEY_REFRESH,
      });
      const user = await this.userService.getUserByRefresh(
        refreshToken,
        payload.email,
      );
      const token = await this._createToken(user, true);
      return {
        email: user.email,
        ...token,
      };
    } catch (e) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async validateUser(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async createVerifyLink(email: string) {
    const verifyToken = this.jwtService.sign(
      { email },
      {
        secret: process.env.SECRET_VERIFY_EMAIL,
        expiresIn: process.env.EXPIRESIN_VERIFY_EMAIL,
      },
    );

    await this.userModel.findOneAndUpdate({ email }, { verifyToken });

    return {
      verifyToken,
    };
  }

  async verifyUser(verifyToken: string) {
    const user = await this.userModel.findOne({ verifyToken });
    if (!user) {
      throw new HttpException(
        'Invalid token or user already actived',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const result = await this.userModel
      .findOneAndUpdate(
        { email: user.email },
        {
          verifyToken: '',
          active: 1,
        },
        {
          new: true,
        },
      )
      .select(['-password', '-refreshToken']);

    return result;
  }

  async createForgotPasswordLink(email: string) {
    const verifyToken = this.jwtService.sign(
      { email },
      {
        secret: process.env.SECRET_FORGOT_PASSWORD,
        expiresIn: process.env.EXPIRESIN_FORGOT_PASSWORD,
      },
    );

    await this.userModel.findOneAndUpdate({ email }, { verifyToken });

    return {
      verifyToken,
    };
  }

  async verifyForgotPassword(verifyToken: string) {
    const user = await this.userModel.findOne({
      forgotPasswordToken: verifyToken,
    });
    if (!user) {
      throw new HttpException(
        'Invalid token or user already actived',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      message: 'Valid token',
    };
  }

  async resetPassword(
    password: string,
    confirmPassword: string,
    forgotPasswordToken: string,
  ) {
    if (password !== confirmPassword) {
      throw new HttpException(
        'Password and confirm password are not same',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { email } = this.jwtService.verify(forgotPasswordToken);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const result = await this.userModel
      .findOneAndUpdate(
        { email },
        {
          password: bcrypt.hash(password, 10),
          forgotPasswordToken: '',
        },
        { new: true },
      )
      .select([
        '-password',
        '-refreshToken',
        '-verifyToken',
        '-forgotPasswordToken',
      ]);

    return result;
  }
}
