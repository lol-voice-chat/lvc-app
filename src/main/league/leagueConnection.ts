import { LeagueWebSocket } from 'league-connect';
import league from './league';
import { WebContents } from 'electron';

export interface ILeagueConnection {
  champSelect(): void;
  gameLoading(): void;
}

export class LeagueConnection implements ILeagueConnection {
  private ws: LeagueWebSocket;
  private webContents: WebContents;
  private isJoinedRoom: boolean;

  constructor(ws: LeagueWebSocket, webContents: WebContents) {
    this.ws = ws;
    this.webContents = webContents;
    this.isJoinedRoom = false;
  }

  public async champSelect(): Promise<void> {
    const { phase } = await league('GET', '/lol-gameflow/v1/session');

    if (phase === 'ChampSelect') {
      const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
      const roomName: string = this.createTeamRoomName(myTeam);
      this.webContents.send('join-room', { roomName });
    } else {
      this.ws.subscribe('/lol-champ-select/v1/session', async (data) => {
        if (!this.isJoinedRoom) {
          const roomName: string = this.createTeamRoomName(data.myTeam);
          this.webContents.send('join-room', { roomName });
          this.isJoinedRoom = true;
        }
      });
    }

    this.ws.subscribe('/lol-gameflow/v1/session', async (data) => {
      if (data.phase === 'None' && !data.gameClient.running) {
        if (this.isJoinedRoom) {
          this.webContents.send('exit-champ-select');
          this.isJoinedRoom = false;
        }
      }
    });
  }

  private createTeamRoomName(myTeam: []): string {
    const summonerIds: string[] = myTeam.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );

    return summonerIds.join('');
  }

  public gameLoading(): void {
    this.ws.subscribe('/lol-gameflow/v1/sessioin', async (data) => {
      if (data.phase === 'InProgress' && !data.gameClient.visible) {
        console.log('test: ', data.gameData);
        // const gameVoiceRoomName: string = this.createGameRoomName(data);

        // this.webContents.send('game-loading', { roomName: gameVoiceRoomName });
      }
    });
  }

  private createGameRoomName(data: any): string {
    const { teamOne, teamTwo } = data.gameData;
    const teamOneSummonerIds: string[] = teamOne.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );
    const teamTwoSummonerIds: string[] = teamTwo.map(
      (summoner: { summonerId: string }) => summoner.summonerId
    );

    return teamOneSummonerIds.join('') + teamTwoSummonerIds.join('');
  }
}
