import React, { useEffect, useState } from 'react';
import { SummonerType } from '../../../../@type/summoner';
import RankBadge from '../../../@common/rank-badge';
import * as _ from './style';
import InfoBox from '../../../@common/info-box';
import useHover from '../../../../hooks/use-hover';
import friend_request_icon from '../../../../asset/icon/friend_request_icon.svg';
const { ipcRenderer } = window.require('electron');

type SummonerProfilePropsType = {
  summoner: SummonerType | null;
  isFriend: boolean;
  isBackground: boolean;
  handleClickSummonerProfile: (summoner: SummonerType) => void;
};

function SummonerProfile(props: SummonerProfilePropsType) {
  const [isRequested, setIsRequested] = useState(false);

  const { state } = useHover({ elementIds: ['friend-request-badge'] });

  useEffect(() => {
    setIsRequested(false);
  }, [props.summoner]);

  const handleClickProfile = (e: any) => {
    if (props.summoner && e.target.id !== 'friend-request-badge') {
      props.summoner && props.handleClickSummonerProfile(props.summoner);
    }
  };

  const handleClickRequestFriend = () => {
    ipcRenderer.send('friend-request', props.summoner);
    setIsRequested(true);
  };

  return (
    <_.ProfileContainer isBackground={props.isBackground} onClick={(e) => handleClickProfile(e)}>
      {props.summoner ? (
        <>
          <img id="profile-icon" src={props.summoner.profileImage} />

          <_.Information nameLength={props.summoner.name.length}>
            <div id="summoner-info">
              <p id="name">{props.summoner.name}</p>

              <div id="badge-bundle">
                <RankBadge size="small" tierImg="" tier={props.summoner.tier} />

                {!props.isFriend && !isRequested && (
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
                      src={friend_request_icon}
                      onClick={handleClickRequestFriend}
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
