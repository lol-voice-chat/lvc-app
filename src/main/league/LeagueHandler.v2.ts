import { WebContents } from 'electron';
import { LeagueWebSocket } from 'league-connect';
import { SummonerData } from './onLeagueClientUx';
import { ChampionStats, MatchHistory } from './models';
import league from '../utils/league';
import { LCU_ENDPOINT } from '../constants';
import { voiceRoomNameGenerator } from '../utils/voiceRoomNameGenerator';
import { IPC_KEY } from '../../const';
import { plainToInstance } from 'class-transformer';

let isJoinedRoom = false;
let isStartedGameLoading = false;
let isStartedInGame = false;
let selectedChampionId: number = 0;

export class LeagueHandler {
  webContents: WebContents;
  ws: LeagueWebSocket;
  summoner: SummonerData;

  constructor(webContents: WebContents, ws: LeagueWebSocket, summoner: SummonerData) {
    this.webContents = webContents;
    this.ws = ws;
    this.summoner = summoner;
  }

  public async handle(gameflow: any, matchHistory: MatchHistory) {
    await this.handleLeaguePhase(gameflow);

    this.ws.subscribe(LCU_ENDPOINT.CHAMP_SELECT_URL, async (data) => {
      if (data.timer.phase === 'BAN_PICK' && !isJoinedRoom) {
        this.joinTeamVoice(data.myTeam);
        isJoinedRoom = true;
      }

      if (data.timer.phase === 'BAN_PICK') {
        const { championId } = data.myTeam.find(
          (summoner: any) => summoner.summonerId === this.summoner.summonerId
        );

        if (selectedChampionId !== championId) {
          selectedChampionId = championId;
          const championStats: ChampionStats = matchHistory.getChampionStats(
            championId,
            this.summoner
          );
          this.webContents.send(IPC_KEY.CHAMP_INFO, championStats);
        }
      }

      const isCloseWindow = await this.isCloseChampionSelectionWindow(data.timer.phase);
      if (isCloseWindow) {
        this.webContents.send(IPC_KEY.EXIT_CHAMP_SELECT);
        isJoinedRoom = false;
        selectedChampionId = 0;
      }
    });

    this.ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
      if (this.isGameLoadingPhase(data) && !isStartedGameLoading) {
        const { teamOne, teamTwo } = data.gameData;
        this.joinLeagueVoice(teamOne, teamTwo);
        isStartedGameLoading = true;
      }

      if (this.isCloseGameLoadingWindow(data)) {
        this.webContents.send(IPC_KEY.EXIT_IN_GAME);
        isStartedGameLoading = false;
      }

      // if (this.isInGamePhase(data) && !isStartedInGame) {
      //   this.webContents.send(IPC_KEY.START_IN_GAME);
      //   isStartedInGame = true;
      // }

      // if (this.isCloseInGameWindow(data)) {
      //   this.webContents.send(IPC_KEY.EXIT_IN_GAME);
      //   isStartedInGame = false;
      // }
    });
  }

  private async handleLeaguePhase(gameflow: any) {
    if (this.isChampSelectPhase(gameflow)) {
      const { myTeam } = await league(LCU_ENDPOINT.CHAMP_SELECT_URL);
      this.joinTeamVoice(myTeam);
      isJoinedRoom = true;
      return;
    }

    if (this.isGameLoadingPhase(gameflow)) {
      const { teamOne, teamTwo } = gameflow.gameData;
      this.joinLeagueVoice(teamOne, teamTwo);
      isStartedGameLoading = true;
      return;
    }

    if (this.isInGamePhase(gameflow)) {
      const { teamOne, teamTwo } = gameflow.gameData;

      const foundSummoner = teamOne.find(
        (summoner: any) => summoner.summonerId === this.summoner.summonerId
      );
      const myTeam = foundSummoner ? teamOne : teamTwo;
      this.joinTeamVoice(myTeam);

      this.webContents.send(IPC_KEY.START_IN_GAME);
      isStartedInGame = true;
      return;
    }
  }

  private isChampSelectPhase(data: any) {
    return data.phase === 'ChampSelect';
  }

  private async isCloseChampionSelectionWindow(phase: string) {
    const gameflowPhase = await league(LCU_ENDPOINT.GAMEFLOW_PHASE_URL);
    const isNotChampSelect: boolean = gameflowPhase === 'None' || gameflowPhase === 'Lobby';
    return isJoinedRoom && phase === '' && isNotChampSelect;
  }

  private isGameLoadingPhase(data: any) {
    return data.phase === 'InProgress' && !data.gameClient.visible;
  }

  private isCloseGameLoadingWindow(data: any) {
    return data.phase === 'None' && !data.gameClient.visible && isStartedGameLoading;
  }

  private isInGamePhase(data: any) {
    return data.phase === 'InProgress' && data.gameClient.visible;
  }

  private isCloseInGameWindow(data: any) {
    return data.phase === 'None' && data.gameClient.visible && isStartedInGame;
  }

  private joinTeamVoice(team: []) {
    const roomName: string = voiceRoomNameGenerator(team);
    this.webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName });
  }

  private joinLeagueVoice(teamOne: [], teamTwo: []) {
    const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
    const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const foundSummoner = teamOne.find(
      (summoner: any) => summoner.summonerId === this.summoner.summonerId
    );
    const myTeam = foundSummoner ? teamOne : teamTwo;

    let summonerDataList: { summonerId: any; championIcon: string; kda: string }[] = [];
    teamOne.forEach((summoner: any) => {
      const matchHistoryUrl = `/lol-match-history/v1/products/lol/${summoner.puuid}/matches?begIndex=0&endIndex=100`;
      league(matchHistoryUrl).then((matchHistoryJson) => {
        const matchHistory: MatchHistory = plainToInstance(MatchHistory, matchHistoryJson);
        const championKda: string = matchHistory.getChampionKda(summoner.championId);
        const summonerData = {
          summonerId: summoner.summonerId,
          championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${summoner.championId}/tile`,
          kda: championKda,
        };

        summonerDataList.push(summonerData);
      });
    });

    teamTwo.forEach((summoner: any) => {
      const matchHistoryUrl = `/lol-match-history/v1/products/lol/${summoner.puuid}/matches?begIndex=0&endIndex=100`;
      league(matchHistoryUrl).then((matchHistoryJson) => {
        const matchHistory: MatchHistory = plainToInstance(MatchHistory, matchHistoryJson);
        const championKda: string = matchHistory.getChampionKda(summoner.championId);
        const summonerData = {
          summonerId: summoner.summonerId,
          championIcon: `https://lolcdn.darkintaqt.com/cdn/champion/${summoner.championId}/tile`,
          kda: championKda,
        };

        summonerDataList.push(summonerData);
      });
    });

    this.joinTeamVoice(myTeam);

    const teamName: string = voiceRoomNameGenerator(myTeam);
    this.webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName, summonerDataList });
  }
}
