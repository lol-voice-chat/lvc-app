import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export class RedisClient {
  private client: any;

  constructor() {
    const client = redis.createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    });

    client.on('connect', () => {
      console.info('Redis 연결됨');
    });

    client.on('error', (err: any) => {
      if (err.toString().includes('Timeout')) {
        client.connect().then();
        this.client = client;
      }

      throw new Error(err);
    });

    client.connect().then();
    this.client = client;
  }

  public async set(key: string, value: string) {
    return await this.client.set(key, value);
  }

  public async get(key: string): Promise<string> {
    const value = await this.client.get(key);

    if (!value) {
      throw new Error('redis 응답값이 null입니다.');
    }

    return value;
  }
}
