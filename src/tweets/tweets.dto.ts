import { Media, TweetAudience, TweetType } from "./tweets.type"

export class CreateTweetDto {
    type: TweetType
    audience: TweetAudience
    content: string
    parentId: null | string
    hashtags: string[]
    mentions: string[]
    medias: Media[]
    tweetCircle: string[]
}