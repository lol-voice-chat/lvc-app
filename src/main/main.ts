import { app, BrowserWindow } from 'electron';
import league from './league';
import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.webContents.on('did-finish-load', async () => {
    const { summonerId, displayName, profileIconId } = await league(
      'GET',
      '/lol-summoner/v1/current-summoner'
    );
    const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${profileIconId}.webp`;
    mainWindow.webContents.send('on-league-client', { summonerId, displayName, profileImage });

    const ws: LeagueWebSocket = await createWebSocketConnection();

    //champSelect
    const { phase } = await league('GET', '/lol-gameflow/v1/session');
    if (phase === 'ChampSelect') {
      const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
      const roomName: string = createTeamRoomName(myTeam);
      mainWindow.webContents.send('join-room', { roomName });
    } else {
      ws.subscribe('/lol-champ-select/v1/session', async (data) => {
        const roomName: string = createTeamRoomName(data.myTeam);
        mainWindow.webContents.send('join-room', { roomName });
      });
    }

    ws.subscribe('/lol-gameflow/v1/session', async (data) => {
      if (data.phase === 'None' && !data.gameClient.running) {
        mainWindow.webContents.send('exit-champ-select');
      }
    });
  });
};

function createTeamRoomName(myTeam: []): string {
  const summonerIds: string[] = myTeam.map(
    (summoner: { summonerId: string }) => summoner.summonerId
  );

  return summonerIds.join('');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
