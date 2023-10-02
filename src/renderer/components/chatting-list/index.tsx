import React, { useEffect, useState } from 'react';
import MessageBlock from '../@common/message-block';
import * as _ from './style';
import { SummonerType } from '../../@type/summoner';
import useObserver from '../../hooks/use-observer';
import SkeletonChattingList from './skeleton';
import LoadingDots from '../@common/loading-dots';

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

function ChattingList(props: { socket: WebSocket | null; summoner: SummonerType | null }) {
  const [messageList, setMessageList] = useState<MessageInfoType[] | null>(null);

  const [messageEvent, setMessageEvent] = useState({ key: '' });

  const [curMessagePage, setCurMessagePage] = useState(0);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isFetchEnd, setIsFetchEnd] = useState(false);

  useEffect(() => {
    if (props.socket) {
      props.socket.onmessage = ({ data }) => {
        const payload = JSON.parse(data);

        if (payload.key === 'init') {
          setMessageList(payload.messageList.map((messageInfo) => JSON.parse(messageInfo)));
          setMessageEvent({ key: payload.key });
        }
        if (payload.key === 'message') {
          const { summoner, message, time } = payload;
          setMessageList((msgList) => [...(msgList ?? []), { summoner, message, time }]);

          if (props.summoner?.name === summoner.name) {
            setMessageEvent({ key: payload.key });
          }
        }
        if (payload.key === 'response-before-message') {
          if (payload.messageList.length === 0) {
            setIsFetchEnd(true);
          } else {
            setMessageList((msgList) => [
              ...payload.messageList.map((messageInfo) => JSON.parse(messageInfo)),
              ...(msgList ?? []),
            ]);
          }
          setIsFetchLoading(false);
          setCurMessagePage((curPage) => curPage + 1);
          setMessageEvent({ key: payload.key });
        }
      };
    }
  }, [props.socket, props.summoner]);

  /* 새 메시지 항목별 이벤트 수행 */
  useEffect(() => {
    if (messageEvent.key === 'init') {
      document.getElementById('chat-list-bottom')?.scrollIntoView();
    }
    if (messageEvent.key === 'message') {
      document.getElementById('chat-list-bottom')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (messageEvent.key === 'response-before-message') {
      const container = document.getElementById('chat-list-container');
      container?.scrollTo({ top: prevScrollHeight });
    }
  }, [messageEvent]);

  /* 이전 채팅 목록 불러오기 */
  const fetchBeforeChatList = () => {
    if (props.socket && !isFetchEnd) {
      props.socket.send(JSON.stringify({ key: 'before-message', page: curMessagePage + 1 }));
      setPrevScrollHeight(document.getElementById('chat-list-container')?.scrollHeight as number);
      setIsFetchLoading(true);
    }
  };

  useObserver(
    document.getElementById('chat-list-top') as HTMLDivElement,
    ([entry]: any) => entry.isIntersecting && fetchBeforeChatList()
  );

  return (
    <_.ChatContainer id="chat-list-container">
      {messageList ? (
        <>
          {isFetchLoading && !isFetchEnd ? (
            <div id="loading-container">
              <LoadingDots />
            </div>
          ) : (
            <div id="chat-list-top" />
          )}

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
          <div id="chat-list-bottom" />
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          {Array.from({ length: 15 }, (__, idx) => (
            <SkeletonChattingList key={idx} />
          ))}
        </>
      )}
    </_.ChatContainer>
  );
}

export default ChattingList;
