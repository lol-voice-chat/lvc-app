import league from '../utils/league';
import { plainToInstance } from 'class-transformer';
import { CHAMPIONS } from '../constants';

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

interface MatchHistoryData {
  games: MatchData[];
}

interface MatchData {
  gameType: string;
  participants: ParticipantData[];
}

export interface ParticipantData {
  championId: number;
  stats: {
    causedEarlySurrender: boolean; //조기항복 유도 여부
    doubleKills: number;
    assists: number;
    deaths: number;
    kills: number;
    totalHeal: number;
    visionScore: number; //시야점수
    turretKills: number; //타워킬 횟수
    totalDamageDealtToChampions: number; //총 피해량
    totalMinionsKilled: number; //미니언 처치 횟수
    neutralMinionsKilled: number; //중립 몬스터 처치 횟수
    win: boolean;
  };
}

const RECENT_PVP_MATCH_COUNT = 10;

export class MatchHistory {
  games: MatchHistoryData;

  public static async fetch(puuid: string) {
    const url = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=99`;
    const matchHistoryData = await league(url);
    return plainToInstance(MatchHistory, matchHistoryData);
  }

  public getSummonerStats() {
    let winCount = 0;
    let failCount = 0;

    const statsList: StatsData[] = this.getPvpMatchList()
      .slice(0, RECENT_PVP_MATCH_COUNT)
      .map((match: MatchData) => {
        const participant: ParticipantData = match.participants[0];
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

    const odds = (winCount / RECENT_PVP_MATCH_COUNT) * 100;
    const summonerStats: SummonerStats = { odds, winCount, failCount, statsList };
    return summonerStats;
  }

  public getChampionStats(summonerId: number, championId: number, profileImage: string) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let totalDamage = 0;
    let totalCs = 0;
    let champCount = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
      const participant: ParticipantData = match.participants[0];

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
      ${this.getStatsAverage(champKill, champCount)}/
      ${this.getStatsAverage(champDeath, champCount)}/
      ${this.getStatsAverage(champAssists, champCount)}
      `,
      totalDamage: Math.floor(totalDamage / champCount).toString(),
      totalMinionsKilled: this.getStatsAverage(totalCs, champCount),
    };

    return championStats;
  }

  public getChampionKda(championId: number) {
    let champKill = 0;
    let champDeath = 0;
    let champAssists = 0;
    let champCount = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
      const participant: ParticipantData = match.participants[0];

      if (participant.championId === championId) {
        champKill += participant.stats.kills;
        champDeath += participant.stats.deaths;
        champAssists += participant.stats.assists;
        champCount++;
      }
    });

    if (champCount === 0) {
      return '전적없음';
    }

    const kda: string = `
        ${this.getStatsAverage(champKill, champCount)}/
        ${this.getStatsAverage(champDeath, champCount)}/
        ${this.getStatsAverage(champAssists, champCount)}
        `;

    return kda;
  }

  private getStatsAverage(stats: number, count: number) {
    const statsAverage: string = (stats / count).toFixed(1).toString();
    if (statsAverage.split('.')[1] === '0') {
      return statsAverage.split('.')[0];
    }

    return statsAverage;
  }

  public getLeagueTitleScore(leagueTitle: any) {
    let count = 0;

    this.getPvpMatchList().forEach((match: MatchData) => {
      const participant: ParticipantData = match.participants[0];

      let statsValue = participant.stats[leagueTitle.value as keyof ParticipantData['stats']];
      if (statsValue) {
        statsValue = 1;
      } else {
        statsValue = 0;
      }

      count += statsValue;
    });

    return count;
  }

  private getPvpMatchList() {
    return this.games.games
      .slice(0, 100)
      .filter((match: MatchData) => match.gameType === 'CUSTOM_GAME');
  }
}
