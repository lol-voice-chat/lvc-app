import { RedisClient } from '../lib/redis-client';
import { MatchHistory } from './match-history';

interface MemberType {
  summonerId: number;
  championId: number;
  puuid: string;
  summonerName: string;
  profileIconId: number;
}

export class Member {
  summonerId: number;
  championId: number;
  puuid: string;
  summonerName: string;
  profileIconId: number;

  constructor(member: MemberType) {
    this.summonerId = member.summonerId;
    this.championId = member.championId;
    this.puuid = member.puuid;
    this.summonerName = member.summonerName;
    this.profileIconId = member.profileIconId;
  }

  public static valueOf = (summoner: MemberType) => {
    return new Member(summoner);
  };

  public isSameSummonerId(summonerId: number) {
    return this.summonerId === summonerId;
  }

  public async getChampionKda(redisClient: RedisClient) {
    const key = `match-length-${this.summonerId}`;
    const [matchLength, matchHistory]: [string | null, MatchHistory] = await Promise.all([
      redisClient.get(key),
      MatchHistory.fetch(this.puuid),
    ]);

    const championKda = matchHistory.getChampionKda(parseInt(matchLength), this.championId);
    const summonerKda = {
      summonerId: this.summonerId,
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${this.championId}/tile`,
      kda: championKda,
    };

    return summonerKda;
  }
}
