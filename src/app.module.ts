import { Module } from '@nestjs/common';
import { UserModule } from './auth/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGDB_URL, {
      dbName: 'twitter'
    }),
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
