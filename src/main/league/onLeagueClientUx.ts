import { MatchHistory, SummonerStats } from './MatchHistory';
import { LeagueClient } from './LeagueClient';
import { Gameflow } from './Gameflow';

export interface Summoner {
  summonerId: number;
  puuid: string;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  summonerStats: SummonerStats;
}

export const onLeagueClientUx = async () => {
  const leagueClient: LeagueClient = await LeagueClient.fetch();

  const [matchHistory, gameflow] = await Promise.all([
    MatchHistory.fetch(leagueClient.puuid),
    Gameflow.fetch(),
  ]);

  const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

  const summoner: Summoner = {
    summonerId: leagueClient.summonerId,
    puuid: leagueClient.puuid,
    displayName: leagueClient.gameName,
    profileImage: leagueClient.getProfileImage(),
    tier: leagueClient.getTier(),
    statusMessage: leagueClient.statusMessage,
    summonerStats,
  };

  return { summoner, matchHistory, gameflow };
};
