import React from 'react';
import { RecentSummonerType } from '..';
import { SummonerType } from '../../../../@type/summoner';
import RankBadge from '../../../@common/rank-badge';
import * as _ from './style';
import InfoBox from '../../../@common/info-box';
import useHover from '../../../../hooks/use-hover';

type SummonerProfilePropsType = {
  summoner: SummonerType | RecentSummonerType | null;
  isMine: SummonerType | null;
  isBackground: boolean;
  handleClickSummonerProfile: (summoner: SummonerType) => void;
  handleClickAddFriend: (summonerInfo: RecentSummonerType) => void;
};

function SummonerProfile(props: SummonerProfilePropsType) {
  const { state } = useHover({ elementIds: ['friend-request-badge'] });

  const handleClickRequestFriend = (e: any) => {
    // if (document.getElementById('friend-request-badge') !== e.target) {
    //   props.handleClickSummonerProfile(props.isMine === props.summoner);
    // }
  };

  return (
    <_.ProfileContainer
      isBackground={props.isBackground}
      onClick={() => {
        if (props.summoner) {
          props.handleClickSummonerProfile(props.summoner);
        }
      }}
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
                    <div id="friend-request-box">
                      {state.get('friend-request-badge') && (
                        <InfoBox
                          width={65}
                          height={27.5}
                          infoElement={<p id="info-text">친구 요청</p>}
                        />
                      )}
                      <img
                        id="friend-request-badge"
                        src="img/friend_request_icon.svg"
                        onClick={() =>
                          props.handleClickAddFriend(props.summoner as RecentSummonerType)
                        }
                      />
                    </div>
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
