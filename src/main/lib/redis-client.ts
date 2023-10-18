import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
});

redisClient.on('connect', () => {
  console.info('Redis 연결됨');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect().then();

// export class RedisClient {
//   private client: any;

//   constructor() {
//     const client = redis.createClient({
//       url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
//     });

//     client.on('connect', () => {
//       console.info('Redis 연결됨');
//     });

//     client.on('error', (err: any) => {
//       console.log(err);
//     });

//     client.connect().then();
//     this.client = client;
//   }

//   public async set(key: string, value: string) {
//     return await this.client.set(key, value);
//   }

//   public async hSet(key: string, value: any) {
//     return await this.client.hSet(key, value);
//   }

//   public async get(key: string): Promise<any> {
//     const value = await this.client.get(key);

//     if (!value) {
//       throw new Error('redis 응답값이 null입니다.');
//     }

//     return JSON.parse(value);
//   }

//   public async exists(key: string) {
//     return await this.client.exists(key);
//   }

//   public async expire(key: string, duration: number) {
//     await this.client.expire(key, duration);
//   }
// }
