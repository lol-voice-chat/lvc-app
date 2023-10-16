import { request } from '../lib/common';
import { plainToInstance } from 'class-transformer';
import { RedisClient } from '../lib/redis-client';

export interface SummonerInfo {
  details: any;
  recentSummonerIdList: number[];
}

interface LeagueRanked {
  rankedLeagueDivision: string;
  rankedLeagueTier: string;
}

const EXPIRE_TIME = 604800; //5일

export class Summoner {
  gameName: string;
  gameTag: string;
  icon: string;
  id: string;
  lol: LeagueRanked;
  name: string;
  pid: string;
  puuid: string;
  summonerId: number;

  public static fetch(): Promise<Summoner> {
    return new Promise((resolve) => {
      let interval = setInterval(async function () {
        const summonerData = await request('/lol-chat/v1/me');
        const summoner: Summoner = plainToInstance(Summoner, summonerData);

        if (!summoner.isEmptyData()) {
          clearInterval(interval);
          resolve(summoner);
        }
      }, 1000);
    });
  }

  public isEmptyData() {
    return this.summonerId === 0;
  }

  public getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`;
  }

  public getTier() {
    const { rankedLeagueDivision, rankedLeagueTier } = this.lol;

    if (!rankedLeagueDivision && !rankedLeagueTier) {
      return 'Unrank';
    }

    const displayTier: string = rankedLeagueTier[0];
    switch (rankedLeagueDivision) {
      case 'I':
        return displayTier + 1;
      case 'II':
        return displayTier + 2;
      case 'III':
        return displayTier + 3;
      case 'IV':
        return displayTier + 4;
      case 'V':
        return displayTier + 5;
      default:
        throw new Error('존재하지 않는 랭크등급입니다.');
    }
  }

  public async getRecentSummonerList(redisClient: RedisClient) {
    const friendList = await request('/lol-chat/v1/friends');
    const friendSummonerIdList = friendList.map((friend: any) => friend.summonerId);

    const key = this.summonerId.toString() + 'recent';
    const existsSummoner = await redisClient.exists(key);

    if (existsSummoner) {
      const summoner: SummonerInfo = await redisClient.get(key);
      if (summoner.recentSummonerIdList.length === 0) {
        return [];
      }

      const newRecentSummonerIdList: number[] = [];
      const recentSummonerList = await Promise.all(
        summoner.recentSummonerIdList.map(async (recentSummonerId: number) => {
          const key = recentSummonerId.toString() + 'recent';
          const existsRecentSummoner = await redisClient.exists(key);

          if (existsRecentSummoner) {
            newRecentSummonerIdList.push(recentSummonerId);

            const recentSummoner = await redisClient.get(key);
            if (friendSummonerIdList.includes(recentSummonerId)) {
              recentSummoner.details.isRequested = true;
              await redisClient.set(key, JSON.stringify(recentSummoner));
            }

            return recentSummoner.details;
          }
        })
      );

      summoner.recentSummonerIdList = newRecentSummonerIdList;
      await redisClient.set(key, JSON.stringify(summoner));
      await redisClient.expire(key, EXPIRE_TIME);

      return recentSummonerList;
    }

    const details = {
      gameName: this.gameName,
      gameTag: this.gameTag,
      id: this.id,
      name: this.name,
      pid: this.pid,
      puuid: this.puuid,
      summonerId: this.summonerId,
      profileImage: this.getProfileImage(),
      tier: this.getTier(),
      isRequested: false,
    };

    const summoner: SummonerInfo = {
      details,
      recentSummonerIdList: [],
    };

    await redisClient.set(key, JSON.stringify(summoner));
    await redisClient.expire(key, EXPIRE_TIME);
    return [];
  }
}
