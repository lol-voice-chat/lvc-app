import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export interface FriendProfile {
  id: string;
  profileImage: string;
  displayName: string;
  status: string;
}

export class Friend {
  availability: string;
  gameName: string;
  id: string;
  icon: number;

  public static async fetch() {
    const friendListData: any[] = await league(LCU_ENDPOINT.FRIENDS_URL);
    return plainToInstance(Friend, friendListData);
  }

  public isEmptyData() {
    return this.id === '';
  }

  public getProfile() {
    const isOffline = this.availability === 'offline' || this.availability === 'mobile';

    const profile: FriendProfile = {
      id: this.id,
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
      status: isOffline ? '오프라인' : '온라인',
    };

    return profile;
  }
}
