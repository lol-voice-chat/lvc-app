import { ipcMain } from 'electron';
import league from '../utils/league';
import { MatchData, ParticipantData, fetchPvpMatchHistory } from './match-history';

interface LeagueTitle {
  value: string;
  title: string;
  description: string;
  standard: 'min' | 'max';
}

interface SummonerMatchHistory {
  summonerId: number;
  pvpMatchList: MatchData[];
}

export const pickLeagueTitle = (team: any[]) => {
  ipcMain.on('league-title', async (event, leagueTitleList: LeagueTitle[]) => {
    /**
     * 만약 팀의 소환사가 1명밖에 없다면 null 반환
     */
    if (team.length === 1) {
      event.reply('league-title', null);
      return;
    }

    /**
     * 팀 소환사 전적 리스트
     */
    const summonerMatchHistoryList: SummonerMatchHistory[] = [];

    for (const summoner of team) {
      const summonerUrl = `/lol-summoner/v1/summoners/${summoner.summonerId}`;
      const { puuid } = await league(summonerUrl);

      const pvpMatchList: MatchData[] = await fetchPvpMatchHistory(puuid);
      const summonerMatchHistory: SummonerMatchHistory = {
        summonerId: summoner.summonerId,
        pvpMatchList,
      };

      summonerMatchHistoryList.push(summonerMatchHistory);
    }

    const result: any[] = [];
    let leagueTitleIndex = 0;
    let copySummonerMatchHistoryList = [...summonerMatchHistoryList];

    /**
     * 우리팀 소환사 수만큼 돌린다.
     */
    for (let i = 0; i < summonerMatchHistoryList.length; i++) {
      /**
       * 칭호데이터를 순서대로 들고온다.
       */
      const leagueTitle = leagueTitleList[leagueTitleIndex];
      console.log('이번 칭호: ', leagueTitle.title);
      leagueTitleIndex += 1;

      const array: any[] = [];
      copySummonerMatchHistoryList.forEach((summonerMatchHistory: SummonerMatchHistory) => {
        let count = 0;

        //1. 소환사 pvp match를 돌면서 칭호 데이터값을 더한다.
        summonerMatchHistory.pvpMatchList.forEach((match: MatchData) => {
          const participant: ParticipantData = match.participants[0];

          let statsValue = participant.stats[leagueTitle.value as keyof ParticipantData['stats']];
          if (statsValue) {
            statsValue = 1;
          } else {
            statsValue = 0;
          }

          count += statsValue;
        });

        const statsValue = {
          summonerId: summonerMatchHistory.summonerId,
          count,
        };

        array.push(statsValue);
      });

      if (leagueTitle.standard === 'max') {
        const temp = array.sort((a, b) => a.count - b.count);
        const summoner = temp[temp.length - 1];

        result.push({
          summonerId: summoner.summonerId,
          title: leagueTitle.title,
          description: leagueTitle.description,
        });

        copySummonerMatchHistoryList = copySummonerMatchHistoryList.filter(
          (summonerMatchHistory) => summonerMatchHistory.summonerId !== summoner.summonerId
        );
      } else {
        const temp = array.sort((a, b) => b.count - a.count);
        const summoner = temp[temp.length - 1];

        result.push({
          summonerId: summoner.summonerId,
          title: leagueTitle.title,
          description: leagueTitle.description,
        });

        copySummonerMatchHistoryList = copySummonerMatchHistoryList.filter(
          (summonerMatchHistory) => summonerMatchHistory.summonerId !== summoner.summonerId
        );
      }
    }
    console.log('최종 칭호 매칭: ', result);

    event.reply('league-title', result);
    return;
  });
};
