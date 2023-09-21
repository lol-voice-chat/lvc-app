import { Summoner } from './Summoner';

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

  public async getSummonerChampionKdaList() {
    const summonerChampionKdaList = await Promise.all(
      this.summoners.map((summoner) => {
        return summoner.getChampionKda();
      })
    );

    return summonerChampionKdaList;
  }
}
