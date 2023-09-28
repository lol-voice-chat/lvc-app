import React from 'react';
import * as _ from './style';
import MessageInput from '../@common/message-input';
import ChattingList from '../@common/chatting-list';

function GeneralChatRoom() {
  return (
    <_.GeneralChatRoomContainer>
      <ChattingList />
      <MessageInput />
    </_.GeneralChatRoomContainer>
  );
}

export default GeneralChatRoom;
