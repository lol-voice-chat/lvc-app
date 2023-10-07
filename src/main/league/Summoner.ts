import { request } from '../utils';
import { plainToInstance } from 'class-transformer';

export class Summoner {
  gameName: string;
  gameTag: string;
  icon: string;
  id: string;
  name: string;
  pid: string;
  puuid: string;
  summonerId: number;

  displayName: string;
  profileIconId: number;
  // puuid: string;
  // summonerId: number;

  public static fetch(): Promise<Summoner> {
    return new Promise((resolve) => {
      let interval = setInterval(async function () {
        const summonerData = await request('/lol-chat/v1/me');
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
    const summonerData = await request(url);
    return plainToInstance(Summoner, summonerData);
  }

  public isEmptyData() {
    return this.summonerId === 0;
  }

  public getMyProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`;
  }

  public getProfileImage() {
    return `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.profileIconId}.webp`;
  }
}
