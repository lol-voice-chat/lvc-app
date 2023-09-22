import { ipcMain } from 'electron';
import { SummonerMatchHistoryData, Team } from './Team';
import { IPC_KEY } from '../../const';

interface LeagueTitle {
  value: string;
  title: string;
  description: string;
  standard: 'min' | 'max';
}

interface LeagueTitleScore {
  summonerId: number;
  count: number;
}

interface MatchLeagueTitle {
  summonerId: number;
  title: string;
  description: string;
}

export const matchingLeagueTitle = (teamData: []) => {
  const team = new Team(teamData);

  ipcMain.on(IPC_KEY.LEAGUE_TITLE, async (event, leagueTitleList: LeagueTitle[]) => {
    if (team.isAlone()) {
      event.reply(IPC_KEY.LEAGUE_TITLE, null);
      return;
    }

    let summonerMatchHistoryList: SummonerMatchHistoryData[] =
      await team.getSummonerMatchHistoryList();

    const result: MatchLeagueTitle[] = [];

    for (let i = 0; i < summonerMatchHistoryList.length; i++) {
      const leagueTitle = leagueTitleList[i];

      const summonerLeagueTitleScoreList: LeagueTitleScore[] = //
        summonerMatchHistoryList.map((summonerMatchHistory) => {
          const count = summonerMatchHistory.matchHistory.getLeagueTitleScore(leagueTitle);
          const leagueTitleScore: LeagueTitleScore = {
            summonerId: summonerMatchHistory.summonerId,
            count,
          };

          return leagueTitleScore;
        });

      const summonerData = matching(leagueTitle, summonerLeagueTitleScoreList);
      result.push(summonerData);

      //칭호가 매칭된 소환사는 제거
      summonerMatchHistoryList = summonerMatchHistoryList.filter(
        (summonerMatchHistory) => summonerMatchHistory.summonerId !== summonerData.summonerId
      );
    }

    event.reply(IPC_KEY.LEAGUE_TITLE, result);
    return;
  });
};

function matching(leagueTitle: LeagueTitle, summonerLeagueTitleScoreList: LeagueTitleScore[]) {
  const sorted = sortByLeagueTitleStandard(leagueTitle, summonerLeagueTitleScoreList);
  const summoner = sorted[sorted.length - 1];

  const matchLeagueTitle: MatchLeagueTitle = {
    summonerId: summoner.summonerId,
    title: leagueTitle.title,
    description: leagueTitle.description,
  };

  return matchLeagueTitle;
}

function sortByLeagueTitleStandard(
  leagueTitle: LeagueTitle,
  summonerLeagueTitleScoreList: LeagueTitleScore[]
) {
  if (leagueTitle.standard === 'max') {
    return summonerLeagueTitleScoreList.sort((a, b) => a.count - b.count);
  }

  return summonerLeagueTitleScoreList.sort((a, b) => b.count - a.count);
}
