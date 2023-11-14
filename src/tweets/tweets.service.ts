import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tweet } from "./entities/tweets.entity";
import { Model } from "mongoose";
import { CreateTweetDto } from "./tweets.dto";
import { ObjectId } from 'mongodb';
import { Hashtag } from "./entities/hashtags.entity";
import { Bookmark } from "./entities/bookmarks.entity";

@Injectable()
export class TweetsService {
    constructor(
        @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>,
        @InjectModel(Hashtag.name) private readonly hashtagModel: Model<Hashtag>,
        @InjectModel(Bookmark.name) private readonly bookMarkModel: Model<Bookmark>
    ) { }

    async getTweetById(_id: string) {
        return this.tweetModel.findOne({ _id: new ObjectId(_id) })
    }

    async checkAndCreateHashtag(hashtags: string[]) {
        const hastagDocuments = await Promise.all(
            hashtags.map((hashtag) => {
                return this.hashtagModel.findOneAndUpdate(
                    {
                        name: hashtag
                    },
                    {
                        $setOnInsert: { name: hashtag }
                    },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                )
            })
        )
        return hastagDocuments.map((hashtag) => hashtag._id)
    }

    async createTweet(tweet: CreateTweetDto, userID: string) {
        const hashtags = await this.checkAndCreateHashtag(tweet.hashtags)
        const result = await this.tweetModel.create({
            audience: tweet.audience,
            content: tweet.content,
            medias: tweet.medias,
            hashtags: hashtags,
            mentions: tweet.mentions,
            parent_id: tweet.parentId,
            type: tweet.type,
            userId: new ObjectId(userID)
        })
        return result
    }

    async bookmarkTweet(tweetId: string, userId: string) {
        const result = await this.bookMarkModel.findOneAndUpdate(
            {
                userId: new ObjectId(userId),
                tweetId: new ObjectId(tweetId)
            },
            {
                $setOnInsert: {
                    userId: new ObjectId(userId),
                    tweetId: new ObjectId(tweetId)
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        )
        return result
    }

    async unBookmarkTweet(tweetId: string, userId: string) {
        const result = await this.bookMarkModel.findOneAndDelete({
            userId: new ObjectId(userId),
            tweetId: new ObjectId(tweetId)
        })
        if (!result) {
            return {
                message: 'This tweet was not bookmarked yet.'
            }
        }
        return {
            data: result,
            message: `Unbookmark tweet ${tweetId} successfully !!!`
        }
    }
}