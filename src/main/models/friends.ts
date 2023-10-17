import { plainToInstance } from 'class-transformer';
import { request } from '../lib/common';
import { Friend } from './friend';

export class Friends {
  private friends: Friend[];

  public static async fetch() {
    const friendsData = await request('/lol-chat/v1/friends');
    return plainToInstance(Friends, friendsData);
  }

  public isFriend(puuid: string) {
    return this.friends.some((friend: Friend) => friend.isSamePuuid(puuid));
  }
}
