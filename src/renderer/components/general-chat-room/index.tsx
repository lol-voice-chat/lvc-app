import React, { useEffect, useRef, useState } from 'react';
import * as _ from './style';
import MessageInput from '../@common/message-input';
import ChattingList from './chatting-list';
import { useRecoilValue } from 'recoil';
import { summonerState } from '../../@store/atom';
import { Socket } from 'socket.io-client';
import { connectSocket } from '../../utils/socket';

function GeneralChatRoom() {
  const summoner = useRecoilValue(summonerState);

  const chatSocket = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = connectSocket('/general-chat');
    chatSocket.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <_.GeneralChatRoomContainer>
      <ChattingList socket={chatSocket.current} summoner={summoner} />
      <MessageInput socket={chatSocket.current} summoner={summoner} />
    </_.GeneralChatRoomContainer>
  );
}

export default GeneralChatRoom;
