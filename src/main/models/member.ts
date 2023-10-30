import { redisClient } from '../lib/redis-client';
import { MatchHistory } from './match-history';

export interface ChampionData {
  summonerId: number;
  championIcon: string;
  kda: string;
}

interface MemberType {
  summonerId: number;
  championId: number;
  puuid: string;
}

export class Member {
  summonerId: number;
  championId: number;
  puuid: string;

  constructor(member: MemberType) {
    this.summonerId = member.summonerId;
    this.championId = member.championId;
    this.puuid = member.puuid;
  }

  public static valueOf = (summoner: MemberType) => {
    return new Member(summoner);
  };

  public isSameSummonerId(summonerId: number) {
    return this.summonerId === summonerId;
  }

  public async getChampionKda() {
    const key = this.puuid + 'match';
    const [matchHistory, matchLength]: [MatchHistory, string] = await Promise.all([
      MatchHistory.fetch(this.puuid),
      redisClient.hGet(key, 'length') ?? '0',
    ]);

    const championKda = matchHistory.getChampionKda(parseInt(matchLength), this.championId);
    const data: ChampionData = {
      summonerId: this.summonerId,
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${this.championId}/tile`,
      kda: championKda,
    };

    return data;
  }
}
