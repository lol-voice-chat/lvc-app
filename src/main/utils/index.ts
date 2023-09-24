import { BrowserWindow } from 'electron';
import { Credentials, LeagueClient, authenticate, createHttp1Request } from 'league-connect';
import { IPC_KEY } from '../../const';

export class League {
  private static credentials: Credentials;

  public static async initialize(mainWindow: BrowserWindow) {
    League.credentials = await authenticate({
      awaitConnection: true,
    });

    const client = new LeagueClient(League.credentials);
    client.start();

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
        League.credentials
      );

      return JSON.parse(response.text());
    } catch (error) {
      throw new Error(`lcu api http 요청중 오류가 발생했습니다: ${error}`);
    }
  }
}

export default League;
