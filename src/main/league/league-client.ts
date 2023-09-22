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

  const [matchHistory, friendList, gameflow] = await Promise.all([
    MatchHistory.fetch(leagueClient.puuid),
    Friend.fetch(),
    Gameflow.fetch(),
  ]);

  const summonerStats: SummonerStats = await matchHistory.getSummonerStats();
  console.log('summoenrStats: ', summonerStats);
  const friendProfileList: FriendProfile[] = friendList.map((friend) => friend.getProfile());

  const summoner: Summoner = {
    summonerId: leagueClient.summonerId,
    displayName: leagueClient.gameName,
    profileImage: leagueClient.getProfileImage(),
    tier: leagueClient.getTier(),
    statusMessage: leagueClient.statusMessage,
    summonerStats,
    friendProfileList,
    state: gameflow.getState(),
  };

  return { summoner, matchHistory, gameflow };
};
