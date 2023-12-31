import styled from 'styled-components';
import { FONT, PALETTE } from '../../../const';

export const NavContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 170px;
  height: 100vh;

  background-color: #1e1f22;
  -webkit-app-region: drag;
`;

export const TitleCategoryTag = styled.div`
  width: 80%;
  margin: 25px 0 12px 0;

  font-weight: ${FONT.MEDIUM};
  font-size: 22px;
  color: ${PALETTE.WHITE_1};

  cursor: default;
`;

export const SubCategoryTag = styled.div<{ isClick: boolean }>`
  width: 80%;
  padding: 7.5px;
  border-radius: 4px;

  font-weight: ${FONT.MEDIUM};
  font-size: 17px;
  color: ${({ isClick }) => (isClick ? PALETTE.WHITE_1 : '#949ba4')};
  background-color: ${({ isClick }) => (isClick ? '#313338' : 'transparent')};

  transition: 0.15s;

  &:hover {
    cursor: pointer;
    color: ${PALETTE.WHITE_1};
    background-color: #313338;
  }
  -webkit-app-region: no-drag;
`;
