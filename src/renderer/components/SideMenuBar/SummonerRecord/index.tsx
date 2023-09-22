import React from 'react';
import * as _ from './style';
import { SummonerRecordType } from '../../../@type/summoner';

function SummonerRecord(props: { summonerRecord: SummonerRecordType | null }) {
  return (
    <_.RecordContainer>
      {props.summonerRecord ? (
        <>
          <_.AverageInfo>
            <div id="info-category">
              <p id="name">KDA</p>
              <p id="value">{props.summonerRecord.summonerStats.kda}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 피해량</p>
              <p id="value">{props.summonerRecord.summonerStats.damage}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 CS</p>
              <p id="value">{props.summonerRecord.summonerStats.cs}</p>
            </div>
            <div id="info-category">
              <p id="name">모스트 챔피언</p>
              <div id="most-champ-list">
                {props.summonerRecord.summonerStats.mostChampionList.map((championIcon) => (
                  <img src={championIcon} alt="챔피언 아이콘" />
                ))}
              </div>
            </div>
          </_.AverageInfo>

          <_.WinningPercentage>
            <div id="winning-percentage-text">
              <p>승률</p>
              <p id="value">{props.summonerRecord.summonerStats.odds}</p>
            </div>
            <_.ProgressBar>
              <progress
                value={props.summonerRecord.summonerStats.winCount}
                max={
                  props.summonerRecord.summonerStats.winCount +
                  props.summonerRecord.summonerStats.failCount
                }
              />
              <p id="win">{props.summonerRecord.summonerStats.winCount}W</p>
              <p id="fail">{props.summonerRecord.summonerStats.failCount}L</p>
            </_.ProgressBar>
          </_.WinningPercentage>

          <_.RecentlyPlayList>
            <div id="category-tag">
              <p>최근 플레이</p>
              <p>킬관여</p>
            </div>
            {props.summonerRecord.summonerStats.statsList.map(
              ({ championIcon, kda, isWin, killInvolvement }) => (
                <div id="game-info">
                  <div id="kda-info">
                    <img src={championIcon} alt="챔피언 아이콘" />
                    <div style={{ backgroundColor: isWin ? '#2C334A' : '#50383b' }}>{kda}</div>
                  </div>
                  <p id="kill-involvement">{killInvolvement}%</p>
                </div>
              )
            )}
          </_.RecentlyPlayList>
        </>
      ) : (
        <>{/* 스켈레톤 */}</>
      )}
    </_.RecordContainer>
  );
}

export default SummonerRecord;
