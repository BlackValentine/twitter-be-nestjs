import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from 'src/base.entity';
import { Media, TweetAudience, TweetType } from '../tweets.type';
import { ObjectId } from 'mongodb'

@Schema()
export class Tweet extends BaseEntity {
    @Prop({ type: ObjectId })
    userId: ObjectId

    @Prop({ required: true })
    type: TweetType

    @Prop({ required: true })
    audience: TweetAudience

    @Prop()
    content: string

    @Prop()
    parentId: null | ObjectId

    @Prop()
    hashtags: ObjectId[]

    @Prop()
    mentions: string[]

    @Prop()
    medias: Media[]

    @Prop()
    guestViews?: number

    @Prop()
    userViews?: number
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);