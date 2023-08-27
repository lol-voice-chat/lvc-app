import React, { useEffect } from 'react';
import useVoiceChat from '../hooks/useVoiceChat';
import { useRecoilValue } from 'recoil';
import { myTeamSummonersState, summonerState } from '../@store/Recoil';

function VoiceChatRoom() {
  const summoner = useRecoilValue(summonerState);
  const myTeamSummoners = useRecoilValue(myTeamSummonersState);

  const { onVoiceChatRoom } = useVoiceChat();

  useEffect(() => {
    onVoiceChatRoom();
  }, []);

  return (
    <div>
      {/* 내 소환사 UI */}
      {summoner && (
        <div id={summoner.summonerId.toString()}>
          <img
            src={summoner.profileImage}
            alt="내 챔피언 프로필 사진"
            style={{ width: '50px', height: 'auto' }}
          />
          <h1>{summoner.displayName} 소환사님</h1>
        </div>
      )}

      {/* 팀원 소환사 UI */}

      {myTeamSummoners?.map((myTeamSummoner) => (
        <div id={myTeamSummoner.summonerId.toString()} key={myTeamSummoner.summonerId.toString()}>
          <img
            src={myTeamSummoner.profileImage}
            alt="팀원 프로필 사진"
            style={{ width: '50px', height: 'auto' }}
          />
          <h1>팀원놈 : {myTeamSummoner.displayName}</h1>
        </div>
      ))}
    </div>
  );
}

export default VoiceChatRoom;
