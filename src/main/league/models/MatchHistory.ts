import { CHAMPIONS } from '../../constants';
import { SummonerData } from '../onLeagueClientUx';

export interface SummonerStats {
  odds: number;
  winCount: number;
  failCount: number;
  statsList: StatsData[];
}

interface StatsData {
  championIcon: string;
  kda: string;
  isWin: boolean;
}

export interface ChampionStats {
  summonerId: number;
  championIcon: string;
  name: string;
  kda: string;
  totalDamage: string;
  totalMinionsKilled: string;
}

interface GameData {
  games: MatchHistoryData[];
}

interface MatchHistoryData {
  gameType: string;
  participants: ParticipantData[];
}

interface ParticipantData {
  championId: number;
  stats: {
    assists: number;
    deaths: number;
    kills: number;
    totalDamageDealtToChampions: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    win: boolean;
  };
}

const RECENT_PVP_MATCH_LENGTH = 10;

export class MatchHistory {
  games: GameData;

  getSummonerStats() {
    let winCount = 0;
    let failCount = 0;

    const statsList: StatsData[] = this.games.games
      .filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME')
      .slice(0, RECENT_PVP_MATCH_LENGTH)
      .map((game: MatchHistoryData) => {
        const participant: ParticipantData = game.participants[0];
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

    const odds = (winCount / RECENT_PVP_MATCH_LENGTH) * 100;
    const summonerStats: SummonerStats = { odds, winCount, failCount, statsList };
    return summonerStats;
  }

  getChampionStats(championId: number, summoner: SummonerData) {
    const { summonerId, profileImage } = summoner;

    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let totalDamage = 0;
    let totalCs = 0;
    let champCount = 0;

    this.games.games
      .filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME')
      .forEach((game: MatchHistoryData) => {
        const participant: ParticipantData = game.participants[0];

        if (participant.championId === championId) {
          champKill += participant.stats.kills;
          champDeath += participant.stats.deaths;
          champAssists += participant.stats.assists;
          totalDamage += participant.stats.totalDamageDealtToChampions;
          totalCs += participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled;
          champCount++;
        }
      });

    const championIcon = championId
      ? `https://lolcdn.darkintaqt.com/cdn/champion/${championId}/tile`
      : profileImage;

    const championName: string = CHAMPIONS[championId.toString()];

    if (champCount === 0) {
      const championStats: ChampionStats = {
        summonerId,
        championIcon: championIcon,
        name: championName,
        kda: '전적 없음',
        totalDamage: '전적 없음',
        totalMinionsKilled: '전적 없음',
      };

      return championStats;
    }

    const championStats: ChampionStats = {
      summonerId,
      championIcon: championIcon,
      name: championName,
      kda: `
      ${this.getAverage(champKill, champCount)}/
      ${this.getAverage(champDeath, champCount)}/
      ${this.getAverage(champAssists, champCount)}
      `,
      totalDamage: Math.floor(totalDamage / champCount).toString(),
      totalMinionsKilled: this.getAverage(totalCs, champCount),
    };

    return championStats;
  }

  getChampionKda(championId: number) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let champCount = 0;

    this.games.games
      .filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME')
      .forEach((game: MatchHistoryData) => {
        const participant: ParticipantData = game.participants[0];

        if (participant.championId === championId) {
          champKill += participant.stats.kills;
          champDeath += participant.stats.deaths;
          champAssists += participant.stats.assists;
          champCount++;
        }
      });

    const kda: string = `
      ${this.getAverage(champKill, champCount)}/
      ${this.getAverage(champDeath, champCount)}/
      ${this.getAverage(champAssists, champCount)}
      `;

    return kda;
  }

  private getAverage(champInfo: number, champCount: number) {
    const info: string = (champInfo / champCount).toFixed(1).toString();
    if (info.split('.')[1] === '0') {
      return info.split('.')[0];
    }

    return info;
  }
}
