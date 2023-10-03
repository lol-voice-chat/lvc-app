import React, { useEffect, useState } from 'react';
import MessageBlock from '../../@common/message-block';
import * as _ from './style';
import { SummonerType } from '../../../@type/summoner';
import useObserver from '../../../hooks/use-observer';
import SkeletonChattingList from './skeleton';

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

  const [isReceiveNewMsg, setIsReceiveNewMsg] = useState(false);

  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [fetchingMsgPage, setFetchingMsgPage] = useState(0);
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

          const target = document.getElementById('chat-list-container') as HTMLDivElement;
          const isScrollEnd = target.scrollTop + target.clientHeight >= target.scrollHeight - 30;

          /* 내가 보낸 거 or 최신 메시지 보는 중 */
          if (props.summoner?.name === summoner.name || isScrollEnd) {
            setMessageEvent({ key: payload.key });
          }
          /* 남이 보낸 거 and 이전 메시지 보는 중 */
          if (props.summoner?.name !== summoner.name && !isScrollEnd) {
            setIsReceiveNewMsg(true);
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
            setFetchingMsgPage((page) => page + 1);
            setMessageEvent({ key: payload.key });
          }
        }
      };
    }
  }, [props.socket, props.summoner]);

  /* 새 메시지 항목별 이벤트 수행 */
  useEffect(() => {
    if (messageEvent.key === 'init' || messageEvent.key === 'message') {
      document.getElementById('chat-list-bottom')?.scrollIntoView();
    }
    if (messageEvent.key === 'response-before-message') {
      const container = document.getElementById('chat-list-container');
      if (container) {
        container.scrollTo({ top: container.scrollHeight - prevScrollHeight });
      }
    }
  }, [messageEvent]);

  /* chat-list-top 감지되면 이전 채팅목록 불러오기 */
  useObserver(
    document.getElementById('chat-list-top') as HTMLDivElement,
    ([entry]: any) => {
      if (entry.isIntersecting && props.socket) {
        props.socket.send(JSON.stringify({ key: 'before-message', page: fetchingMsgPage + 1 }));
        const curScrollHeight = document.getElementById('chat-list-container')?.scrollHeight;
        curScrollHeight && setPrevScrollHeight(curScrollHeight);
      }
    },
    null,
    '100px',
    0.1
  );

  const handleClickNewMessageAlram = () => {
    document.getElementById('chat-list-bottom')?.scrollIntoView();
    setIsReceiveNewMsg(false);
  };

  return (
    <_.ChatContainer id="chat-list-container">
      {messageList ? (
        <>
          {!isFetchEnd && <div id="chat-list-top" />}

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

          {isReceiveNewMsg && <div id="new-message-alram" onClick={handleClickNewMessageAlram} />}
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
