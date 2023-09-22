import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export interface FriendProfile {
  summonerId: number;
  puuid: string;
  profileImage: string;
  displayName: string;
  status: string;
}

export class Friend {
  availability: string;
  gameName: string;
  icon: number;
  puuid: string;
  summonerId: number;

  public static async fetch() {
    const friendListData: any[] = await league(LCU_ENDPOINT.FRIENDS_URL);
    const friendList: Friend[] = plainToInstance(Friend, friendListData);
    return friendList;
  }

  public getProfile() {
    const profile: FriendProfile = {
      summonerId: this.summonerId,
      puuid: this.puuid,
      profileImage: `https://ddragon-webp.lolmath.net/latest/img/profileicon/${this.icon}.webp`,
      displayName: this.gameName,
      status: this.availability === 'offline' ? '오프라인' : '온라인',
    };

    return profile;
  }
}
