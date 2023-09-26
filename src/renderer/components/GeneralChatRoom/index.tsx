import React from 'react';
import * as _ from './style';
import MessageInput from '../@common/MessageInput';
import ChattingList from '../@common/ChattingList';

function GeneralChatRoom() {
  return (
    <_.GeneralChatRoomContainer>
      <ChattingList />
      <MessageInput />
    </_.GeneralChatRoomContainer>
  );
}

export default GeneralChatRoom;
