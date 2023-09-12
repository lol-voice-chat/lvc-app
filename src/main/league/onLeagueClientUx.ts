import league from '../league/common/league';
import { LCU_ENDPOINT } from '../const';

export interface SummonerData {
  summonerId: number;
  displayName: string;
  profileImage: string;
  tier: string;
  statusMessage: string;
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
}

interface LeagueClientData {
  gameName: string;
  icon: number;
  lol: {
    rankedLeagueDivision: string;
    rankedLeagueTier: string;
  };
  statusMessage: string;
  puuid: string;
  summonerId: number;
}

interface StatsData {
  championIcon: string;
  kda: string;
  isWin: boolean;
}

interface SummonerStats {
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
}

export const onLeagueClientUx = async () => {
  const leagueClientData: LeagueClientData = await league(LCU_ENDPOINT.CHAT_ME_URL);

  const tier: string = getTier(leagueClientData);
  const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${leagueClientData.icon}.webp`;

  const matchlistUrl = `/lol-match-history/v1/products/lol/${leagueClientData.puuid}/matches?begIndex=0&endIndex=100`;
  const matchlist = await league(matchlistUrl);
  const pvpMatchlist = matchlist.games.games.filter((game: any) => game.gameType !== 'CUSTOM_GAME');

  const summonerStats: SummonerStats = getSummonerStats(pvpMatchlist);

  const summoner: SummonerData = {
    summonerId: leagueClientData.summonerId,
    displayName: leagueClientData.gameName,
    profileImage,
    tier,
    statusMessage: leagueClientData.statusMessage,
    odds: summonerStats.odds,
    winCount: summonerStats.winCount,
    failCount: summonerStats.failCount,
    statsList: summonerStats.statsList,
  };

  return { summoner, pvpMatchlist };
};

function getTier(leagueClientData: LeagueClientData) {
  const { rankedLeagueDivision, rankedLeagueTier } = leagueClientData.lol;
  const displayTier: string = rankedLeagueTier[0];

  if (rankedLeagueDivision === 'NA' && rankedLeagueTier === '') {
    return 'Unranked';
  }

  switch (rankedLeagueDivision) {
    case 'I':
      return displayTier + 1;
    case 'II':
      return displayTier + 2;
    case 'III':
      return displayTier + 3;
    case 'IV':
      return displayTier + 4;
    case 'V':
      return displayTier + 5;
    default:
      throw new Error('잘못된 랭크입니다.');
  }
}

function getSummonerStats(pvpMatchlist: any[]) {
  let winCount = 0;
  let failCount = 0;

  const recentPvpMatchlist = pvpMatchlist.slice(0, 10);

  const statsList: StatsData[] = recentPvpMatchlist.map((game: any) => {
    const participant = game.participants[0];

    const stats: StatsData = {
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${participant.championId}/tile`,
      kda: `${participant.stats.kills}/${participant.stats.deaths}/${participant.stats.assists}`,
      isWin: participant.stats.win,
    };

    if (participant.stats.win) {
      winCount++;
    } else {
      failCount++;
    }

    return stats;
  });

  const odds = (winCount / recentPvpMatchlist.length) * 100;
  const summonerStats: SummonerStats = { odds, winCount, failCount, statsList };
  return summonerStats;
}
