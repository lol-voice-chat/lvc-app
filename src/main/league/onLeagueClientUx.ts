import { MatchHistory, SummonerStats } from './MatchHistory';
import { Gameflow } from './Gameflow';
import { Summoner } from './Summoner';
import { LeagueRanked } from './LeagueRanked';

export interface SummonerInfo {
  summonerId: number;
  puuid: string;
  displayName: string;
  profileImage: string;
  tier: string;
  summonerStats: SummonerStats;
}

export const onLeagueClientUx = async () => {
  const summoner: Summoner = await Summoner.fetch();

  const [leagueRanked, matchHistory, gameflow] = await Promise.all([
    LeagueRanked.fetch(summoner.puuid),
    MatchHistory.fetch(summoner.puuid),
    Gameflow.fetch(),
  ]);

  const summonerStats: SummonerStats = await matchHistory.getSummonerStats();

  const summonerInfo: SummonerInfo = {
    summonerId: summoner.summonerId,
    puuid: summoner.puuid,
    displayName: summoner.displayName,
    profileImage: summoner.getProfileImage(),
    tier: leagueRanked.getTier(),
    summonerStats,
  };
  console.log(summonerInfo);

  return { summonerInfo, matchHistory, gameflow };
};
