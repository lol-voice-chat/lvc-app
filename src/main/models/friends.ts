import { plainToInstance } from 'class-transformer';
import { request } from '../lib/common';
import { Friend } from './friend';

export class Friends {
  private friends: Friend[];

  public static async fetch() {
    const friendsData: any[] = await request('/lol-chat/v1/friends');
    const _friends: Friend[] = plainToInstance(Friend, friendsData);
    return new Friends(_friends);
  }

  constructor(friends: Friend[]) {
    this.friends = friends;
  }

  public isFriend(puuid: string) {
    return this.friends.some((friend: Friend) => friend.isSamePuuid(puuid));
  }
}
