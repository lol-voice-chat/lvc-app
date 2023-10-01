import React, { useEffect, useRef, useState } from 'react';
import MessageBlock from '../@common/message-block';
import * as _ from './style';

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

  const chatListEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (props.socket) {
      props.socket.onmessage = ({ data }) => {
        const payload = JSON.parse(data);

        if (payload.key === 'init') {
          setMessageList(payload.messageList.map((messageInfo) => JSON.parse(messageInfo)));
        }
        if (payload.key === 'message') {
          const { summoner, message, time } = payload;
          setMessageList((msgList) => [...(msgList ?? []), { summoner, message, time }]);
        }
      };
    }
  }, [props.socket]);

  useEffect(() => {
    // 새 메시지 업데이트할 때 마다 자동 스크롤
    chatListEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  return (
    <_.ChatContainer>
      {messageList ? (
        <>
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
          <div ref={chatListEndRef} />
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          {Array.from({ length: 15 }, (__, idx) => (
            <_.SkellMessageBlock>
              <div id="sk-summoner-profile" key={idx}>
                <div id="sk-icon" />
                <div id="sk-rank-badge" />
              </div>
              <div id="sk-content">
                <div id="sk-name-tag" />
                {Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, idx) => (
                  <div id="sk-text-bundle" key={idx}>
                    {Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, idx) => (
                      <div
                        id="sk-text"
                        key={idx}
                        style={{
                          width: (Math.random() * 100 + 55).toString() + 'px',
                          opacity: Math.random(),
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </_.SkellMessageBlock>
          ))}
        </>
      )}
    </_.ChatContainer>
  );
}

export default ChattingList;
