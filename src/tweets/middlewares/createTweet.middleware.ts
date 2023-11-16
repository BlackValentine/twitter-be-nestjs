import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tweet } from '../entities/tweets.entity';
import {
  MediaType,
  RequestWithAuth,
  TweetAudience,
  TweetType,
} from '../tweets.type';
import { ObjectId } from 'mongodb';
import { isEmpty } from 'lodash';
import { numberEnumToArray } from 'src/utils';

@Injectable()
export class CreateTweetMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>,
  ) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    const {
      type,
      parentId,
      hashtags,
      mentions,
      content,
      medias,
      tweetCircle,
      audience,
    } = req.body;

    const mediaTypes = numberEnumToArray(MediaType);

    if (!req.active) {
        throw new HttpException('You should active your account before create a tweet', HttpStatus.BAD_REQUEST)
    }
      
    if (
      [TweetType.Comment, TweetType.Retweet, TweetType.QuoteTweet].includes(
        type,
      ) &&
      !ObjectId.isValid(parentId)
    ) {
      //If type is retweet, comment, quoteTweet, parentId must be tweetId of parent tweet
      if (!parentId)
        throw new HttpException(
          'Parent id must be a tweet id',
          HttpStatus.BAD_REQUEST,
        );
    }
    if (type === TweetType.Tweet && parentId !== null) {
      throw new HttpException('Parent id must be null', HttpStatus.BAD_REQUEST);
    }

    //Nếu type là retweet, comment, quoteTweet thì parent_id phải là tweet_id của tweet cha
    if (
      [TweetType.Comment, TweetType.Tweet, TweetType.QuoteTweet].includes(
        type,
      ) &&
      isEmpty(hashtags) &&
      isEmpty(mentions) &&
      content === ''
    ) {
      throw new HttpException(
        'Content must be a non empty string',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (type === TweetType.Retweet && content !== '') {
      throw new HttpException(
        'Content must be an empty string',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!hashtags.every((item: any) => typeof item === 'string')) {
      throw new HttpException(
        'Hashtags must be an array of string',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!mentions.every((item: any) => ObjectId.isValid(item))) {
      throw new HttpException(
        'Mentions must be an array of user id',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      medias.some((item: any) => {
        return typeof item.url !== 'string' || !mediaTypes.includes(item.type);
      })
    ) {
      throw new HttpException(
        'Medias must be an array of media object',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (audience === TweetAudience.Everyone && tweetCircle) {
      throw new HttpException(
        'Tweet Circle should be null when this tweet sharing for everyone.',
        HttpStatus.BAD_REQUEST,
      );
    }
    next();
  }
}
