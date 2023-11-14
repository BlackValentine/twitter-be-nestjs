import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tweet } from '../entities/tweets.entity';
import { MediaType, TweetType } from '../tweets.type';
import { ObjectId } from 'mongodb';
import { isEmpty } from 'lodash';
import { numberEnumToArray } from 'src/utils';

@Injectable()
export class CreateTweetMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const { type, parentId, hashtags, mentions, content, medias } = req.body

        const mediaTypes = numberEnumToArray(MediaType)

        //If type is retweet, comment, quoteTweet, parentId must be tweetId of parent tweet
        if ([TweetType.Comment, TweetType.Retweet, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(parentId)) {
            if (!parentId) throw new HttpException('Parent id must be a tweet id', HttpStatus.BAD_REQUEST)
        }
        if (type === TweetType.Tweet && parentId !== null) {
            throw new HttpException('Parent id must be null', HttpStatus.BAD_REQUEST)
        }

        //Nếu type là retweet, comment, quoteTweet thì parent_id phải là tweet_id của tweet cha
        if (
            [TweetType.Comment, TweetType.Tweet, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            content === ''
        ) {
            throw new HttpException('Content must be a non empty string', HttpStatus.BAD_REQUEST)
        }
        if (type === TweetType.Retweet && content !== '') {
            throw new HttpException('Content must be an empty string', HttpStatus.BAD_REQUEST)
        }

        if (!hashtags.every((item: any) => typeof item === 'string')) {
            throw new HttpException('Hashtags must be an array of string', HttpStatus.BAD_REQUEST)
        }

        if (!mentions.every((item: any) => ObjectId.isValid(item))) {
            throw new HttpException('Mentions must be an array of user id', HttpStatus.BAD_REQUEST)
        }

        if (
            medias.some((item: any) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
        ) {
            throw new HttpException('Medias must be an array of media object', HttpStatus.BAD_REQUEST)
        }

        next();
    }
}