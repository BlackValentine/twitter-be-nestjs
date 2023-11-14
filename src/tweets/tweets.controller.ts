import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { TweetsService } from "./tweets.service";
import { CreateTweetDto } from "./tweets.dto";
import { ControllerAuthGuard } from "src/auth/guards/auth.guard";

@Controller('tweets')
export class TweetsController {
    constructor(private readonly tweetsService: TweetsService) { }

    @Get(':id')
    async getTweetById(@Param() _id: string) {
        return this.tweetsService.getTweetById(_id);
    }

    @UseGuards(ControllerAuthGuard)
    @Post('create')
    async createTweet(@Body() tweet: CreateTweetDto, @Req() { _id }: { _id: string }) {
        return this.tweetsService.createTweet(tweet, _id);
    }

    @UseGuards(ControllerAuthGuard)
    @Post('bookmark')
    async bookmarkTweet(@Body() { tweetId }: { tweetId: string }, @Req() { _id }: { _id: string }) {
        return this.tweetsService.bookmarkTweet(tweetId, _id);
    }

    @UseGuards(ControllerAuthGuard)
    @Delete('unbookmark')
    async unBookmarkTweet(@Body() { tweetId }: { tweetId: string }, @Req() { _id }: { _id: string }) {
        return this.tweetsService.unBookmarkTweet(tweetId, _id);
    }
}