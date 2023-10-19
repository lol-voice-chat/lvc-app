import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  mySummonerStatsState,
  myTeamSummonersState,
  summonerState,
  userDeviceIdState,
  userStreamState,
} from '../@store/atom';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { IPC_KEY } from '../../const';
import electronStore from '../@store/electron';
import { connectSocket } from '../utils/socket';
import { getUserAudioStream } from '../utils/audio';
import { useEffect } from 'react';
import useVoiceChat from './use-voice-chat';
const { ipcRenderer } = window.require('electron');

function useVoiceRoom() {
  const userDeviceId = useRecoilValue(userDeviceIdState);
  const setUserStream = useSetRecoilState(userStreamState);
  const setGameStatus = useSetRecoilState(gameStatusState);

  const summoner = useRecoilValue(summonerState);
  const mySummonerStats = useRecoilValue(mySummonerStatsState);
  const setMyTeamSummoners = useSetRecoilState(myTeamSummonersState);
  const setEnemySummoners = useSetRecoilState(enemySummonersState);

  const { connect } = useVoiceChat();

  useEffect(() => {
    getUserAudioStream(userDeviceId).then((stream) => {
      setUserStream(stream);
    });
  }, [userDeviceId]);

  const onTeamVoiceRoom = (stream: MediaStream) => {
    const socket = connectSocket('/team-voice-chat');

    let disconnectAllTeamVoice: () => void;
    let closeConsumerTeamVoice: (summonerId: number) => void;

    electronStore.get('team-voice-room-name').then((roomName) => {
      socket.emit(
        'team-join-room',
        { roomName, summoner: { ...summoner, summonerStats: mySummonerStats } },
        (teamRoom: { rtpCapabilities: RtpCapabilities }) => {
          const { disconnectAll, closeConsumer } = connect({
            voiceRoomType: 'team',
            socket: socket,
            stream: stream,
            routerRtpCapabilities: teamRoom.rtpCapabilities,
          });

          disconnectAllTeamVoice = disconnectAll;
          closeConsumerTeamVoice = closeConsumer;
        }
      );
    });

    /* 팀원 나감 */
    socket.on('inform-exit-in-game', (target: { summonerId: number }) => {
      setMyTeamSummoners((prev) =>
        prev ? [...prev.filter(({ summonerId }) => summonerId !== target.summonerId)] : null
      );
      closeConsumerTeamVoice(target.summonerId);
    });

    /* 게임 시작 */
    ipcRenderer.once(IPC_KEY.START_IN_GAME, () => {});

    /* 게임 끝남 */
    ipcRenderer.once(IPC_KEY.END_OF_THE_GAME, () => {
      socket.emit('end-of-the-game');
      disconnectVoiceChat();
    });

    /* 게임 방 떠남 */
    ipcRenderer.once(IPC_KEY.EXIT_IN_GAME, () => {
      disconnectVoiceChat();
    });

    /* 챔피언 선택창에서 닷지 */
    ipcRenderer.once(IPC_KEY.EXIT_CHAMP_SELECT, () => {
      socket.emit('exit-champ-select');
      disconnectVoiceChat();
    });

    const disconnectVoiceChat = () => {
      setGameStatus('none');
      setMyTeamSummoners(null);
      disconnectAllTeamVoice();
    };
  };

  const onLeagueVoiceRoom = (stream: MediaStream) => {
    const socket = connectSocket('/league-voice-chat');

    let disconnectAllLeague: () => void;
    let closeConsumerLeague: (summonerId: number) => void;

    electronStore.get('league-voice-room-name').then(({ roomName, teamName }) => {
      socket.emit(
        'league-join-room',
        { roomName, teamName, summoner: { ...summoner, summonerStats: mySummonerStats } },
        (leagueRoom: { rtpCapabilities: RtpCapabilities }) => {
          const { disconnectAll, closeConsumer } = connect({
            voiceRoomType: 'league',
            socket: socket,
            stream: stream,
            routerRtpCapabilities: leagueRoom.rtpCapabilities,
          });

          disconnectAllLeague = disconnectAll;
          closeConsumerLeague = closeConsumer;
        }
      );
    });

    socket.on('inform-exit-in-game', (target: { summonerId: number }) => {
      setEnemySummoners((prev) =>
        prev ? [...prev.filter(({ summonerId }) => summonerId !== target.summonerId)] : null
      );
      closeConsumerLeague(target.summonerId);
    });

    /* 게임 시작 */
    ipcRenderer.once(IPC_KEY.START_IN_GAME, () => {
      socket.emit('start-in-game');
      disconnectVoiceChat();
      setGameStatus('in-game');
    });

    /* 게임 나감 */
    ipcRenderer.once(IPC_KEY.EXIT_IN_GAME, () => {
      disconnectVoiceChat();
      setGameStatus('none');
    });

    const disconnectVoiceChat = () => {
      socket.disconnect();
      // todo : 초기화 셋팅 추가
      setEnemySummoners(null);
      disconnectAllLeague();
    };
  };

  return { onTeamVoiceRoom, onLeagueVoiceRoom };
}

export default useVoiceRoom;
