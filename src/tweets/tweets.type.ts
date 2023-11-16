import { Request } from 'express';

export interface Media {
  url: string;
  type: MediaType;
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet,
}

export enum TweetAudience {
  Everyone,
  TwitterCircle,
}

export enum MediaType {
  Image,
  Video,
}

export type AuthRequestField = {
  email: string;
  _id: string;
  active: boolean;
};

export type RequestWithAuth = Request & AuthRequestField;
