import React from 'react';
import * as _ from './style';
import { RecentSummonerType } from '../../../../@type/summoner';

function RecentSummonerList(props: {
  recentSummonerList: RecentSummonerType[] | null;
  handleClickSummonerBlock: (puuid: string) => void;
}) {
  return (
    <_.RecentSummonerContainer>
      <_.StatusTag>최근 함께한 소환사</_.StatusTag>
      <_.SummonerList>
        {props.recentSummonerList ? (
          <>
            {props.recentSummonerList?.map(({ puuid, profileImage, displayName }) => (
              <_.SummonerBlock
                key={displayName}
                onClick={() => props.handleClickSummonerBlock(puuid)}
              >
                <img id="summoner-icon" src={profileImage} alt={displayName} />
                <p id="display-name">{displayName}</p>
              </_.SummonerBlock>
            ))}
          </>
        ) : (
          <>
            {/* 스켈레톤 */}
            {Array.from({ length: 20 }, (_, idx) => (
              <div id="sk-summoner-block" key={idx}>
                <div id="sk-summoner-icon" />
                <div id="sk-display-name" />
              </div>
            ))}
          </>
        )}
      </_.SummonerList>
    </_.RecentSummonerContainer>
  );
}

export default RecentSummonerList;
