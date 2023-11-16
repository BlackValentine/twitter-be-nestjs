import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.body.email || !req.body.password) {
            throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
        }

        const userInDb = await this.userModel.findOne(
            { email: req.body.email },
        );

        if (!userInDb) {
            throw new HttpException('User is not exist', HttpStatus.BAD_REQUEST);
        }

        const matchPassword = await bcrypt.compare(req.body.password, userInDb.password)

        if (!matchPassword) {
            throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
        }
        next();
    }
}