import { LCU_ENDPOINT, PHASE } from '../../constants';
import { voiceRoomNameGenerator } from '../../utils/voiceRoomNameGenerator';
import { WebContents } from 'electron';
import { IPC_KEY } from '../../../const/index';
import { LeagueWebSocket } from 'league-connect';
import { SummonerData } from '../onLeagueClientUx';

export const gameLoadingEvent = (
  webContents: WebContents,
  summoner: SummonerData,
  ws: LeagueWebSocket,
  isStartedGameLoading: boolean
) => {
  const { summonerId } = summoner;

  ws.subscribe(LCU_ENDPOINT.GAMEFLOW_URL, async (data) => {
    if (data.phase === PHASE.IN_GAME && !data.gameClient.visible && !isStartedGameLoading) {
      const { teamOne, teamTwo } = data.gameData;

      const teamOneVoiceRoomName: string = voiceRoomNameGenerator(teamOne);
      const teamTwoVoiceRoomName: string = voiceRoomNameGenerator(teamTwo);
      const roomName = teamOneVoiceRoomName + teamTwoVoiceRoomName;

      const foundSummoner = teamOne.find((summoner: any) => summoner.summonerId === summonerId);
      const myTeamVoiceRoomName: string = voiceRoomNameGenerator(foundSummoner ? teamOne : teamTwo);

      webContents.send(IPC_KEY.LEAGUE_JOIN_ROOM, { roomName, teamName: `${myTeamVoiceRoomName}` });
      isStartedGameLoading = true;
    }

    if (data.phase === PHASE.NONE && !data.gameClient.visible && isStartedGameLoading) {
      webContents.send(IPC_KEY.EXIT_IN_GAME);
      isStartedGameLoading = false;
    }
  });
};
