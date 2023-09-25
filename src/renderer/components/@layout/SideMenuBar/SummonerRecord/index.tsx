import React from 'react';
import * as _ from './style';
import { SummonerRecordType } from '../../../../@type/summoner';

const summonerRecord = {
  displayName: '붕붕카 1호',
  profileImage: '',
  tier: '',
  statusMessage: '앙기모띠띠띠띠띠',
  summonerStats: {
    kda: '1 / 2 / 3',
    damage: '11111',
    cs: '12312',
    mostChampionList: ['', '', ''],
    odds: 10,
    winCount: 12,
    failCount: 8,
    statsList: [
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
      {
        championIcon: '',
        kda: '',
        isWin: true,
        time: '6분전',
        killInvolvement: '55%',
      },
    ],
  },
};

function SummonerRecord(props: { summonerRecord: SummonerRecordType | null }) {
  return (
    <_.RecordContainer>
      {summonerRecord ? (
        <>
          <_.AverageInfo>
            <div id="info-category">
              <p id="name">KDA</p>
              <p id="value">{summonerRecord.summonerStats.kda}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 피해량</p>
              <p id="value">{summonerRecord.summonerStats.damage}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 CS</p>
              <p id="value">{summonerRecord.summonerStats.cs}</p>
            </div>
            <div id="info-category">
              <p id="name">모스트 챔피언</p>
              <div id="most-champ-list">
                {summonerRecord.summonerStats.mostChampionList.map((championIcon) => (
                  <img src={championIcon} alt="챔피언 아이콘" />
                ))}
              </div>
            </div>
          </_.AverageInfo>

          <_.WinningPercentage>
            <div id="winning-percentage-text">
              <p>승률</p>
              <p id="value">{summonerRecord.summonerStats.odds}%</p>
            </div>
            <_.ProgressBar>
              <progress
                value={summonerRecord.summonerStats.winCount}
                max={summonerRecord.summonerStats.winCount + summonerRecord.summonerStats.failCount}
              />
              <p id="win">{summonerRecord.summonerStats.winCount}W</p>
              <p id="fail">{summonerRecord.summonerStats.failCount}L</p>
            </_.ProgressBar>
          </_.WinningPercentage>

          <_.RecentlyPlayList>
            <div id="category-tag">
              <p>최근 플레이</p>
              <p>킬관여</p>
            </div>
            {summonerRecord.summonerStats.statsList.map(
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
