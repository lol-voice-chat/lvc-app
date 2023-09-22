import { MatchHistory } from './MatchHistory';
import league from '../utils/league';

interface SummonerType {
  summonerId: number;
  championId: number;
  puuid: string;
}

export class Summoner {
  summonerId: number;
  championId: number;
  puuid: string;

  constructor(summoner: SummonerType) {
    this.summonerId = summoner.summonerId;
    this.championId = summoner.championId;
    this.puuid = summoner.puuid;
  }

  public static valueOf = (summoner: SummonerType) => {
    return new Summoner(summoner);
  };

  public isSameSummonerId(summonerId: number) {
    return this.summonerId === summonerId;
  }

  public async getMatchHistory() {
    const summonerUrl = `/lol-summoner/v1/summoners/${this.summonerId}`;
    const { puuid } = await league(summonerUrl);
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
}
