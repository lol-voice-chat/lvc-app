import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export let redisClient: any;

export const connect = () => {
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  });

  redisClient.on('connect', () => {
    console.info('Redis 연결됨');
  });

  redisClient.on('error', (err: any) => {
    console.error('Redis Client Error', err);
  });

  redisClient.connect().then();
};
