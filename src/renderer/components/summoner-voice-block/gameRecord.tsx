import { PALETTE } from '../../const';
import warning_icon from '../../asset/icon/warning_icon.svg';
import * as _ from './style';
import { SummonerStatsType } from '../../@type/summoner';
import React from 'react';

type GameRecordPropsType = {
  summonerStats: SummonerStatsType | null;
};

function GameRecord(props: GameRecordPropsType) {
  return (
    <_.GameRecord>
      {/* 이번 시즌 전적이 없을 경우 알림창 */}
      {props.summonerStats ? (
        props.summonerStats.statsList.length > 0 ? (
          <_.WinningPercentage>
            <_.Text>
              <p>승률</p>
              <p id="value">{props.summonerStats.odds}%</p>
            </_.Text>
            <_.ProgressBar>
              <progress
                value={props.summonerStats.winCount}
                max={props.summonerStats.winCount + props.summonerStats.failCount}
              />
              <p id="win">{props.summonerStats.winCount}W</p>
              <p id="fail">{props.summonerStats.failCount}L</p>
            </_.ProgressBar>
            <_.KDAList>
              {props.summonerStats.statsList.map(({ isWin, championIcon, kda }, idx) => (
                <div style={{ backgroundColor: isWin ? '#0F3054' : '#50383B' }} key={idx}>
                  <img src={championIcon} />
                  <p>{kda}</p>
                </div>
              ))}
            </_.KDAList>
          </_.WinningPercentage>
        ) : (
          <div id="warning-box">
            <img src={warning_icon} />
            <p>전적이 없습니다.</p>
          </div>
        )
      ) : (
        <_.WinningPercentage>
          <_.Text>
            <p>승률</p>
            <p>%</p>
          </_.Text>
          <_.ProgressBar>
            <div id="sk-progress-bar" />
          </_.ProgressBar>
          <_.KDAList>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div style={{ backgroundColor: PALETTE.GRAY_2 }} key={idx} />
            ))}
          </_.KDAList>
        </_.WinningPercentage>
      )}
    </_.GameRecord>
  );
}

export default React.memo(GameRecord);
