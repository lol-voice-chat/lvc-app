import React from 'react';
import { LeagueChampInfoType } from '../../@store/atom';
import { SummonerStatsType } from '../../@type/summoner';
import warning_icon from '../../asset/icon/warning_icon.svg';
import * as _ from './style';

type GameRecordPropsType = {
  summonerStats: SummonerStatsType | null;
  myChampInfo: LeagueChampInfoType | null;
};

function GameRecord(props: GameRecordPropsType) {
  return (
    <>
      {props.summonerStats && props.summonerStats.statsList.length > 0 ? (
        <>
          <_.WinningPercentage odds={props.summonerStats.odds}>
            <_.ProgressBar>
              <progress
                value={props.summonerStats.winCount}
                max={props.summonerStats.winCount + props.summonerStats.failCount}
              />
              <p id="win">{props.summonerStats.winCount}W</p>
              <p id="fail">{props.summonerStats.failCount}L</p>
            </_.ProgressBar>
            <p id="odds">{props.summonerStats.odds}%</p>
          </_.WinningPercentage>
          <_.AverageKDA>
            <p>평균 KDA</p>
            <p id="value">{props.myChampInfo?.kda ?? props.summonerStats.kda}</p>
          </_.AverageKDA>
          <_.KDAList>
            {props.summonerStats.statsList.map(({ isWin, kda, championIcon }, idx) => (
              <div style={{ backgroundColor: isWin ? '#0F3054' : '#50383B' }} key={idx}>
                <img src={championIcon} />
                <p>{kda}</p>
              </div>
            ))}
          </_.KDAList>
        </>
      ) : (
        <div id="warning-box">
          <p>전적이 없습니다.</p>
          <img src={warning_icon} />
          <p id="warning-text">( 현재시즌 솔로랭크 전적이 없습니다 )</p>
        </div>
      )}
    </>
  );
}

export default React.memo(GameRecord);
