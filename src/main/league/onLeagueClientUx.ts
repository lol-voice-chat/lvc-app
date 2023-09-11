import league from '../league/common/league';
import { LCU_ENDPOINT } from '../const';

type StatsInfo = {
  championIcon: string;
  kda: string;
  isVictory: boolean;
};

type SummonerStats = {
  odds: number;
  winCount: number;
  failCount: number;
  summonerStatsList: StatsInfo[];
};

export type SummonerInfo = {
  summonerId: number;
  displayName: string;
  profileImage: string;
  statusMessage: string;
  rankTier: string;
  summonerStats: SummonerStats;
};

type LeagueClientData = {
  gameName: string;
  icon: number;
  lol: {
    rankedLeagueDivision: string;
    rankedLeagueTier: string;
  };
  statusMessage: string;
  summonerId: number;
};

export const onLeagueClientUx = async () => {
  const leagueClient: LeagueClientData = await league(LCU_ENDPOINT.CHAT_ME_URL);

  const rankTier: string = createRankTierName(leagueClient);
  const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${leagueClient.icon}.webp`;
  const summonerStats: SummonerStats = await getSummonerStatsList();

  const summoner: SummonerInfo = {
    summonerId: leagueClient.summonerId,
    displayName: leagueClient.gameName,
    profileImage,
    statusMessage: leagueClient.statusMessage,
    rankTier,
    summonerStats,
  };

  return summoner;
};

function createRankTierName(leagueClient: LeagueClientData) {
  let rating: number | null = null;

  switch (leagueClient.lol.rankedLeagueDivision) {
    case 'I':
      rating = 1;
      break;
    case 'II':
      rating = 2;
      break;
    case 'III':
      rating = 3;
      break;
    case 'IV':
      rating = 4;
      break;
    case 'V':
      rating = 5;
  }

  return leagueClient.lol.rankedLeagueTier.charAt(0) + rating?.toString();
}

async function getSummonerStatsList() {
  let winCount = 0;
  let failCount = 0;

  const matchHistoryList = await league(LCU_ENDPOINT.MATCH_HISTORY);
  const pvpMatchList = matchHistoryList.games.games.filter(
    (game: any) => game.gameType !== 'CUSTOM_GAME'
  );

  const summonerStatsList = pvpMatchList.map((game: any) => {
    const participant = game.participants[0];
    const stats: StatsInfo = {
      championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${participant.championId}/tile`,
      kda: `${participant.stats.kills}/${participant.stats.deaths}/${participant.stats.assists}`,
      isVictory: participant.stats.win,
    };

    if (participant.stats.win) {
      winCount++;
    } else {
      failCount++;
    }

    return stats;
  });

  const odds = (winCount / pvpMatchList.length) * 100;
  const summonerStats: SummonerStats = { odds, winCount, failCount, summonerStatsList };
  return summonerStats;
}
