import { MatchHistory } from './MatchHistory';

interface MemberType {
  summonerId: number;
  championId: number;
  puuid: string;
  summonerName: string;
  profileIconId: number;
}

export interface MemberInfo {
  summonerId: number;
  profileImage: string;
  displayName: string;
  puuid: string;
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
