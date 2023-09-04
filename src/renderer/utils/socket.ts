import { io } from 'socket.io-client';
import { PATH } from '../const';

export const initSocket = (namespace) => {
  return io(PATH.SERVER_URL + namespace, { transports: ['websocket'] });
};
