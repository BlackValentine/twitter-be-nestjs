import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export abstract class BaseEntity {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}