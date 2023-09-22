import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

interface LeagueRanked {
  rankedLeagueDivision: string;
  rankedLeagueTier: string;
}

export class LeagueClient {
  gameName: string;
  id: string;
  icon: number;
  lol: LeagueRanked;
  statusMessage: string;
  puuid: string;
  summonerId: number;

  public static async fetch(): Promise<LeagueClient> {
    return new Promise((resolve) => {
      let interval = setInterval(async function () {
        const leagueClientData = await league(LCU_ENDPOINT.CHAT_ME_URL);
        const leagueClient: LeagueClient = plainToInstance(LeagueClient, leagueClientData);

        if (!leagueClient.isEmptyData()) {
          clearInterval(interval);
          resolve(leagueClient);
        }
      }, 1000);
    });
  }

  public isEmptyData() {
    return this.gameName === '';
  }

  public static async fetchFriend(id: string) {
    const url = `/lol-chat/v1/friends/${id}`;
    const leagueClientData = await league(url);
    console.log('tes: ', leagueClientData);
    return plainToInstance(LeagueClient, leagueClientData);
  }

  public getTier() {
    if (Object.keys(this.lol).length === 0) {
      return 'off';
    }

    const { rankedLeagueDivision, rankedLeagueTier } = this.lol;
    const displayTier: string = rankedLeagueTier[0];

    if (rankedLeagueDivision === 'NA' && rankedLeagueTier === '') {
      return 'Unrank';
    }

    switch (rankedLeagueDivision) {
      case 'I':
        return displayTier + 1;
      case 'II':
        return displayTier + 2;
      case 'III':
        return displayTier + 3;
      case 'IV':
        return displayTier + 4;
      case 'V':
        return displayTier + 5;
      default:
        throw new Error('존재하지 않는 랭크등급입니다.');
    }
  }

  public getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`;
  }
}
