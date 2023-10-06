import { BrowserWindow } from 'electron';
import {
  Credentials,
  LeagueClient,
  LeagueWebSocket,
  authenticate,
  createHttp1Request,
} from 'league-connect';
import { IPC_KEY } from '../../const';
import { onLeagueClientUx } from '../league/onLeagueClientUx';
import { createWebSocketConnection } from 'league-connect';

export class League {
  public static credentials: Credentials;
  public static ws: LeagueWebSocket;

  public static async initialize(mainWindow: BrowserWindow) {
    const [credentials, ws] = await Promise.all([
      authenticate({
        awaitConnection: true,
      }),
      createWebSocketConnection({
        authenticationOptions: {
          awaitConnection: true,
        },
      }),
    ]);
    this.credentials = credentials;
    this.ws = ws;

    const client = new LeagueClient(this.credentials);
    client.start();

    client.on('connect', async (newCredentials) => {
      this.credentials = newCredentials;
      const { summonerInfo } = await onLeagueClientUx();
      mainWindow.webContents.send('on-league-client', summonerInfo);
      this.ws = await createWebSocketConnection();
    });

    client.on('disconnect', () => {
      mainWindow.webContents.send(IPC_KEY.SHUTDOWN_APP);
    });
  }

  public static async httpRequest(url: string) {
    try {
      const response = await createHttp1Request(
        {
          method: 'GET',
          url,
        },
        this.credentials
      );

      return JSON.parse(response.text());
    } catch (error) {
      throw new Error(`lcu api http 요청중 오류가 발생했습니다: ${error}`);
    }
  }
}

export default League;
