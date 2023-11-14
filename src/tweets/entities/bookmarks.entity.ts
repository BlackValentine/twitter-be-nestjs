import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from 'src/base.entity';
import { ObjectId } from 'mongodb';

@Schema()
export class Bookmark extends BaseEntity {
    @Prop()
    userId: ObjectId

    @Prop()
    tweetId: ObjectId
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);