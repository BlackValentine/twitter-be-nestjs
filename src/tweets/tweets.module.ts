import { MiddlewareConsumer, Module } from "@nestjs/common";
import { TweetsController } from "./tweets.controller";
import { TweetsService } from "./tweets.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Tweet, TweetSchema } from "./entities/tweets.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "src/auth/services/auth.service";
import { UserService } from "src/auth/services/user.service";
import { User, UserSchema } from "src/auth/user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Hashtag, HashtagSchema } from "./entities/hashtags.entity";
import { Bookmark, BookmarkSchema } from "./entities/bookmarks.entity";
import { CreateTweetMiddleware } from "./middlewares/createTweet.middleware";

@Module({
    imports: [MongooseModule.forFeature([
        { name: Tweet.name, schema: TweetSchema },
        { name: User.name, schema: UserSchema },
        { name: Hashtag.name, schema: HashtagSchema },
        { name: Bookmark.name, schema: BookmarkSchema }
    ]
    ),
    JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
            return {
                secret: configService.get<string>('SECRET_KEY'),
            };
        },
        inject: [ConfigService],
    }),],
    controllers: [TweetsController],
    providers: [TweetsService, AuthService, UserService]
})
export class TweetsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CreateTweetMiddleware).forRoutes('tweets/create');
    }
}