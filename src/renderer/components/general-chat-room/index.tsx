import React, { useEffect, useRef, useState } from 'react';
import * as _ from './style';
import MessageInput from '../@common/message-input';
import ChattingList from './chatting-list';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';
import { Socket } from 'socket.io-client';
import { connectSocket } from '../../utils/socket';
import { SummonerType } from '../../@type/summoner';

export type GeneralChatChildPropsType = {
  socket: Socket | null;
  isConnected: boolean;
  summoner: SummonerType | null;
};

function GeneralChatRoom() {
  const summoner = useRecoilValue(summonerState);

  const chatSocket = useRef<Socket | null>(null);
  const [isConnectedChatSocket, setIsConnectedChatSocket] = useState(false);

  useEffect(() => {
    const socket = connectSocket('/general-chat');

    socket.on('connect', () => {
      chatSocket.current = socket;
      setIsConnectedChatSocket(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <_.GeneralChatRoomContainer>
      <ChattingList
        socket={chatSocket.current}
        isConnected={isConnectedChatSocket}
        summoner={summoner}
      />
      <MessageInput
        socket={chatSocket.current}
        isConnected={isConnectedChatSocket}
        summoner={summoner}
      />
    </_.GeneralChatRoomContainer>
  );
}

export default GeneralChatRoom;
