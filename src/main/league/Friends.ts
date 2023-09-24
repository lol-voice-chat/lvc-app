import { Friend } from './Friend';
import League from '../utils';
import { LCU_ENDPOINT } from '../constants';
import { plainToInstance } from 'class-transformer';

export class Friends {
  private friends: Friend[];

  public static async fetch() {
    const friendListData: any[] = await League.httpRequest(LCU_ENDPOINT.FRIENDS_URL);
    const friends = plainToInstance(Friend, friendListData);
    return new Friends(friends);
  }

  public static async fetchOne(id: string) {
    const url = `/lol-chat/v1/friends/${id}`;
    const leagueClientData = await League.httpRequest(url);
    return plainToInstance(Friend, leagueClientData);
  }

  constructor(friendList: Friend[]) {
    this.friends = this.from(friendList);
  }

  private from(friendList: Friend[]) {
    return friendList.filter((friend) => friend.existsByGameTag());
  }

  public getOfflineFriendList() {
    return this.friends //
      .filter((friend) => friend.isOffline())
      .map((friend) => friend.getProfile());
  }

  public getOnlineFriendList() {
    return this.friends
      .filter((friend) => !friend.isOffline())
      .map((friend) => friend.getProfile());
  }
}
