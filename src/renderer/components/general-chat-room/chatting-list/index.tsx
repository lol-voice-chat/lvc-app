import React, { useEffect, useRef, useState } from 'react';
import MessageBlock from '../../@common/message-block';
import * as _ from './style';
import useObserver from '../../../hooks/use-observer';
import SkeletonChattingList from './skeleton';
import { GeneralChatChildPropsType } from '..';
import { SummonerType } from '../../../@type/summoner';

type MessageInfoType = {
  summoner: SummonerType;
  message: string;
  time: string;
};

type MessageEventType = 'none' | 'init' | 'message' | 'response-before-message';

function ChattingList(props: GeneralChatChildPropsType) {
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
    function responseBeforeMessage(payload: { isLast: boolean; messageList: MessageInfoType[] }) {
      const { isLast, messageList } = payload;

      setMessageList((msgList) => [...messageList, ...(msgList ?? [])]);
      setFetchingPage((page) => page + 1);
      setIsFetchLoading(false);
      setIsFetchEnd(isLast);
      setMessageEvent({ key: 'response-before-message' });
    }

    if (props.isConnected) {
      props.socket?.emit('init', (messageList: MessageInfoType[]) => {
        setMessageList(messageList);
        setMessageEvent({ key: 'init' });
      });

      props.socket?.on('response-before-message', responseBeforeMessage);
    }

    return () => {
      props.socket?.off('response-before-message', responseBeforeMessage);
    };
  }, [props.isConnected]);

  useEffect(() => {
    function message(payload: MessageInfoType) {
      const { summoner, message, time } = payload;

      setMessageList((msgList) => [...(msgList ?? []), { summoner, message, time }]);

      if (containerRef.current) {
        const isScrollEnd =
          containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight - 100;

        /* 롤 클라이언트 꺼진 상태 */
        if (!props.summoner) {
          isScrollEnd ? setMessageEvent({ key: 'message' }) : setIsReceiveNewMsg(true);
        }
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

    if (props.isConnected) {
      props.socket?.on('message', message);
    }

    return () => {
      props.socket?.off('message', message);
    };
  }, [props.isConnected, props.summoner]);

  /* 받은 메시지 항목별 이벤트 수행 */
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
  useObserver(topRef, ([entry]: any) => {
    if (entry.isIntersecting && props.isConnected) {
      props.socket?.emit('before-message', fetchingPage + 1);

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
              summoner={summoner}
              time={time}
              messageType="text"
              message={message}
              key={idx}
            />
          ))}

          {isReceiveNewMsg && (
            <div id="new-message-alram" onClick={handleClickNewMessageAlram}>
              새로운 메시지가 왔습니다
            </div>
          )}

          <div ref={bottomRef} style={{ marginBottom: '25px' }} />
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
