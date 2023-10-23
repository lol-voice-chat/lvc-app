import * as redis from 'redis';
import 'dotenv/config';

export let redisClient: any;

redisClient = redis.createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
});

redisClient.on('connect', () => {
  console.info('Redis 연결됨');
});

redisClient.on('error', (err: any) => {
  console.log(err);
});

redisClient.connect().then();
