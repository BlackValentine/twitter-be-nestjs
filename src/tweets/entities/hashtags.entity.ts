import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from 'src/base.entity';

@Schema()
export class Hashtag extends BaseEntity {
    @Prop()
    name: string
}

export const HashtagSchema = SchemaFactory.createForClass(Hashtag);