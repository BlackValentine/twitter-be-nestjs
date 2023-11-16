import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { BaseEntity } from 'src/base.entity';

@Schema()
export class Follow extends BaseEntity {
  @Prop()
  userId: ObjectId;

  @Prop()
  followUserId: ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
