import React, { useState } from 'react';
import * as S from './style';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../const';

function NavBar() {
  const [onClickTag, setOnClickTag] = useState(PATH.HOME);
  const navigate = useNavigate();

  const handleClickCategoryTag = (path: string) => {
    navigate(path);
    setOnClickTag(path);
  };

  return (
    <S.NavContainer>
      <S.TitleCategoryTag>홈</S.TitleCategoryTag>
      <S.SubCategoryTag
        isClick={onClickTag === PATH.HOME}
        onClick={() => handleClickCategoryTag(PATH.HOME)}
      >
        전체채팅
      </S.SubCategoryTag>
    </S.NavContainer>
  );
}

export default NavBar;
