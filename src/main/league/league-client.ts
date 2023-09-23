import { MatchHistory, SummonerStats } from './MatchHistory';
import { LeagueClient } from './LeagueClient';
import { FriendProfile } from './Friend';
import { Gameflow } from './Gameflow';
import { Friends } from './Friends';

export interface Summoner {
  id: string;
  summonerId: number;
  puuid: string;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
  offlineFriendList: FriendProfile[];
  onlineFriendList: FriendProfile[];
}

export const onLeagueClientUx = async () => {
  const leagueClient: LeagueClient = await LeagueClient.fetch();

  const [matchHistory, friends, gameflow] = await Promise.all([
    MatchHistory.fetch(leagueClient.puuid),
    Friends.fetch(),
    Gameflow.fetch(),
  ]);

  const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

  const summoner: Summoner = {
    id: leagueClient.id,
    summonerId: leagueClient.summonerId,
    puuid: leagueClient.puuid,
    displayName: leagueClient.gameName,
    profileImage: leagueClient.getProfileImage(),
    tier: leagueClient.getTier(),
    statusMessage: leagueClient.statusMessage,
    summonerStats,
    offlineFriendList: friends.getOfflineFriendList(),
    onlineFriendList: friends.getOnlineFriendList(),
  };

  return { summoner, matchHistory, gameflow };
};
