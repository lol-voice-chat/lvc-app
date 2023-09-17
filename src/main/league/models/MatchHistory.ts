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

export interface MatchHistoryData {
  gameType: string;
  participants: ParticipantData[];
}

interface GameData {
  games: MatchHistoryData[];
}

const RECENT_PVP_MATCH_LENGTH = 10;

export class MatchHistory {
  games: GameData;

  getSummonerStats() {
    let winCount = 0;
    let failCount = 0;

    const statsList = this.games.games
      .filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME')
      .slice(0, RECENT_PVP_MATCH_LENGTH)
      .map((game: MatchHistoryData) => {
        const participant: ParticipantData = game.participants[0];
        const stats = {
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
    return { odds, winCount, failCount, statsList };
  }

  getPvpMatchList() {
    return this.games.games.filter((game: MatchHistoryData) => game.gameType !== 'CUSTOM_GAME');
  }
}
