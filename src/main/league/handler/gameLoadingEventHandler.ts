import { GameflowData } from '../leagueHandler';
import { LCU_ENDPOINT, PHASE } from '../../const';
import { voiceRoomNameGenerator } from '../common/voiceRoomNameGenerator';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../../const/index';
import { SummonerInfo } from '../onLeagueClientUx';
import { LeagueWebSocket } from 'league-connect';

let isStartedGameLoading = false;

export const handle = (
  gameflowData: GameflowData,
  webContents: WebContents,
  summoner: SummonerInfo,
  ws: LeagueWebSocket
) => {
  const { summonerId } = summoner;
  if (isGameLoadingWindow(gameflowData)) {
    const { teamOne, teamTwo } = gameflowData.gameData;

    const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
    const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
    const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

    const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
    const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);
    webContents.send(IPC_KEY.TEAM_JOIN_ROOM, { roomName: myTeamVoiceRoomName });
    webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
    isStartedGameLoading = true;
    return;
  }

  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (isGameLoadingWindow(data) && !isStartedGameLoading) {
      const { teamOne, teamTwo } = data.gameData;

      const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
      const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
      const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

      const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
      const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);

      webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
      isStartedGameLoading = true;
    }

    if (isCloseGameLoadingWindow(data)) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedGameLoading = false;
    }
  });
};

function isGameLoadingWindow(data: GameflowData) {
  return data.phase === PHASE.IN_GAME && !data.gameClient.visible;
}

function isCloseGameLoadingWindow(data: GameflowData) {
  return data.phase === PHASE.NONE && !data.gameClient.visible && isStartedGameLoading;
}
