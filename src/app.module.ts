import { Module } from '@nestjs/common';
import { UserModule } from './auth/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TweetsModule } from './tweets/tweets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGDB_URL, {
      dbName: 'twitter'
    }),
    UserModule,
    TweetsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
