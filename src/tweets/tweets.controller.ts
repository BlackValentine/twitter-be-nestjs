import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './tweets.dto';
import { ControllerAuthGuard } from 'src/auth/guards/auth.guard';
import { TweetType } from './tweets.type';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Get(':id')
  async getTweetById(@Param() _id: string) {
    return this.tweetsService.getTweetById(_id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('create')
  async createTweet(
    @Body() tweet: CreateTweetDto,
    @Req() { _id }: { _id: string },
  ) {
    return this.tweetsService.createTweet(tweet, _id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('bookmark')
  async bookmarkTweet(
    @Body() { tweetId }: { tweetId: string },
    @Req() { _id }: { _id: string },
  ) {
    return this.tweetsService.bookmarkTweet(tweetId, _id);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete('unbookmark')
  async unBookmarkTweet(
    @Body() { tweetId }: { tweetId: string },
    @Req() { _id }: { _id: string },
  ) {
    return this.tweetsService.unBookmarkTweet(tweetId, _id);
  }

  @UseGuards(ControllerAuthGuard)
  @Get(':id/childrent')
  async getTweetChildrent(
    @Body()
    { limit, page, type }: { limit: number; page: number; type: TweetType },
    @Param() { id }: { id: string },
  ) {
    return this.tweetsService.getTweetChildrent(limit, page, type, id);
  }

  @UseGuards(ControllerAuthGuard)
  @Get('')
  async getTweetNewFeeds(
    @Body()
    { limit, page }: { limit: number; page: number },
    @Req() { _id }: { _id: string },
  ) {
    return this.tweetsService.getTweetNewFeeds(_id, limit, page);
  }
}
