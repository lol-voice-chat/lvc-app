import { WebContents, ipcMain } from 'electron';
import { LeagueWebSocket } from 'league-connect';
import { SummonerInfo } from './onLeagueClientUx';
import League from '../utils';
import { LCU_ENDPOINT } from '../constants';
import { IPC_KEY } from '../../const';
import { leagueTitleEvent } from './leagueTitleEvent';
import { Gameflow } from './Gameflow';
import { MemberChampionData, Team } from './Team';
import { MatchHistory, ChampionStats } from './MatchHistory';

let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;
let isEndGame = false;
let isMatchedLeagueTitle = false;

export class LeagueHandler {
  webContents: WebContents;
  ws: LeagueWebSocket;
  summoner: SummonerInfo;

  constructor(webContents: WebContents, ws: LeagueWebSocket, summoner: SummonerInfo) {
    this.webContents = webContents;
    this.ws = ws;
    this.summoner = summoner;
  }

  public async handle(gameflow: Gameflow, matchHistory: MatchHistory) {
    await this.handleLeaguePhase(gameflow, matchHistory);

    //챔피언선택 시작
    let summmoners = new Map();
    this.ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
      if (!isJoinedRoom) {
        isJoinedRoom = true;
        this.joinTeamVoice(data.myTeam);
      }

      if (data.timer.phase === 'BAN_PICK') {
        if (!isMatchedLeagueTitle) {
          isMatchedLeagueTitle = true;
          leagueTitleEvent.emit(IPC_KEY.LEAGUE_TITLE, data.myTeam);
        }

        for (const summoner of data.myTeam) {
          if (summoner.championId === 0) {
            summmoners.set(summoner.summonerId, 0);
            return;
          }
          const championId = summmoners.get(summoner.summonerId);

          if (championId !== summoner.championId) {
            summmoners.set(summoner.summonerId, summoner.championId);

            const championStats: ChampionStats = matchHistory.getChampionStats(
              summoner.summonerId,
              summoner.championId,
              this.summoner.profileImage
            );

            this.webContents.send(IPC_KEY.CHAMP_INFO, championStats);
          }
        }
      }

      const isCloseWindow = await this.isCloseChampionSelectionWindow(data.timer.phase);
      if (isCloseWindow) {
        isJoinedRoom = false;
        this.webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        isMatchedLeagueTitle = false;
        summmoners = new Map();
      }
    });

    this.ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      //게임로딩 시작
      if (data.phase === 'InProgress' && !data.gameClient.visible && !isStartedGameLoading) {
        isStartedGameLoading = true;
        const { teamOne, teamTwo } = data.gameData;
        await this.joinLeagueVoice(teamOne, teamTwo);
      }

      //게임로딩 도중 나감
      if (data.phase === 'None' && !data.gameClient.visible && isStartedGameLoading) {
        isStartedGameLoading = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      //인게임 시작
      if (data.phase === 'InProgress' && data.gameClient.visible && !isStartedInGame) {
        setTimeout(() => {
          isStartedInGame = true;

          //
          const { teamOne, teamTwo } = data.gameData;
          const teamOneSummoners = new Team(teamOne);
          const teamTwoSummoners = new Team(teamTwo);

          const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
          const myTeam = summoner ? teamOneSummoners : teamTwoSummoners;
          const summonerIdList: number[] = myTeam.getSummonerIdList(this.summoner.summonerId);
          //
          this.webContents.send(IPC_KEY.START_IN_GAME, summonerIdList);
        }, 190000);
      }

      //인게임 도중 나감
      if (data.phase === 'None' && data.gameClient.visible && isStartedInGame) {
        isStartedInGame = false;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }

      if (data.phase === 'WaitingForStats' && !isEndGame) {
        isEndGame = true;
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      }
    });
  }

  private async handleLeaguePhase(gameflow: Gameflow, matchHistory: MatchHistory) {
    if (gameflow.isChampselectPhase()) {
      isJoinedRoom = true;

      const { myTeam } = await League.httpRequest(LCU_ENDPOINT.CHAMP_SELECT_URL);
      this.joinTeamVoice(myTeam);

      const myTeamSummonerChampionStatsList = await Promise.all(
        myTeam
          .filter((summoner: any) => summoner.championId !== 0)
          .map((summoner: any) => {
            if (summoner.championId !== 0) {
              const championStats: ChampionStats = matchHistory.getChampionStats(
                summoner.summonerId,
                summoner.championId,
                '' //무조건 있음
              );

              return championStats;
            }

            const championStats = {
              summonerId: summoner.summonerId,
              championIcon: null,
              name: null,
              kda: null,
              damage: null,
              cs: null,
            };

            return championStats;
          })
      );

      this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);
      return;
    }

    if (gameflow.isGameLoadingPhase()) {
      const { teamOne, teamTwo } = gameflow.gameData;
      await this.joinLeagueVoice(teamOne, teamTwo);

      const teamOneSummoners = new Team(teamOne);
      const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
      const myTeam = summoner ? teamOne : teamTwo;

      const myTeamSummonerChampionStatsList = await Promise.all(
        myTeam
          .filter((summoner: any) => summoner.championId !== 0)
          .map((summoner: any) => {
            if (summoner.championId !== 0) {
              const championStats: ChampionStats = matchHistory.getChampionStats(
                summoner.summonerId,
                summoner.championId,
                '' //무조건 있음
              );

              return championStats;
            }

            const championStats = {
              summonerId: summoner.summonerId,
              championIcon: null,
              name: null,
              kda: null,
              damage: null,
              cs: null,
            };

            return championStats;
          })
      );

      this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);

      isStartedGameLoading = true;
      return;
    }

    if (gameflow.isInGamePhase()) {
      const { teamOne, teamTwo } = gameflow.gameData;

      const teamOneSummoners = new Team(teamOne);
      const summoner = teamOneSummoners.findBySummonerId(this.summoner.summonerId);
      const myTeam = summoner ? teamOne : teamTwo;
      this.joinTeamVoice(myTeam);

      this.webContents.send(IPC_KEY.START_IN_GAME);

      const myTeamSummonerChampionStatsList = await Promise.all(
        myTeam
          .filter((summoner: any) => summoner.championId !== 0)
          .map((summoner: any) => {
            if (summoner.championId !== 0) {
              const championStats: ChampionStats = matchHistory.getChampionStats(
                summoner.summonerId,
                summoner.championId,
                '' //무조건 있음
              );

              return championStats;
            }

            const championStats = {
              summonerId: summoner.summonerId,
              championIcon: null,
              name: null,
              kda: null,
              damage: null,
              cs: null,
            };

            return championStats;
          })
      );

      this.webContents.send('selected-champ-info-list', myTeamSummonerChampionStatsList);

      isStartedInGame = true;
      return;
    }
  }

  private async isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await League.httpRequest(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    const isNotChampSelect: boolean = gameflowPhase === 'None' || gameflowPhase === 'Lobby';
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  private joinTeamVoice(myTeam: []) {
    const team = new Team(myTeam);
    const roomName = team.createVoiceRoomName();
    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  }

  private async joinLeagueVoice(teamOneData: [], teamTwoData: []) {
    const teamOne = new Team(teamOneData);
    const teamTwo = new Team(teamTwoData);

    const roomName = teamOne.createVoiceRoomName() + teamTwo.createVoiceRoomName();

    const summoner = teamOne.findBySummonerId(this.summoner.summonerId);
    const myTeam = summoner ? teamOne : teamTwo;
    const teamName = myTeam.createVoiceRoomName();

    const [teamOneSummonerChampionKdaList, teamTwoSummonerChampionKdaList]: [
      MemberChampionData[],
      MemberChampionData[]
    ] = await Promise.all([teamOne.getMemberChampionKdaList(), teamTwo.getMemberChampionKdaList()]);
    const summonerDataList = teamOneSummonerChampionKdaList.concat(teamTwoSummonerChampionKdaList);

    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: teamName });
    this.webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, {
      roomName,
      teamName,
      summonerDataList,
    });
  }
}
