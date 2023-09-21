import { getChampionKda, fetchPvpMatchHistory } from './match-history';

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
    console.log(summoner.championId);
    this.championId = summoner.championId;
    this.puuid = summoner.puuid;
  }

  public static valueOf = (summoner: SummonerType) => {
    return new Summoner(summoner);
  };

  public isSameSummonerId(summonerId: number) {
    return this.summonerId === summonerId;
  }

  public async getChampionKda() {
    const pvpMatchList = await fetchPvpMatchHistory(this.puuid);
    const championKda: string = getChampionKda(pvpMatchList, this.championId);
    const summonerKda = {
      summonerId: this.summonerId,
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${this.championId}/tile`,
      kda: championKda,
    };

    return summonerKda;
  }
}
