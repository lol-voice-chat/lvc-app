import { SummonerRecordType } from '../../../../@type/summoner';
import RankBadge from '../../../@common/RankBadge';
import * as _ from './style';
import React, { useState } from 'react';

function SummonerProfile(props: {
  summoner: SummonerRecordType | null;
  isBackground: boolean;
  handleClickSummonerProfile: (displayName: string) => void;
}) {
  const [statusMessageHover, setStatusMessageHover] = useState(false);

  return (
    <_.ProfileContainer
      isBackground={props.isBackground}
      onClick={() => props.handleClickSummonerProfile(props.summoner?.displayName ?? '')}
    >
      {props.summoner ? (
        <>
          <img id="profile-icon" src={props.summoner.profileImage} alt="소환사 프로필" />
          <_.Information
            nameLength={props.summoner.displayName.length}
            statusMessageLength={props.summoner.statusMessage.length}
          >
            <div id="name-tag">
              <p id="display-name">{props.summoner.displayName}</p>
              {props.summoner.tier !== '' && (
                <RankBadge size="small" tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
              )}
            </div>
            <p
              id="status-message"
              onMouseEnter={() => setStatusMessageHover(true)}
              onMouseLeave={() => setStatusMessageHover(false)}
            >
              {props.summoner.statusMessage}
            </p>
            {props.summoner.statusMessage.length > 11 && statusMessageHover && (
              <div id="more-status-message">{props.summoner.statusMessage}</div>
            )}
          </_.Information>
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          <div id="sk-profile-icon" />
          <_.Information nameLength={0} statusMessageLength={0}>
            <div id="sk-name-tag">
              <div id="sk-display-name" />
              <div id="sk-rank-badge" />
            </div>
            <div id="sk-status-message" />
          </_.Information>
        </>
      )}
    </_.ProfileContainer>
  );
}

export default SummonerProfile;
