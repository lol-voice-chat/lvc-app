import { MatchHistory } from './MatchHistory';
import { Summoner } from './Summoner';

export interface SummonerMatchHistoryData {
  summonerId: number;
  matchHistory: MatchHistory;
}

export interface SummonerChampionData {
  summonerId: number;
  championIcon: string;
  kda: string;
}

export class Team {
  private summoners: Summoner[];

  constructor(team: []) {
    this.summoners = this.from(team);
  }

  private from(team: []): Summoner[] {
    return team.map(Summoner.valueOf);
  }

  public findBySummonerId(summonerId: number) {
    return this.summoners.find((summoner) => summoner.isSameSummonerId(summonerId));
  }

  public createVoiceRoomName() {
    const summonerIds: number[] = this.summoners.map((summoner) => summoner.summonerId);
    return summonerIds.sort().join('').toString();
  }

  public isAlone() {
    return this.summoners.length === 1;
  }

  public async getSummonerMatchHistoryList() {
    const summonerMatchHistoryList: SummonerMatchHistoryData[] = await Promise.all(
      this.summoners.map((summoner) => {
        return summoner.getMatchHistory();
      })
    );

    return summonerMatchHistoryList;
  }

  public async getSummonerChampionKdaList() {
    const summonerChampionKdaList: SummonerChampionData[] = await Promise.all(
      this.summoners.map((summoner) => {
        return summoner.getChampionKda();
      })
    );

    return summonerChampionKdaList;
  }

  public getSummonerInfoList(summonerId: number) {
    return this.summoners
      .filter((summoner) => !summoner.isSameSummonerId(summonerId))
      .map((summoner) => summoner.getInfo());
  }
}
