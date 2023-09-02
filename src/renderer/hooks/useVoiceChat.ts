import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  enemySummonersState,
  gameStatusState,
  myTeamSummonersState,
  summonerState,
} from '../@store/atom';
import * as mediasoup from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { io } from 'socket.io-client';
import { PATH } from '../const';
import {
  DeviceType,
  LocalConsumerTransportType,
  LocalProducerType,
  TransportType,
} from '../@type/webRtc';
import { SummonerType } from '../@type/summoner';
import { IPC_KEY } from '../../const';
import { useLocation } from 'react-router-dom';

const { ipcRenderer } = window.require('electron');

function useVoiceChat() {
  const setGameStatus = useSetRecoilState(gameStatusState);
  const summoner = useRecoilValue(summonerState);
  const [myTeamSummoners, setMyTeamSummoners] = useRecoilState(myTeamSummonersState);
  const [enemySummoners, setEnemySummoners] = useRecoilState(enemySummonersState);

  const { state } = useLocation();

  const onTeamVoiceChatRoom = () => {
    if (!summoner || !state?.team.roomName) return;

    const roomName = state.team.roomName;
    const socket = io(PATH.SERVER_URL + '/team-voice-chat', { transports: ['websocket'] });

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let localConsumertList: LocalConsumerTransportType[] = [];

    socket.emit('team-join-room', { roomName, summoner }, ({ rtpCapabilities }) => {
      getUserAudio(rtpCapabilities);
    });

    const getUserAudio = (deviceLoadParam: RtpCapabilities) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
        .then(async (mediaStream) => createDevice(mediaStream, deviceLoadParam))
        .catch((err) => console.log('미디어 권한 에러', err));
    };

    const createDevice = (mediaStream: MediaStream, routerRtpCapabilities: RtpCapabilities) => {
      device = new mediasoup.Device();
      device
        .load({ routerRtpCapabilities })
        .then(() => createSendTransport(mediaStream.getAudioTracks()[0]))
        .catch((err) => console.log('디바이스 로드 에러', err));
    };

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

    socket.on(
      'new-producer',
      ({ id, summonerId, displayName, profileImage }: LocalProducerType) => {
        signalNewConsumerTransport(id, { summonerId, displayName, profileImage });
      }
    );

    const getProducers = () => {
      socket.emit('get-producers', (producers: LocalProducerType[]) => {
        producers.forEach(({ id, summonerId, displayName, profileImage }) => {
          signalNewConsumerTransport(id, { summonerId, displayName, profileImage });
        });
      });
    };

    const signalNewConsumerTransport = (remoteProducerId: string, newSummoner: SummonerType) => {
      setMyTeamSummoners([...(myTeamSummoners ?? []), newSummoner]);

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
      newSummonerId: number,
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

          joinNewSummoner(consumer.track, {
            summonerId: newSummonerId,
            remoteProducerId: remoteProducerId,
            remoteConsumerId: params.id,
            consumerTransport: consumerTransport,
            consumer: consumer,
          });

          socket.emit('consumer-resume', { remoteProducerId });
        }
      );
    };

    const joinNewSummoner = (
      track: MediaStreamTrack,
      consumerTransport: LocalConsumerTransportType
    ) => {
      localConsumertList.push(consumerTransport);

      const newSummoner = document.getElementById(consumerTransport.summonerId.toString());
      const newSummonerSpeeker = document.createElement('audio');
      newSummonerSpeeker.setAttribute('autoplay', 'true');
      newSummoner?.appendChild(newSummonerSpeeker);
      newSummonerSpeeker.srcObject = new MediaStream([track]);
    };

    /* 팀원 나감 */
    socket.on('inform-exit-in-game', ({ summonerId }) => {
      localConsumertList = localConsumertList.filter((localConsumer) => {
        if (localConsumer.summonerId === summonerId) {
          localConsumer.consumer.close();
          localConsumer.consumerTransport.close();
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
      localConsumertList.map((localConsumer) => {
        localConsumer.consumer.close();
        localConsumer.consumerTransport.close();
      });
      window.location.replace('');
    };
  };

  const onLeagueVoiceChatRoom = () => {
    if (!state?.league?.roomName || !state?.league?.teamName) return;

    const roomName = state.league.roomName;
    const teamName = state.league.teamName;
    const socket = io(PATH.SERVER_URL + '/league-voice-chat', { transports: ['websocket'] });

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let localConsumertList: LocalConsumerTransportType[] = [];

    socket.emit('league-join-room', { roomName, teamName, summoner }, ({ rtpCapabilities }) => {
      getUserAudio(rtpCapabilities);
    });

    const getUserAudio = (deviceLoadParam: RtpCapabilities) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
        .then(async (mediaStream) => createDevice(mediaStream, deviceLoadParam))
        .catch((err) => console.log('미디어 권한 에러', err));
    };

    const createDevice = (mediaStream: MediaStream, routerRtpCapabilities: RtpCapabilities) => {
      device = new mediasoup.Device();
      device
        .load({ routerRtpCapabilities })
        .then(() => createSendTransport(mediaStream.getAudioTracks()[0]))
        .catch((err) => console.log('디바이스 로드 에러', err));
    };

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

    socket.on(
      'new-producer',
      ({ id, summonerId, displayName, profileImage }: LocalProducerType) => {
        signalNewConsumerTransport(id, { summonerId, displayName, profileImage });
      }
    );

    const getProducers = () => {
      socket.emit('get-producers', (producers: LocalProducerType[]) => {
        producers.forEach(({ id, summonerId, displayName, profileImage }) => {
          signalNewConsumerTransport(id, { summonerId, displayName, profileImage });
        });
      });
    };

    const signalNewConsumerTransport = (remoteProducerId: string, newSummoner: SummonerType) => {
      setEnemySummoners([...(enemySummoners ?? []), newSummoner]);

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
      newSummonerId: number,
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

          joinNewSummoner(consumer.track, {
            summonerId: newSummonerId,
            remoteProducerId: remoteProducerId,
            remoteConsumerId: params.id,
            consumerTransport: consumerTransport,
            consumer: consumer,
          });

          socket.emit('consumer-resume', { remoteProducerId });
        }
      );
    };

    const joinNewSummoner = (
      track: MediaStreamTrack,
      consumerTransport: LocalConsumerTransportType
    ) => {
      localConsumertList.push(consumerTransport);

      const newSummoner = document.getElementById(consumerTransport.summonerId.toString());
      const newSummonerSpeeker = document.createElement('audio');
      newSummonerSpeeker.setAttribute('autoplay', 'true');
      newSummoner?.appendChild(newSummonerSpeeker);
      newSummonerSpeeker.srcObject = new MediaStream([track]);
    };

    socket.on('inform-exit-in-game', ({ summonerId }) => {
      localConsumertList = localConsumertList.filter((localConsumer) => {
        if (localConsumer.summonerId === summonerId) {
          localConsumer.consumer.close();
          localConsumer.consumerTransport.close();
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
      localConsumertList.map((localConsumer) => {
        localConsumer.consumer.close();
        localConsumer.consumerTransport.close();
      });
    };
  };

  return { onTeamVoiceChatRoom, onLeagueVoiceChatRoom };
}

export default useVoiceChat;
