import React, { useState } from 'react';
import VoiceRoomModal from '../../voice-room-modal';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../const';
import useLeagueHandler from '../../../hooks/use-league-handler';

function NavBar() {
  const { gameStatus } = useLeagueHandler();

  const [onClickTag, setOnClickTag] = useState(PATH.HOME);
  const navigate = useNavigate();

  const handleClickCategoryTag = (path: string) => {
    navigate(path);
    setOnClickTag(path);
  };

  return (
    <div id="nav-bar">
      {gameStatus !== 'none' && <VoiceRoomModal />}

      <S.NavContainer>
        <S.TitleCategoryTag>홈</S.TitleCategoryTag>
        <S.SubCategoryTag
          isClick={onClickTag === PATH.HOME}
          onClick={() => handleClickCategoryTag(PATH.HOME)}
        >
          전체채팅
        </S.SubCategoryTag>
      </S.NavContainer>
    </div>
  );
}

export default NavBar;
