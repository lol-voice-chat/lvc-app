import React, { useEffect, useState } from 'react';
import * as _ from './style';
import SummonerIcon from '../@common/SummonerIcon';
import { Socket } from 'socket.io-client';
import { FriendType, SummonerType } from '../../@type/summoner';

function SummonerFriendList(props: {
  friendSocket: Socket | null;
  summoner: SummonerType | null;
  handleClickSummonerBlock: (id: string, puuid: string) => void;
}) {
  const [initFriendList, setInitFriendList] = useState(false);

  const [onlineSummonerList, setOnlineSummonerList] = useState<FriendType[] | null>(null);
  const [offlineSummonerList, setOfflineSummonerList] = useState<FriendType[] | null>(null);

  useEffect(() => {
    if (!initFriendList && props.summoner) {
      props.friendSocket?.emit(
        'summoner-online',
        {
          summoner: {
            id: props.summoner.id,
            puuid: props.summoner.puuid,
            profileImage: props.summoner.profileImage,
            displayName: props.summoner.displayName,
          },
          onlineFriendList: props.summoner.onlineFriendList,
        },
        ({ onlineFriendList, offlineFriendList }) => {
          setOnlineSummonerList(onlineFriendList);
          setOfflineSummonerList(offlineFriendList);
          setInitFriendList(true);
        }
      );
    }
  }, [props.summoner]);

  useEffect(() => {
    function updateFriendOnline(friend: FriendType) {
      if (!onlineSummonerList || !offlineSummonerList) return;

      setOnlineSummonerList([...onlineSummonerList, friend]);
      setOfflineSummonerList(
        [...offlineSummonerList].filter((summoner) => friend.displayName !== summoner.displayName)
      );
    }
    function updateFriendOffline(friend: FriendType) {
      if (!onlineSummonerList || !offlineSummonerList) return;

      setOfflineSummonerList([...offlineSummonerList, friend]);
      setOnlineSummonerList(
        [...onlineSummonerList].filter((summoner) => friend.displayName !== summoner.displayName)
      );
    }

    props.friendSocket?.on('online-friend', updateFriendOnline);
    props.friendSocket?.on('offline-friend', updateFriendOffline);

    return () => {
      props.friendSocket?.off('online-friend', updateFriendOnline);
      props.friendSocket?.off('offline-friend', updateFriendOffline);
    };
  }, [props.friendSocket]);

  return (
    <_.FriendList>
      {initFriendList ? (
        <>
          <_.StatusTag>온라인</_.StatusTag>
          {onlineSummonerList?.map(({ id, puuid, profileImage, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(id, puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={'온라인'} borderColor="#2B2D31" />
              <p id="display-name">{displayName}</p>
            </_.SummonerBlock>
          ))}

          <_.StatusTag>오프라인</_.StatusTag>
          {offlineSummonerList?.map(({ id, puuid, profileImage, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(id, puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={'오프라인'} borderColor="#2B2D31" />
              <p id="display-name">{displayName}</p>
            </_.SummonerBlock>
          ))}
        </>
      ) : (
        <>{/* 스켈레톤 */} </>
      )}
    </_.FriendList>
  );
}

export default SummonerFriendList;
