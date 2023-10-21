import { AppData, Transport, Device, Consumer } from 'mediasoup-client/lib/types';

export type DeviceType = Device;

export type TransportType = Transport<AppData>;

export type ConsumerTransportType = {
  summonerId: number;
  remoteProducerId: string;
  remoteConsumerId: string;
  consumer: Consumer<AppData>;
  consumerTransport: TransportType;
};

export type VoiceRoomAudioOptionType = {
  speakerVolume: number;
  beforeMuteSpeakerVolume: number;
  isMuteMic: boolean;
};
