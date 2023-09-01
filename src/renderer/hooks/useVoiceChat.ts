import { useRecoilState, useRecoilValue } from 'recoil';
import {
  enemySummonersState,
  myTeamSummonersState,
  summonerState,
  voiceChatInfoState,
} from '../@store/Recoil';
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

const { ipcRenderer } = window.require('electron');

function useVoiceChat() {
  const voiceChatInfo = useRecoilValue(voiceChatInfoState);
  const summoner = useRecoilValue(summonerState);
  const [myTeamSummoners, setMyTeamSummoners] = useRecoilState(myTeamSummonersState);
  const [enemySummoners, setEnemySummoners] = useRecoilState(enemySummonersState);

  const onTeamVoiceChatRoom = () => {
    if (!voiceChatInfo.teamRoomName || !summoner) return;

    const socket = io(PATH.SERVER_URL + '/team-voice-chat', { transports: ['websocket'] });

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let localConsumertList: LocalConsumerTransportType[] = [];
    const consumingList: string[] = [];

    socket.emit(
      'team-join-room',
      { roomName: voiceChatInfo.teamRoomName, summoner },
      ({ rtpCapabilities }) => {
        getUserAudio(rtpCapabilities);
      }
    );

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
      if (consumingList.includes(remoteProducerId)) return;

      consumingList.push(remoteProducerId);
      setMyTeamSummoners([...(myTeamSummoners ?? []), newSummoner]);

      socket.emit('create-consumer-transport');
      socket.on('complete-create-consumer-transport', ({ params }) => {
        if (!device) return;

        const consumerTransport = device.createRecvTransport(params);

        consumerTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit('transport-recv-connect', {
              dtlsParameters,
              remoteConsumerId: params.id,
            });
            callback();
          } catch (err) {
            errback(err as Error);
          }
        });

        connectRecvTransport(
          newSummoner.summonerId,
          remoteProducerId,
          params.id,
          consumerTransport
        );
      });
    };

    const connectRecvTransport = (
      newSummonerId: number,
      remoteProducerId: string,
      remoteConsumerId: string,
      consumerTransport: TransportType
    ) => {
      if (!device) return;

      socket.emit(
        'consume',
        {
          rtpCapabilities: device.rtpCapabilities,
          remoteProducerId,
          remoteConsumerId,
        },
        async ({ params }: any) => {
          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          joinNewSummoner(newSummonerId, consumer.track, {
            remoteProducerId: remoteProducerId,
            remoteConsumerId: params.id,
            consumerTransport: consumerTransport,
            consumer: consumer,
          });

          socket.emit('consumer-resume', { remoteConsumerId: params.id });
        }
      );
    };

    const joinNewSummoner = (
      newSummonerId: number,
      track: MediaStreamTrack,
      consumerTransport: LocalConsumerTransportType
    ) => {
      localConsumertList.push(consumerTransport);

      const newSummoner = document.getElementById(newSummonerId.toString());
      const newSummonerSpeeker = document.createElement('audio');
      newSummonerSpeeker.setAttribute('autoplay', 'true');
      newSummoner?.appendChild(newSummonerSpeeker);
      newSummonerSpeeker.srcObject = new MediaStream([track]);
    };

    /* 챔피언 선택창 떠남 */
    ipcRenderer.once(IPC_KEY.EXIT_CHAMP_SELECT, () => {
      socket.emit('exit-champ-select');

      socket.disconnect();
      producerTransport?.close();
      localConsumertList.map((localConsumer) => {
        localConsumer.consumer.close();
        localConsumer.consumerTransport.close();
      });
      window.location.replace('');
    });
  };

  const onLeagueVoiceChatRoom = (roomName: string, teamName: string) => {
    const socket = io(PATH.SERVER_URL + '/league-voice-chat', { transports: ['websocket'] });

    let device: DeviceType | null = null;
    let producerTransport: TransportType | null = null;
    let localConsumertList: LocalConsumerTransportType[] = [];
    const consumingList: string[] = [];

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
      if (consumingList.includes(remoteProducerId)) return;

      consumingList.push(remoteProducerId);
      setEnemySummoners([...(enemySummoners ?? []), newSummoner]);

      socket.emit('create-consumer-transport');
      socket.on('complete-create-consumer-transport', ({ params }) => {
        if (!device) return;

        const consumerTransport = device.createRecvTransport(params);

        consumerTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit('transport-recv-connect', {
              dtlsParameters,
              remoteConsumerId: params.id,
            });
            callback();
          } catch (err) {
            errback(err as Error);
          }
        });

        connectRecvTransport(
          newSummoner.summonerId,
          remoteProducerId,
          params.id,
          consumerTransport
        );
      });
    };

    const connectRecvTransport = (
      newSummonerId: number,
      remoteProducerId: string,
      remoteConsumerId: string,
      consumerTransport: TransportType
    ) => {
      if (!device) return;

      socket.emit(
        'consume',
        {
          rtpCapabilities: device.rtpCapabilities,
          remoteProducerId,
          remoteConsumerId,
        },
        async ({ params }: any) => {
          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          joinNewSummoner(newSummonerId, consumer.track, {
            remoteProducerId: remoteProducerId,
            remoteConsumerId: params.id,
            consumerTransport: consumerTransport,
            consumer: consumer,
          });

          socket.emit('consumer-resume', { remoteConsumerId: params.id });
        }
      );
    };

    const joinNewSummoner = (
      newSummonerId: number,
      track: MediaStreamTrack,
      consumerTransport: LocalConsumerTransportType
    ) => {
      localConsumertList.push(consumerTransport);

      const newSummoner = document.getElementById(newSummonerId.toString());
      const newSummonerSpeeker = document.createElement('audio');
      newSummonerSpeeker.setAttribute('autoplay', 'true');
      newSummoner?.appendChild(newSummonerSpeeker);
      newSummonerSpeeker.srcObject = new MediaStream([track]);
    };
  };

  return { onTeamVoiceChatRoom, onLeagueVoiceChatRoom };
}

export default useVoiceChat;
