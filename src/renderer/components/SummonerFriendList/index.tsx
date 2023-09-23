import React, { useEffect, useState } from 'react';
import * as _ from './style';
import SummonerIcon from '../@common/SummonerIcon';
import { FriendProfileType } from '../../@type/summoner';

function SummonerFriendList(props: {
  friendProfileList: FriendProfileType[] | null;
  handleClickSummonerBlock: (id: string, puuid: string) => void;
}) {
  const [initializeFriendList, setInitalizeFriendList] = useState(false);
  const [onlineSummonerList, setOnlineSummonerList] = useState<FriendProfileType[] | null>(null);
  const [offlineSummonerList, setOfflineSummonerList] = useState<FriendProfileType[] | null>(null);

  useEffect(() => {
    if (props.friendProfileList && !initializeFriendList) {
      setOnlineSummonerList(
        props.friendProfileList.filter((summoner) => summoner.status === '온라인')
      );
      setOfflineSummonerList(
        props.friendProfileList.filter((summoner) => summoner.status === '오프라인')
      );
      setInitalizeFriendList(true);
    }
  }, [props.friendProfileList]);

  return (
    <_.FriendList>
      {initializeFriendList ? (
        <>
          <_.StatusTag>온라인</_.StatusTag>
          {onlineSummonerList?.map(({ id, puuid, profileImage, status, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(id, puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={status} borderColor="#2B2D31" />
              <p id="display-name">{displayName}</p>
            </_.SummonerBlock>
          ))}

          <_.StatusTag>오프라인</_.StatusTag>
          {offlineSummonerList?.map(({ id, puuid, profileImage, status, displayName }) => (
            <_.SummonerBlock
              key={displayName}
              onClick={() => props.handleClickSummonerBlock(id, puuid)}
            >
              <SummonerIcon userIcon={profileImage} status={status} borderColor="#2B2D31" />
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
