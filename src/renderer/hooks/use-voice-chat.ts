import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { Socket } from 'socket.io-client';
import { getSummonerSpeaker } from '../utils/audio';
import * as mediasoup from 'mediasoup-client';
import { ConsumerTransportType, TransportType } from '../@type/voice';
import { SummonerStatsType, SummonerType } from '../@type/summoner';
import { useSetRecoilState } from 'recoil';
import { enemySummonersState, myTeamSummonersState, userStreamState } from '../@store/atom';

function useVoiceChat() {
  const setUserStream = useSetRecoilState(userStreamState);

  const setMyTeamSummoners = useSetRecoilState(myTeamSummonersState);
  const setEnemySummoners = useSetRecoilState(enemySummonersState);

  const connect = (params: {
    voiceRoomType: 'team' | 'league';
    socket: Socket;
    stream: MediaStream;
    routerRtpCapabilities: RtpCapabilities;
  }) => {
    const { voiceRoomType, socket, stream, routerRtpCapabilities } = params;

    let device = new mediasoup.Device();
    let producerTransport: TransportType | null = null;
    let consumerTransportList: ConsumerTransportType[] = [];

    device
      .load({ routerRtpCapabilities })
      .then(() => createSendTransport(stream.getAudioTracks()[0]))
      .catch((err) => console.log('디바이스 로드 에러', err));

    const createSendTransport = (audioTrack: MediaStreamTrack) => {
      socket.emit('create-producer-transport', (params: any) => {
        if (!device) return;

        producerTransport = device.createSendTransport(params);

        producerTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          try {
            socket.emit('transport-connect', dtlsParameters);
            callback();
          } catch (err) {
            errback(err as Error);
          }
        });
        producerTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
          try {
            socket.emit(
              'transport-produce',
              { kind, rtpParameters },
              (producer: { id: string; producersExist: boolean }) => {
                callback({ id: producer.id });
                producer.producersExist && getProducers();
              }
            );
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
      (newProducer: {
        id: string;
        summoner: SummonerType & { summonerStats: SummonerStatsType };
      }) => {
        signalNewConsumerTransport(newProducer.id, newProducer.summoner);
      }
    );

    const getProducers = () => {
      socket.emit(
        'get-producers',
        (
          producers: { id: string; summoner: SummonerType & { summonerStats: SummonerStatsType } }[]
        ) => {
          producers.forEach(({ id, summoner }) => {
            signalNewConsumerTransport(id, summoner);
          });
        }
      );
    };

    const signalNewConsumerTransport = (
      remoteProducerId: string,
      newSummoner: SummonerType & { summonerStats: SummonerStatsType }
    ) => {
      if (voiceRoomType === 'team') {
        setMyTeamSummoners((prev) => [...(prev ?? []), newSummoner]);
      }
      if (voiceRoomType === 'league') {
        setEnemySummoners((prev) => [...(prev ?? []), newSummoner]);
      }

      socket.emit('create-consumer-transport', remoteProducerId);
      socket.on('complete-create-consumer-transport', (params) => {
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

          socket.emit('consumer-resume', remoteProducerId);
        }
      );
    };

    const closeConsumer = (targetId: number) => {
      consumerTransportList = consumerTransportList.filter(
        ({ summonerId, consumer, consumerTransport }) => {
          if (summonerId === targetId) {
            consumer.close();
            consumerTransport.close();
            return false;
          }
          return true;
        }
      );
    };

    // 두번 호출되면 안됨
    const disconnectAll = (voiceRoomType: 'team' | 'league') => {
      socket.disconnect();

      if (voiceRoomType === 'team' && stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream.removeTrack(stream.getAudioTracks()[0]);
        setUserStream(null);
      }

      producerTransport?.close();
      consumerTransportList?.map(({ consumer, consumerTransport }) => {
        consumer.close();
        consumerTransport.close();
      });

      producerTransport = null;
      consumerTransportList = [];
    };

    return { closeConsumer, disconnectAll };
  };

  return { connect };
}

export default useVoiceChat;
