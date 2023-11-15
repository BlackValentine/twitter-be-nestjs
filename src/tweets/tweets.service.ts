import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tweet } from "./entities/tweets.entity";
import { Model } from "mongoose";
import { CreateTweetDto } from "./tweets.dto";
import { ObjectId } from 'mongodb';
import { Hashtag } from "./entities/hashtags.entity";
import { Bookmark } from "./entities/bookmarks.entity";
import { TweetType } from "./tweets.type";

@Injectable()
export class TweetsService {
    constructor(
        @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>,
        @InjectModel(Hashtag.name) private readonly hashtagModel: Model<Hashtag>,
        @InjectModel(Bookmark.name) private readonly bookMarkModel: Model<Bookmark>
    ) { }

    async getTweetById(_id: string) {
        const [tweet] = await this.tweetModel.aggregate<Tweet>([
            {
                '$match': {
                    '_id': new ObjectId(_id)
                }
            }, {
                '$lookup': {
                    'from': 'hashtags',
                    'localField': 'hashtags',
                    'foreignField': '_id',
                    'as': 'hashtags'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'mentions',
                    'foreignField': '_id',
                    'as': 'mentions'
                }
            }, {
                '$addFields': {
                    'hashtags': {
                        '$map': {
                            'input': '$hashtags',
                            'as': 'hashtag',
                            'in': {
                                '_id': '$$hashtag._id',
                                'name': '$$hashtag.name'
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'mentions': {
                        '$map': {
                            'input': '$mentions',
                            'as': 'mention',
                            'in': {
                                '_id': '$$mention._id',
                                'name': '$$mention.name',
                                'email': '$$mention.email'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'tweets',
                    'localField': '_id',
                    'foreignField': 'parentId',
                    'as': 'tweetChildrent'
                }
            }, {
                '$addFields': {
                    'retweetCount': {
                        '$size': {
                            '$filter': {
                                'input': '$tweetChildrent',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 1
                                    ]
                                }
                            }
                        }
                    },
                    'commentCount': {
                        '$size': {
                            '$filter': {
                                'input': '$tweetChildrent',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 2
                                    ]
                                }
                            }
                        }
                    },
                    'qouteTweetCount': {
                        '$size': {
                            '$filter': {
                                'input': '$tweetChildrent',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 3
                                    ]
                                }
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    'tweetChildrent': 0
                }
            }
        ]);
        if (!tweet) {
            throw new HttpException('This tweet is not exist', HttpStatus.BAD_REQUEST)
        }
        return tweet;
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
            parentId: !tweet.parentId ? null : new ObjectId(tweet.parentId),
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

    async getTweetChildrent(limit: number, page: number, type: TweetType, _id: string) {
        return this.tweetModel.aggregate([
            {
                '$match': {
                    'parentId': new ObjectId(_id),
                    'type': type
                }
            }, {
                '$skip': limit * (page - 1)
            }, {
                '$limit': limit
            }
        ])
    }
}