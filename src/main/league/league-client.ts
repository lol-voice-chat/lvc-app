import { MatchHistory, SummonerStats } from './MatchHistory';
import { LeagueClient } from './LeagueClient';
import { Friend, FriendProfile } from './Friend';
import { Gameflow } from './Gameflow';

export interface Summoner {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
  friendProfileList: FriendProfile[];
  state: string;
}

export const onLeagueClientUx = async () => {
  const leagueClient: LeagueClient = await LeagueClient.fetch();

  const [matchHistory, friendList, gameflow]: [MatchHistory, Friend[], Gameflow] =
    await Promise.all([
      await MatchHistory.fetch(leagueClient.puuid),
      await Friend.fetch(),
      await Gameflow.fetch(),
    ]);

  const friendProfileList: FriendProfile[] = friendList.map((friend) => friend.getProfile());

  const summoner: Summoner = {
    summonerId: leagueClient.summonerId,
    displayName: leagueClient.gameName,
    profileImage: leagueClient.getProfileImage(),
    tier: leagueClient.getTier(),
    statusMessage: leagueClient.statusMessage,
    summonerStats: matchHistory.getSummonerStats(),
    friendProfileList,
    state: gameflow.getState(),
  };

  return { summoner, matchHistory, gameflow };
};
