import React from 'react';
import * as _ from './style';
import UserIconWithStatus from '../@common/UserIconWithStatus';

function SummonerFriendList() {
  return (
    <_.FriendList>
      <_.StatusTag>온라인</_.StatusTag>
      <_.SummonerBlock>
        <UserIconWithStatus
          userIcon="img/warning_icon.svg"
          status="img/user-status/online_icon.svg"
          borderColor="#2B2D31"
        />
        <p id="display-name">무붕무붕</p>
      </_.SummonerBlock>

      <_.StatusTag>오프라인</_.StatusTag>
    </_.FriendList>
  );
}

export default SummonerFriendList;
