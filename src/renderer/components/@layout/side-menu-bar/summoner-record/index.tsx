import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as _ from './style';
import { SummonerStatsType } from '../../../../@type/summoner';
import { IPC_KEY } from '../../../../../const';
const { ipcRenderer } = window.require('electron');

type SummonerRecrodPropsType = {
  isMine: boolean;
  puuid: string;
  setIsFriend: Dispatch<SetStateAction<boolean>>;
};

function SummonerRecord(props: SummonerRecrodPropsType) {
  const [record, setRecord] = useState<SummonerStatsType | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (props.puuid !== 'leage-client-off') {
      ipcRenderer
        .invoke(IPC_KEY.FETCH_MATCH_HISTORY, { isMine: props.isMine, puuid: props.puuid })
        .then(
          (payload: { summonerStats: SummonerStatsType; isFriend: boolean; isError: boolean }) => {
            if (payload.isError) return setIsError(true);

            setRecord(payload.summonerStats);
            props.setIsFriend(payload.isFriend);
          }
        );
    }

    return () => {
      setRecord(null);
    };
  }, [props]);

  return (
    <_.RecordContainer>
      {isError && <></>}

      {!isError && record ? (
        <>
          <_.AverageInfo>
            <div id="info-category">
              <p id="name">KDA</p>
              <p id="value">{record.kda}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 피해량</p>
              <p id="value">{record.damage}</p>
            </div>
            <div id="info-category">
              <p id="name">평균 CS</p>
              <p id="value">{record.cs}</p>
            </div>
            <div id="info-category">
              <p id="name">모스트 챔피언</p>
              <div id="most-champ-list">
                {record.mostChampionList.map((championIcon) => (
                  <img src={championIcon} />
                ))}
              </div>
              {record.mostChampionList.length === 0 && <p id="value">전적없음</p>}
            </div>
          </_.AverageInfo>

          <_.WinningPercentage>
            <div id="winning-percentage-text">
              <p>승률</p>
              <p id="value">{record.odds}%</p>
            </div>
            <_.ProgressBar>
              <progress value={record.winCount} max={record.winCount + record.failCount} />
              <p id="win">{record.winCount}W</p>
              <p id="fail">{record.failCount}L</p>
            </_.ProgressBar>
          </_.WinningPercentage>

          <_.RecentlyPlayList>
            <div id="category-tag">
              <p>최근 플레이</p>
              <p>킬관여</p>
            </div>

            {record.statsList.map(({ championIcon, kda, isWin, time, killInvolvement }, idx) => (
              <div id="game-info" key={idx}>
                <div id="kda-info">
                  <img src={championIcon} />
                  <div style={{ backgroundColor: isWin ? '#0F3054' : '#50383b' }}>{kda}</div>
                  <p>{time}</p>
                </div>
                <p id="kill-involvement">{killInvolvement}</p>
              </div>
            ))}

            {record.statsList.length === 0 && (
              <div id="none-game-info">
                <img src="img/warning_icon.svg" />
                <p>전적이 없습니다.</p>
              </div>
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
