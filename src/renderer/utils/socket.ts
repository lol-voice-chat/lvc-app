import { Socket, connect } from 'socket.io-client';
import { PATH } from '../const';
import { createContext } from 'react';

export const connectSocket = (namespace: string) => {
  return connect(PATH.SERVER_URL + namespace, { transports: ['websocket'] });
};

export const TeamSocketContext = createContext<Socket | null>(null);
