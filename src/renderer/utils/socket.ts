import { Socket, io } from 'socket.io-client';
import { PATH } from '../const';
import { createContext } from 'react';

export const connectSocket = (namespace: string) => {
  return io(PATH.SERVER_URL + namespace, { transports: ['websocket'] });
};

export const TeamSocketContext = createContext<Socket | null>(null);
