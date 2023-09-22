import React from 'react';
import * as _ from './style';

function SummonerRecord() {
  return (
    <_.RecordContainer>
      <_.AverageInfo>
        <div id="info-category">
          <p id="name">KDA</p>
          <p id="value">5.4 / 7.6 / 3.4</p>
        </div>
        <div id="info-category">
          <p id="name">평균 피해량</p>
          <p id="value">5232.4</p>
        </div>
        <div id="info-category">
          <p id="name">평균 CS</p>
          <p id="value">129.4</p>
        </div>
        <div id="info-category">
          <p id="name">모스트 챔피언</p>
          <div id="most-champ-list">
            <img src="img/warning_icon.svg" alt="챔피언 아이콘" />
            <img src="img/warning_icon.svg" alt="챔피언 아이콘" />
            <img src="img/warning_icon.svg" alt="챔피언 아이콘" />
          </div>
        </div>
      </_.AverageInfo>

      <_.WinningPercentage>
        <div id="winning-percentage-text">
          <p>승률</p>
          <p id="value">50%</p>
        </div>
        <_.ProgressBar>
          <progress value={10} max={20} />
          <p id="win">{10}W</p>
          <p id="fail">{10}L</p>
        </_.ProgressBar>
      </_.WinningPercentage>

      <_.RecentlyPlayList>
        <div id="category-tag">
          <p>최근 플레이</p>
          <p>킬관여</p>
        </div>

        <div id="game-info">
          <div id="kda-info">
            <img src="img/warning_icon.svg" alt="챔피언 아이콘" />
            <div>6/5/9</div>
          </div>
          <p id="kill-involvement">30%</p>
        </div>
      </_.RecentlyPlayList>
    </_.RecordContainer>
  );
}

export default SummonerRecord;
