import { Dispatch, SetStateAction } from 'react';

export const getUserAudioStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    return stream;
  } catch (err) {
    console.log('유저 미디어 스트림 획득 실패', err);
    return null;
  }
};

export const micVolumeHandler = (
  stream: MediaStream,
  setVolume: Dispatch<SetStateAction<number>>
) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);
  analyser.fftSize = 256; // 256 ~ 2048
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const updateMicVolume = () => {
    analyser.getByteFrequencyData(dataArray);

    let total = 0;
    for (let i = 0; i < bufferLength; i++) {
      total += dataArray[i];
    }
    setVolume(total / bufferLength);
    requestAnimationFrame(updateMicVolume);
  };
  updateMicVolume();
};

export const getSummonerSpeaker = (summonerId: number) => {
  const speaker = document.getElementById(summonerId.toString() + 'speaker') as HTMLAudioElement;
  return speaker;
};

export const getConnectedDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'audioinput');
};
