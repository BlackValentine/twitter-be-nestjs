import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';

@Injectable()
export class CreateUserMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const userInDb = await this.userModel.findOne(
            { email: req.body.email },
        );

        if (userInDb) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        if (req.body.password !== req.body.confirmPassword) {
            throw new HttpException('Password and confirm password are not same', HttpStatus.BAD_REQUEST);
        }
        next();
    }
}