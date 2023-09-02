import { AppData, Transport, Device, Consumer } from 'mediasoup-client/lib/types';
import { SummonerType } from './summoner';

export type DeviceType = Device;

export type TransportType = Transport<AppData>;

export type LocalProducerType = { id: string } & SummonerType;

export type LocalConsumerTransportType = {
  summonerId: number;
  remoteProducerId: string;
  remoteConsumerId: string;
  consumer: Consumer<AppData>;
  consumerTransport: TransportType;
};
