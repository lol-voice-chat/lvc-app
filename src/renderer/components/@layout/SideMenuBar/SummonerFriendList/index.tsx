import React, { useEffect, useState } from 'react';
import * as _ from './style';
import SummonerIcon from '../../../@common/SummonerIcon';
import { Socket } from 'socket.io-client';
import { FriendType, SummonerType } from '../../../../@type/summoner';
const { ipcRenderer } = window.require('electron');

function SummonerFriendList(props: {
  friendSocket: Socket | null;
  summoner: SummonerType | null;
  handleClickSummonerBlock: (puuid: string) => void;
}) {
  const [initFriendList, setInitFriendList] = useState(false);

  const [onlineSummonerList, setOnlineSummonerList] = useState<FriendType[] | null>(null);
  const [offlineSummonerList, setOfflineSummonerList] = useState<FriendType[] | null>(null);

  useEffect(() => {
    if (!initFriendList && props.summoner) {
      props.friendSocket?.emit(
        'online-summoner',
        {
          summoner: {
            puuid: props.summoner.puuid,
            summonerId: props.summoner.summonerId,
            profileImage: props.summoner.profileImage,
            displayName: props.summoner.displayName,
          },
          onlineFriendList: props.summoner.onlineFriendList,
          offlineFriendList: props.summoner.offlineFriendList,
        },
        ({ onlineFriendList, offlineFriendList }) => {
          setOnlineSummonerList(onlineFriendList);
          setOfflineSummonerList(offlineFriendList);
          setInitFriendList(true);
        }
      );

      ipcRenderer.once('shutdown-app', () => {
        props.friendSocket?.emit('offline-summoner', {
          puuid: props.summoner?.puuid,
          summonerId: props.summoner?.summonerId,
          profileImage: props.summoner?.profileImage,
          displayName: props.summoner?.displayName,
        });
      });
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
  }, [onlineSummonerList, offlineSummonerList]);

  return (
    <_.FriendList>
      {initFriendList ? (
        <>
          <_.StatusTag>온라인</_.StatusTag>
          {onlineSummonerList?.map(({ puuid, profileImage, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={'온라인'} borderColor="#2B2D31" />
              <p id="display-name">{displayName}</p>
            </_.SummonerBlock>
          ))}
          <_.StatusTag style={{ marginTop: '50px' }}>오프라인</_.StatusTag>
          {offlineSummonerList?.map(({ puuid, profileImage, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={'오프라인'} borderColor="#2B2D31" />
              <p id="display-name">{displayName}</p>
            </_.SummonerBlock>
          ))}
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          <_.StatusTag>온라인</_.StatusTag>
          {Array.from({ length: 4 }, (_, idx) => (
            <div id="sk-summoner-block" key={idx}>
              <div id="sk-user-icon" />
              <div id="sk-display-name" />
            </div>
          ))}
          <_.StatusTag style={{ marginTop: '50px' }}>오프라인</_.StatusTag>
          {Array.from({ length: 20 }, (_, idx) => (
            <div id="sk-summoner-block" key={idx}>
              <div id="sk-user-icon" />
              <div id="sk-display-name" />
            </div>
          ))}
        </>
      )}
    </_.FriendList>
  );
}

export default SummonerFriendList;
