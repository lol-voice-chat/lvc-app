import { MatchHistory } from './MatchHistory';
import League from '../utils';

interface SummonerType {
  summonerId: number;
  championId: number;
  puuid: string;
  summonerName: string;
  profileIconId: number;
}

export interface SummonerInfo {
  summonerId: number;
  profileImage: string;
  displayName: string;
  puuid: string;
}

export class Summoner {
  summonerId: number;
  championId: number;
  puuid: string;
  summonerName: string;
  profileIconId: number;

  constructor(summoner: SummonerType) {
    this.summonerId = summoner.summonerId;
    this.championId = summoner.championId;
    this.puuid = summoner.puuid;
    this.summonerName = summoner.summonerName;
    this.profileIconId = summoner.profileIconId;
  }

  public static valueOf = (summoner: SummonerType) => {
    return new Summoner(summoner);
  };

  public isSameSummonerId(summonerId: number) {
    return this.summonerId === summonerId;
  }

  public async getMatchHistory() {
    const summonerUrl = `/lol-summoner/v1/summoners/${this.summonerId}`;
    const { puuid } = await League.httpRequest(summonerUrl);
    const matchHistory: MatchHistory = await MatchHistory.fetch(puuid);
    const summonerMatchHistory = {
      summonerId: this.summonerId,
      matchHistory,
    };

    return summonerMatchHistory;
  }

  public async getChampionKda() {
    const matchHistory: MatchHistory = await MatchHistory.fetch(this.puuid);
    const championKda = matchHistory.getChampionKda(this.championId);
    const summonerKda = {
      summonerId: this.summonerId,
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${this.championId}/tile`,
      kda: championKda,
    };

    return summonerKda;
  }

  public getInfo() {
    const summonerInfo: SummonerInfo = {
      summonerId: this.summonerId,
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.profileIconId}.webp`,
      displayName: this.summonerName,
      puuid: this.puuid,
    };
    return summonerInfo;
  }
}
