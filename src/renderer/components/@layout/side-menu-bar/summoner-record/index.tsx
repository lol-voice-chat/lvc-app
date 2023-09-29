import React from 'react';
import * as _ from './style';
import { SummonerType } from '../../../../@type/summoner';

function SummonerRecord(props: { summonerData: SummonerType | null }) {
  return (
    <_.RecordContainer>
      {props.summonerData ? (
        <>
          <_.AverageInfo>
            <div id="info-category">
              <p id="name">KDA</p>
              <p id="value">{props.summonerData.summonerStats.kda}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 피해량</p>
              <p id="value">{props.summonerData.summonerStats.damage}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 CS</p>
              <p id="value">{props.summonerData.summonerStats.cs}</p>
            </div>
            <div id="info-category">
              <p id="name">모스트 챔피언</p>
              <div id="most-champ-list">
                {props.summonerData.summonerStats.mostChampionList.map((championIcon) => (
                  <img src={championIcon} alt="챔피언 아이콘" />
                ))}
              </div>
            </div>
          </_.AverageInfo>

          <_.WinningPercentage>
            <div id="winning-percentage-text">
              <p>승률</p>
              <p id="value">{props.summonerData.summonerStats.odds}%</p>
            </div>
            <_.ProgressBar>
              <progress
                value={props.summonerData.summonerStats.winCount}
                max={
                  props.summonerData.summonerStats.winCount +
                  props.summonerData.summonerStats.failCount
                }
              />
              <p id="win">{props.summonerData.summonerStats.winCount}W</p>
              <p id="fail">{props.summonerData.summonerStats.failCount}L</p>
            </_.ProgressBar>
          </_.WinningPercentage>

          <_.RecentlyPlayList>
            <div id="category-tag">
              <p>최근 플레이</p>
              <p>킬관여</p>
            </div>
            {props.summonerData.summonerStats.statsList.map(
              ({ championIcon, kda, isWin, time, killInvolvement }, idx) => (
                <div id="game-info" key={idx}>
                  <div id="kda-info">
                    <img src={championIcon} alt="챔피언 아이콘" />
                    <div style={{ backgroundColor: isWin ? '#2C334A' : '#50383b' }}>{kda}</div>
                    <p>{time}</p>
                  </div>
                  <p id="kill-involvement">{killInvolvement}</p>
                </div>
              )
            )}
          </_.RecentlyPlayList>
        </>
      ) : (
        <>
          {/* 스켈레톤 */}
          <_.AverageInfo>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div id="sk-info-category" key={idx}>
                <div id="sk-name" />
                <div id="sk-value" />
              </div>
            ))}
          </_.AverageInfo>
          <_.WinningPercentage>
            <div id="sk-winning-percentage-text">
              <div />
              <div />
            </div>
            <div id="sk-progress" />
          </_.WinningPercentage>
          <_.RecentlyPlayList>
            <div id="sk-category-tag">
              <div />
              <div />
            </div>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div id="sk-game-info" key={idx}>
                <div id="sk-kda-info" />
                <div id="value" />
              </div>
            ))}
          </_.RecentlyPlayList>
        </>
      )}
    </_.RecordContainer>
  );
}

export default SummonerRecord;