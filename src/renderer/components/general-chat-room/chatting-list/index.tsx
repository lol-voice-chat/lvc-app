import React, { useEffect, useRef, useState } from 'react';
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

type MessageEventType = 'none' | 'init' | 'message' | 'response-before-message';

function ChattingList(props: { socket: WebSocket | null; summoner: SummonerType | null }) {
  const [messageList, setMessageList] = useState<MessageInfoType[] | null>(null);
  const [messageEvent, setMessageEvent] = useState<{ key: MessageEventType }>({ key: 'none' });

  const [isReceiveNewMsg, setIsReceiveNewMsg] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [fetchingPage, setFetchingPage] = useState(0);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isFetchEnd, setIsFetchEnd] = useState(false);

  useEffect(() => {
    if (props.socket) {
      props.socket.onmessage = ({ data }) => {
        if (!data) return;

        const payload = JSON.parse(data);

        if (payload.key === 'init') {
          setMessageList(payload.messageList.map((messageInfo: string) => JSON.parse(messageInfo)));
          setMessageEvent({ key: 'init' });
        }

        if (payload.key === 'message') {
          const { summoner, message, time } = payload;
          setMessageList((msgList) => [...(msgList ?? []), { summoner, message, time }]);

          if (containerRef.current) {
            const isScrollEnd =
              containerRef.current.scrollTop + containerRef.current.clientHeight >=
              containerRef.current.scrollHeight - 100;

            /* 내가 보낸 거 or 최신 메시지 보는 중 */
            if (props.summoner?.name === summoner.name || isScrollEnd) {
              setMessageEvent({ key: 'message' });
            }
            /* 남이 보낸 거 and 이전 메시지 보는 중 */
            if (props.summoner?.name !== summoner.name && !isScrollEnd) {
              setIsReceiveNewMsg(true);
            }
          }
        }

        if (payload.key === 'response-before-message') {
          if (payload.isLast) setIsFetchEnd(true);

          setMessageList((msgList) => [
            ...payload.messageList.map((messageInfo: string) => JSON.parse(messageInfo)),
            ...(msgList ?? []),
          ]);
          setFetchingPage((page) => page + 1);
          setMessageEvent({ key: 'response-before-message' });
          setIsFetchLoading(false);
        }
      };
    }
  }, [props.socket, props.summoner]);

  /* new 메시지 종류별 이벤트 수행 */
  useEffect(() => {
    if (messageEvent.key === 'init' || messageEvent.key === 'message') {
      bottomRef.current?.scrollIntoView();
    }
    if (messageEvent.key === 'response-before-message') {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight - prevScrollHeight,
      });
    }
  }, [messageEvent]);

  /* 이전 채팅목록 불러오기 */
  useObserver(topRef, ([entry]: any) => () => {
    if (entry.isIntersecting && props.socket) {
      props.socket.send(JSON.stringify({ key: 'before-message', page: fetchingPage + 1 }));
      const curScrollHeight = containerRef.current?.scrollHeight;
      if (curScrollHeight) {
        setPrevScrollHeight(curScrollHeight);
        setIsFetchLoading(true);
      }
    }
  });

  const handleClickNewMessageAlram = () => {
    bottomRef.current?.scrollIntoView();
    setIsReceiveNewMsg(false);
  };

  return (
    <_.ChatContainer ref={containerRef}>
      {messageList ? (
        <>
          {!isFetchEnd && !isFetchLoading && <div ref={topRef} />}

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

          <div ref={bottomRef} />
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          {Array.from({ length: 6 }, (__, idx) => (
            <SkeletonChattingList key={idx} />
          ))}
        </>
      )}
    </_.ChatContainer>
  );
}

export default ChattingList;
