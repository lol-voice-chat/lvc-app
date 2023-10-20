import { Member, ChampionData } from './member';

export class Team {
  private members: Member[];

  constructor(team: []) {
    this.members = this.from(team);
  }

  private from(team: []): Member[] {
    return team.map(Member.valueOf);
  }

  public findBySummonerId(summonerId: number) {
    return this.members.find((member) => member.isSameSummonerId(summonerId));
  }

  public createVoiceRoomName() {
    const summonerIds: number[] = this.members.map((member) => member.summonerId);
    return summonerIds.sort().join('').toString();
  }

  public async getMemberChampionKdaList() {
    const memberChampionKdaList: ChampionData[] = await Promise.all(
      this.members.map((member) => {
        return member.getChampionKda();
      })
    );

    return memberChampionKdaList;
  }

  public getSummonerIdList(summonerId: number) {
    return this.members
      .filter((member) => !member.isSameSummonerId(summonerId))
      .map((member) => member.summonerId);
  }
}
