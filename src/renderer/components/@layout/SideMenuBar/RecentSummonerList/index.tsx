import React, { useEffect, useState } from 'react';
import * as _ from './style';
import { Socket } from 'socket.io-client';
import { RecentSummonerType } from '../../../../@type/summoner';
const { ipcRenderer } = window.require('electron');

function RecentSummonerList(props: {
  summonerStatusSocket: Socket | null;
  summoner: RecentSummonerType | null;
  handleClickSummonerBlock: (puuid: string) => void;
}) {
  const [initRecentSummonerList, setInitRecentList] = useState(false);
  const [recentSummonerList, setRecentSummonerList] = useState<RecentSummonerType[] | null>(null);

  useEffect(() => {
    if (!initRecentSummonerList && props.summoner) {
      props.summonerStatusSocket?.emit(
        'online-summoner',
        {
          summoner: {
            puuid: props.summoner.puuid,
            summonerId: props.summoner.summonerId,
            profileImage: props.summoner.profileImage,
            displayName: props.summoner.displayName,
          },
        },
        ({ recentSummonerList }) => {
          setRecentSummonerList(recentSummonerList);
          setInitRecentList(true);
        }
      );

      ipcRenderer.once('shutdown-app', () => {
        props.summonerStatusSocket?.emit('offline-summoner', {
          puuid: props.summoner?.puuid,
          summonerId: props.summoner?.summonerId,
          profileImage: props.summoner?.profileImage,
          displayName: props.summoner?.displayName,
        });
      });
    }
  }, [props.summoner]);

  return (
    <_.RecentSummonerContainer>
      <_.StatusTag>최근 함께한 소환사</_.StatusTag>

      <_.SummonerList>
        {initRecentSummonerList ? (
          <>
            {recentSummonerList?.map(({ puuid, profileImage, displayName }) => (
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
