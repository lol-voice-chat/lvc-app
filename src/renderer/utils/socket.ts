import { io } from 'socket.io-client';
import { PATH } from '../const';

export const connectSocket = (namespace) => {
  return io(PATH.SERVER_URL + namespace, { transports: ['websocket'] });
};
