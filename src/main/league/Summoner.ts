import League from '../utils';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export class Summoner {
  displayName: string;
  profileIconId: number;
  puuid: string;
  summonerId: number;

  public static fetch(): Promise<Summoner> {
    return new Promise((resolve) => {
      let interval = setInterval(async function () {
        const summonerData = await League.httpRequest(LCU_ENDPOINT.CURRENT_SUMMONER);
        const summoner: Summoner = plainToInstance(Summoner, summonerData);

        if (!summoner.isEmptyData()) {
          clearInterval(interval);
          resolve(summoner);
        }
      }, 1000);
    });
  }

  public static async fetchByPuuid(puuid: string) {
    const url = `/lol-summoner/v2/summoners/puuid/${puuid}`;
    const summonerData = await League.httpRequest(url);
    return plainToInstance(Summoner, summonerData);
  }

  public isEmptyData() {
    return this.summonerId === 0;
  }

  public getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.profileIconId}.webp`;
  }
}
