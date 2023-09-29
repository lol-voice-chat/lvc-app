import { MatchHistory } from './MatchHistory';
import { Member } from './Member';

export interface MemberMatchHistoryData {
  summonerId: number;
  matchHistory: MatchHistory;
}

export interface MemberChampionData {
  summonerId: number;
  championIcon: string;
  kda: string;
}

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

  public isAlone() {
    return this.members.length === 1;
  }

  public async getMemberMatchHistoryList() {
    const memberMatchHistoryList: MemberMatchHistoryData[] = await Promise.all(
      this.members.map((member) => {
        return member.getMatchHistory();
      })
    );

    return memberMatchHistoryList;
  }

  public async getMemberChampionKdaList() {
    const memberChampionKdaList: MemberChampionData[] = await Promise.all(
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
