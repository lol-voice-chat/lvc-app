import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export interface FriendProfile {
  id: string;
  puuid: string;
  profileImage: string;
  displayName: string;
  status: string;
}

interface GameData {
  gameMode: string;
}

export class Friend {
  availability: string;
  gameName: string;
  id: string;
  lol: GameData;
  puuid: string;
  icon: number;
  summonerId: number;

  public static async fetch() {
    const friendListData: any[] = await league(LCU_ENDPOINT.FRIENDS_URL);
    return plainToInstance(Friend, friendListData);
  }

  public isEmptyData() {
    return this.summonerId === 0;
  }

  public getProfile() {
    const isOffline =
      this.availability === 'offline' ||
      this.availability === 'mobile' ||
      this.lol.gameMode === 'TFT';

    const profile: FriendProfile = {
      id: this.id,
      puuid: this.puuid,
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
      status: isOffline ? '오프라인' : '온라인',
    };

    return profile;
  }
}
