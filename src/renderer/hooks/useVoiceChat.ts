import { useRecoilValue } from 'recoil';
import { summonerState, voiceChatInfoState } from '../@store/Recoil';
import * as mediasoup from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';

function useVoiceChat() {
  const voiceChatInfo = useRecoilValue(voiceChatInfoState);
  const summoner = useRecoilValue(summonerState);

  const onVoiceChatRoom = () => {
    if (!voiceChatInfo.socket || !voiceChatInfo.roomName || !summoner) return;

    let device: mediasoup.types.Device | null = null;

    voiceChatInfo.socket.emit(
      'join-room',
      { roomName: voiceChatInfo.roomName, summoner },
      ({ rtpCapabilities }) => {
        console.log('방 참여');
        getUserAudio(rtpCapabilities);
      }
    );

    const getUserAudio = (deviceLoadParam: RtpCapabilities) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .then((mediaStream) => createDevice(mediaStream, deviceLoadParam))
        .catch((err) => {
          console.log('미디어 권한 에러', err);
        });
    };

    const createDevice = (mediaStream: MediaStream, routerRtpCapabilities: RtpCapabilities) => {
      device = new mediasoup.Device();
      device
        .load({ routerRtpCapabilities })
        .then(() => createSendTransport(mediaStream.getAudioTracks()[0]))
        .catch((err) => console.log('디바이스 로드 에러', err));
    };

    const createSendTransport = (audioTrack: MediaStreamTrack) => {
      console.log('디바이스 생성', device);
    };
  };

  return { onVoiceChatRoom };
}

export default useVoiceChat;
