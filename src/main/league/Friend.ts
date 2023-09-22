import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export interface FriendProfile {
  profileImage: string;
  displayName: string;
}

export class Friend {
  icon: number;
  gameName: string;

  public static async fetch() {
    const friendListData: any[] = await league(LCU_ENDPOINT.FRIENDS_URL);
    const friendList: Friend[] = plainToInstance(Friend, friendListData);
    return friendList;
  }

  public getProfile() {
    const profile: FriendProfile = {
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
    };

    return profile;
  }
}
