import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from 'src/base.entity';

@Schema()
export class User extends BaseEntity {
    @Prop({
        required: true,
        validate: {
            validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            message: (props: any) => `${props.value} is not a valid email address!`,
        },
    })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    refreshToken: string;

    @Prop({ default: 0 })
    active: boolean;

    @Prop()
    verifyToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);