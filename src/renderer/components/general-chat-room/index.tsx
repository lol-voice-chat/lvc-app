import React, { useEffect, useState } from 'react';
import * as _ from './style';
import MessageInput from '../@common/message-input';
import ChattingList from '../chatting-list';

function GeneralChatRoom() {
  const [generalChatSocket, setGeneralChatSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_SERVER_URL as string);
    setGeneralChatSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <_.GeneralChatRoomContainer>
      <ChattingList socket={generalChatSocket} />
      <MessageInput socket={generalChatSocket} />
    </_.GeneralChatRoomContainer>
  );
}

export default GeneralChatRoom;
