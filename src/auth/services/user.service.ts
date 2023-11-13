import { HttpException, HttpStatus, Injectable, forwardRef, Inject } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "../user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user.entity";
import { Model } from "mongoose";
import { AuthService } from "./auth.service";

@Injectable()
export class UserService {
    private saltRounds = 10
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
    ) { }
    async createUser(user: CreateUserDto) {
        const hashPassword = await bcrypt.hash(user.password, this.saltRounds);
        return this.userModel.create({
            ...user,
            password: hashPassword
        })
    }

    async login(email: string) {
        const token = await this.authService._createToken({ email })

        return {
            ...token
        }
    }


    async getProfile(email: string) {
        return await this.findUserByEmail(email)
    }

    async findUserByEmail(email: string) {
        return this.userModel.findOne({ email }).select(['-password', '-refreshToken']).exec()
    }

    async findUserAndUpdate(email: string, updateData: any) {
        const hashRefreshToken = await bcrypt.hash(this.reverse(updateData.refreshToken), this.saltRounds)
        return this.userModel.findOneAndUpdate({ email }, { refreshToken: hashRefreshToken }, { new: true }).exec()
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

    private reverse(s: string) {
        return s.split('').reverse().join('');
    }
}