import React, { useEffect } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';
import { useRecoilValue } from 'recoil';
import { enemySummonersState, myTeamSummonersState, summonerState } from '../@store/Recoil';

function VoiceChatRoom() {
  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);
  const enemySummoners = useRecoilValue(enemySummonersState);

  const { onTeamVoiceChatRoom, onLeagueVoiceChatRoom } = useVoiceChat();

  useEffect(() => {
    onTeamVoiceChatRoom();
    onLeagueVoiceChatRoom();
  }, []);

  return (
    <>
      {/* 내 소환사 UI */}
      {summoner && (
        <div id={summoner.summonerId.toString()}>
          <img
            src={summoner.profileImage}
            alt="내 소환사 프로필 사진"
            style={{ width: '30px', height: 'auto' }}
          />
          <h2>{summoner.displayName} 소환사님</h2>
        </div>
      )}

      {/* 팀원 소환사 UI */}
      {myTeamSummoners?.map((myTeamSummoner) => (
        <div id={myTeamSummoner.summonerId.toString()} key={myTeamSummoner.summonerId.toString()}>
          <img
            src={myTeamSummoner.profileImage}
            alt="팀원 프로필 사진"
            style={{ width: '30px', height: 'auto' }}
          />
          <h3>팀원놈 : {myTeamSummoner.displayName}</h3>
        </div>
      ))}

      {/* 적팀 소환사 UI */}
      {enemySummoners?.map((enemySummoner) => (
        <div id={enemySummoner.summonerId.toString()} key={enemySummoner.summonerId.toString()}>
          <img
            src={enemySummoner.profileImage}
            alt="적팀 프로필 사진"
            style={{ width: '30px', height: 'auto' }}
          />
          <h3>즉팀새퀴 : {enemySummoner.displayName}</h3>
        </div>
      ))}
    </>
  );
}

export default VoiceChatRoom;
