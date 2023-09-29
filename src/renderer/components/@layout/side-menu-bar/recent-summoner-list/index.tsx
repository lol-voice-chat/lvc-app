import React from 'react';
import * as _ from './style';
import { SummonerType } from '../../../../@type/summoner';

function RecentSummonerList(props: {
  recentSummonerList: SummonerType[] | null;
  handleClickSummonerBlock: (summonerData: SummonerType) => void;
}) {
  return (
    <_.RecentSummonerContainer>
      <_.StatusTag>최근 함께한 소환사</_.StatusTag>

      <_.SummonerList>
        {props.recentSummonerList ? (
          <>
            {props.recentSummonerList?.map((summoner) => (
              <_.SummonerBlock
                key={summoner.id}
                onClick={() => props.handleClickSummonerBlock(summoner)}
              >
                <img id="summoner-icon" src={summoner.profileImage} />
                <p id="name">{summoner.name}</p>
              </_.SummonerBlock>
            ))}
          </>
        ) : (
          <>
            {/* 스켈레톤 */}
            {Array.from({ length: 20 }, (_, idx) => (
              <div id="sk-summoner-block" key={idx}>
                <div id="sk-summoner-icon" />
                <div id="sk-name" />
              </div>
            ))}
          </>
        )}
      </_.SummonerList>
    </_.RecentSummonerContainer>
  );
}

export default RecentSummonerList;
