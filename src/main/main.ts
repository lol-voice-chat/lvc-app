import { app, BrowserWindow } from 'electron';
import league from './league/league';
import electronReload from 'electron-reload';
import { createWebSocketConnection, LeagueWebSocket } from 'league-connect';

if (process.env.NODE_ENV === 'development') {
  electronReload(__dirname, {});
}

let mainWindow: BrowserWindow;
let isJoinedRoom: boolean = false;

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
    //롤 프로그램 실행
    const { summonerId, displayName, profileIconId } = await league(
      'GET',
      '/lol-summoner/v1/current-summoner'
    );
    const profileImage: string = `https://ddragon-webp.lolmath.net/latest/img/profileicon/${profileIconId}.webp`;
    mainWindow.webContents.send('on-league-client', { summonerId, displayName, profileImage });

    const ws: LeagueWebSocket = await createWebSocketConnection({
      authenticationOptions: {
        awaitConnection: true,
      },
    });

    //챔피언 선택
    const { phase } = await league('GET', '/lol-gameflow/v1/session');
    if (phase === 'ChampSelect') {
      const { myTeam } = await league('GET', '/lol-champ-select/v1/session');
      const roomName: string = createTeamRoomName(myTeam);
      mainWindow.webContents.send('join-room', { roomName });
    } else {
      ws.subscribe('/lol-champ-select/v1/session', async (data) => {
        if (!isJoinedRoom) {
          const roomName: string = createTeamRoomName(data.myTeam);
          mainWindow.webContents.send('join-room', { roomName });
          isJoinedRoom = true;
        }
      });
    }

    //챔피언선택 종료
    ws.subscribe('/lol-gameflow/v1/session', async (data) => {
      if (data.phase === 'None' && !data.gameClient.running) {
        if (isJoinedRoom) {
          mainWindow.webContents.send('exit-champ-select');
          isJoinedRoom = false;
        }
      }
    });

    //게임 로딩창
    ws.subscribe('/lol-gameflow/v1/sessioin', async (data) => {
      if (data.phase === 'InProgress' && !data.gameClient.visible) {
        const { teamOne, teamTwo } = data.gameData;
        const teamOneSummonerIds: string[] = teamOne.map(
          (summoner: { summonerId: string }) => summoner.summonerId
        );
        const teamTwoSummonerIds: string[] = teamTwo.map(
          (summoner: { summonerId: string }) => summoner.summonerId
        );

        const gameVoiceRoomName: string = teamOneSummonerIds.join('') + teamTwoSummonerIds.join('');

        mainWindow.webContents.send('game-loading', { roomName: gameVoiceRoomName });
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
