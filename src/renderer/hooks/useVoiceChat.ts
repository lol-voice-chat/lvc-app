import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  leagueTitleListState,
  myTeamSummonersState,
  summonerState,
  userStreamState,
} from '../@store/atom';
import * as mediasoup from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { DeviceType, ConsumerTransportType, TransportType } from '../@type/webRtc';
import { SummonerType } from '../@type/summoner';
import { IPC_KEY, STORE_KEY } from '../../const';
import electronStore from '../@store/electron';
import { connectSocket } from '../utils/socket';
import { Socket } from 'socket.io-client';
import { getSummonerSpeaker, getUserAudioStream } from '../utils/audio';

const { ipcRenderer } = window.require('electron');

function useVoiceChat() {
  const setGameStatus = useSetRecoilState(gameStatusState);
  const [userStream, setUserStream] = useRecoilState(userStreamState);

  const summoner = useRecoilValue(summonerState);
  const [myTeamSummoners, setMyTeamSummoners] = useRecoilState(myTeamSummonersState);
  const [enemySummoners, setEnemySummoners] = useRecoilState(enemySummonersState);
  const setLeagueTitleList = useSetRecoilState(leagueTitleListState);

  const connectVoiceChat = (
    isTeamVoiceChat: Boolean,
    socket: Socket,
    device: DeviceType | null,
    stream: MediaStream,
    routerRtpCapabilities: RtpCapabilities,
    producerTransport: TransportType | null,
    consumerTransportList: ConsumerTransportType[]
  ) => {
    const createDevice = () => {
      device = new mediasoup.Device();
      device
        .load({ routerRtpCapabilities })
        .then(() => createSendTransport(stream.getAudioTracks()[0]))
        .catch((err) => console.log('디바이스 로드 에러', err));
    };
    createDevice();

    const createSendTransport = (audioTrack: MediaStreamTrack) => {
      socket.emit('create-producer-transport', ({ params }: any) => {
        if (!device) return;

        producerTransport = device.createSendTransport(params);

        producerTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit('transport-connect', { dtlsParameters });
            callback();
          } catch (err) {
            errback(err as Error);
          }
        });
        producerTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
          try {
            socket.emit('transport-produce', { kind, rtpParameters }, ({ id, producersExist }) => {
              callback({ id });
              producersExist && getProducers();
            });
          } catch (err) {
            errback(err as Error);
          }
        });

        connectSendTransport(audioTrack);
      });
    };

    const connectSendTransport = async (audioTrack: MediaStreamTrack) => {
      if (!producerTransport || !audioTrack) return console.log('프로듀서 or 오디오 없음');

      producerTransport
        .produce({ track: audioTrack })
        .then((audioProducer) => {
          audioProducer.on('trackended', () => console.log('audio track ended'));
          audioProducer.on('transportclose', () => console.log('audio transport ended'));
        })
        .catch((err) => console.log('프로듀스 메서드 에러', err));
    };

    socket.on('new-producer', ({ id, summoner }) => {
      signalNewConsumerTransport(id, summoner);
    });

    const getProducers = () => {
      socket.emit('get-producers', (producers) => {
        producers.forEach(({ id, summoner }) => {
          signalNewConsumerTransport(id, summoner);
        });
      });
    };

    const signalNewConsumerTransport = (remoteProducerId: string, newSummoner: SummonerType) => {
      isTeamVoiceChat
        ? setMyTeamSummoners([...(myTeamSummoners ?? []), newSummoner])
        : setEnemySummoners([...(enemySummoners ?? []), newSummoner]);

      socket.emit('create-consumer-transport', { remoteProducerId });
      socket.on('complete-create-consumer-transport', ({ params }) => {
        if (!device) return;

        const consumerTransport = device.createRecvTransport(params);

        consumerTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit('transport-recv-connect', {
              dtlsParameters,
              remoteProducerId,
            });
            callback();
          } catch (err) {
            errback(err as Error);
          }
        });

        connectRecvTransport(newSummoner.summonerId, remoteProducerId, consumerTransport);
      });
    };

    const connectRecvTransport = (
      summonerId: number,
      remoteProducerId: string,
      consumerTransport: TransportType
    ) => {
      if (!device) return;

      socket.emit(
        'consume',
        {
          rtpCapabilities: device.rtpCapabilities,
          remoteProducerId,
        },
        async ({ params }: any) => {
          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          consumerTransportList.push({
            summonerId,
            remoteProducerId,
            remoteConsumerId: params.id,
            consumer,
            consumerTransport,
          });

          const newSummonerAudio = getSummonerSpeaker(summonerId);
          newSummonerAudio.srcObject = new MediaStream([consumer.track]);

          socket.emit('consumer-resume', { remoteProducerId });
        }
      );
    };
  };

  const onTeamVoiceRoom = () => {
    const socket = connectSocket('/team-voice-chat');

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let consumerTransportList: ConsumerTransportType[] = [];

    electronStore.get(STORE_KEY.TEAM_VOICE_ROOM_NAME).then((roomName) => {
      getUserAudioStream().then((stream) => {
        if (stream) {
          setUserStream(stream);
          socket.emit(
            'team-join-room',
            { roomName, summoner },
            ({ rtpCapabilities, leagueTitleList }) => {
              connectVoiceChat(
                true,
                socket,
                device,
                stream,
                rtpCapabilities,
                producerTransport,
                consumerTransportList
              );
              ipcRenderer.send(IPC_KEY.LEAGUE_TITLE, leagueTitleList);
              ipcRenderer.once(IPC_KEY.LEAGUE_TITLE, (_, leagueTitleList) => {
                socket.emit('league-title', leagueTitleList);
                setLeagueTitleList(leagueTitleList);
              });
            }
          );
        }
      });
    });

    /* 팀원 나감 */
    socket.on('inform-exit-in-game', ({ summonerId }) => {
      consumerTransportList = consumerTransportList.filter((consumerTransport) => {
        if (consumerTransport.summonerId === summonerId) {
          consumerTransport.consumer.close();
          consumerTransport.consumerTransport.close();
          return false;
        }
        return true;
      });
      setMyTeamSummoners(
        myTeamSummoners?.filter((summoner) => summoner.summonerId !== summonerId) ?? null
      );
    });

    ipcRenderer.once(IPC_KEY.START_IN_GAME, () => {
      setGameStatus('in-game');
    });

    /* 인게임 방 떠남 */
    ipcRenderer.once(IPC_KEY.EXIT_IN_GAME, () => {
      disconnectVoiceChat();
    });

    /* 챔피언 선택창에서 닷지 */
    ipcRenderer.once(IPC_KEY.EXIT_CHAMP_SELECT, () => {
      socket.emit('exit-champ-select');
      disconnectVoiceChat();
    });

    const disconnectVoiceChat = () => {
      socket.disconnect();
      producerTransport?.close();
      consumerTransportList.map(({ consumer, consumerTransport }) => {
        consumer.close();
        consumerTransport.close();
      });
      window.location.reload();
    };
  };

  const onLeagueVoiceRoom = () => {
    const socket = connectSocket('/league-voice-chat');

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let consumerTransportList: ConsumerTransportType[] = [];

    electronStore.get(STORE_KEY.LEAGUE_VOICE_ROOM_NAME).then(({ roomName, teamName }) => {
      if (userStream) {
        socket.emit(
          'league-join-room',
          { roomName, teamName, summoner },
          ({ rtpCapabilities, leagueTitleList }) => {
            setLeagueTitleList(leagueTitleList);
            connectVoiceChat(
              false,
              socket,
              device,
              userStream,
              rtpCapabilities,
              producerTransport,
              consumerTransportList
            );
          }
        );
      }
    });

    socket.on('inform-exit-in-game', ({ summonerId }) => {
      consumerTransportList = consumerTransportList.filter((consumerTransport) => {
        if (consumerTransport.summonerId === summonerId) {
          consumerTransport.consumer.close();
          consumerTransport.consumerTransport.close();
          return false;
        }
        return true;
      });
      setEnemySummoners(
        enemySummoners?.filter((summoner) => summoner.summonerId !== summonerId) ?? null
      );
    });

    ipcRenderer.once(IPC_KEY.START_IN_GAME, () => {
      socket.emit('start-in-game');
      disconnectVoiceChat();
      setGameStatus('in-game');
    });

    ipcRenderer.once(IPC_KEY.EXIT_IN_GAME, () => {
      disconnectVoiceChat();
    });

    const disconnectVoiceChat = () => {
      socket.disconnect();
      producerTransport?.close();
      consumerTransportList.map((localConsumer) => {
        localConsumer.consumer.close();
        localConsumer.consumerTransport.close();
      });
    };
  };

  return { onTeamVoiceRoom, onLeagueVoiceRoom };
}

export default useVoiceChat;
