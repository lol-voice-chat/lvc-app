import { SummonerRecordType } from '../../../../@type/summoner';
import RankBadge from '../../../@common/rank-badge';
import * as _ from './style';
import React from 'react';

function SummonerProfile(props: {
  summoner: SummonerRecordType | null;
  isBackground: boolean;
  handleClickSummonerProfile: (displayName: string) => void;
}) {
  return (
    <_.ProfileContainer
      isBackground={props.isBackground}
      onClick={() => props.handleClickSummonerProfile(props.summoner?.displayName ?? '')}
    >
      {props.summoner ? (
        <>
          <img id="profile-icon" src={props.summoner.profileImage} alt="소환사 프로필" />
          <_.Information nameLength={props.summoner.displayName.length}>
            <div id="summoner-info">
              <p id="display-name">{props.summoner.displayName}</p>
              <RankBadge size="small" tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
            </div>
          </_.Information>
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          <div id="sk-profile-icon" />
          <_.Information nameLength={0}>
            <div id="sk-summoner-info">
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
