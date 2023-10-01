import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MessageBlock from './message-block';

type MessageInfoType = {
  summoner: {
    name: string;
    profileImage: string;
    tier: string;
    tierImage: string;
  };
  message: string;
  time: string;
};

function ChattingList(props: { socket: WebSocket | null }) {
  const [messageList, setMessageList] = useState<MessageInfoType[] | null>(null);

  useEffect(() => {
    if (props.socket) {
      props.socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.key === 'init') {
          setMessageList(payload.messageList.map((messageInfo) => JSON.parse(messageInfo)));
        }
        if (payload.key === 'message') {
          const { summoner, message, time } = payload;
          setMessageList([...(messageList ?? []), { summoner, message, time }]);
        }
      };
    }
  }, [props.socket, messageList]);

  return (
    <ChatContainer>
      {messageList?.map(({ summoner, message, time }, idx) => (
        <MessageBlock
          summonerIcon={summoner.profileImage}
          tier={summoner.tier}
          tierImg={summoner.tierImage}
          name={summoner.name}
          time={time}
          messageType="text"
          message={message}
          key={idx}
        />
      ))}
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 90vh;

  overflow-x: hidden;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default ChattingList;
