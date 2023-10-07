import { RecentSummonerType } from '..';
import { SummonerType } from '../../../../@type/summoner';
import RankBadge from '../../../@common/rank-badge';
import * as _ from './style';
import React from 'react';
const { ipcRenderer } = window.require('electron');

function SummonerProfile(props: {
  summoner: SummonerType | RecentSummonerType | null;
  isMine: SummonerType | null;
  isBackground: boolean;
  handleClickSummonerProfile: (isMine: boolean) => void;
  handleClickAddFriend: (summonerInfo: RecentSummonerType) => void;
}) {
  return (
    <_.ProfileContainer
      isBackground={props.isBackground}
      onClick={() => props.handleClickSummonerProfile(props.isMine === props.summoner)}
    >
      {props.summoner ? (
        <>
          <img id="profile-icon" src={props.summoner.profileImage} />
          <_.Information nameLength={props.summoner.name.length}>
            <div id="summoner-info">
              <p id="name">{props.summoner.name}</p>
              <div id="badge-bundle">
                <RankBadge size="small" tierImg="img/dummy_rank.png" tier={props.summoner.tier} />
                {!(props.isMine === props.summoner) &&
                  !(props.summoner as RecentSummonerType).isRequested && (
                    <img
                      id="friend-add-badge"
                      src="img/friend_add_icon.svg"
                      onClick={() =>
                        props.handleClickAddFriend(props.summoner as RecentSummonerType)
                      }
                    />
                  )}
              </div>
            </div>
          </_.Information>
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          <div id="sk-profile-icon" />
          <_.Information nameLength={0}>
            <div id="sk-summoner-info">
              <div id="sk-name" />
              <div id="sk-badge-bundle">
                <div id="sk-rank-badge" />
                <div id="sk-friend-badge" />
              </div>
            </div>
            <div id="sk-status-message" />
          </_.Information>
        </>
      )}
    </_.ProfileContainer>
  );
}

export default SummonerProfile;
