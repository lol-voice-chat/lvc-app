import { MatchHistory, SummonerStats } from './MatchHistory';
import { Gameflow } from './Gameflow';
import { Summoner } from './Summoner';
import { LeagueRanked } from './LeagueRanked';
import League from '../utils';

export interface SummonerInfo {
  gameName: string;
  gameTag: string;
  id: string;
  name: string;
  pid: string;
  puuid: string;
  summonerId: number;
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
    gameName: summoner.gameName,
    gameTag: summoner.gameTag,
    id: summoner.id,
    name: summoner.name,
    pid: summoner.pid,
    puuid: summoner.puuid,
    summonerId: summoner.summonerId,
    profileImage: summoner.getMyProfileImage(),
    tier: leagueRanked.getTier(),
    summonerStats,
  };

  return { summonerInfo, matchHistory, gameflow };
};
