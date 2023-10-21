import { request } from '../lib/common';
import { plainToInstance } from 'class-transformer';
import { redisClient } from '../lib/redis-client';

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
        return displayTier;
    }
  }

  public async getRecentSummonerList() {
    const key = this.summonerId.toString() + 'recent';
    const summoner: string | null = await redisClient.get(key);

    if (summoner) {
      const _summoner: SummonerInfo = JSON.parse(summoner);
      if (_summoner.recentSummonerIdList.length === 0) {
        return [];
      }

      const newRecentSummonerIdList: number[] = [];
      const recentSummonerList = await Promise.all(
        _summoner.recentSummonerIdList.map(async (recentSummonerId: number) => {
          const key = recentSummonerId.toString() + 'recent';
          const recentSummoner: string | null = await redisClient.get(key);

          if (recentSummoner) {
            newRecentSummonerIdList.push(recentSummonerId);

            const _recentSummoner = JSON.parse(recentSummoner);
            return _recentSummoner.details;
          }
        })
      );

      _summoner.recentSummonerIdList = newRecentSummonerIdList;
      await redisClient.set(key, JSON.stringify(_summoner));
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
    };

    const newSummoner: SummonerInfo = {
      details,
      recentSummonerIdList: [],
    };

    await redisClient.set(key, JSON.stringify(newSummoner));
    await redisClient.expire(key, EXPIRE_TIME);
    return [];
  }
}
