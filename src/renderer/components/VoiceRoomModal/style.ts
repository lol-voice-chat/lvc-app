import styled from 'styled-components';
import { PALETTE } from '../../const';

export const Background = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: ${PALETTE.BLACK_2};
`;

export const LeagueBlockBundle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  width: 1250px;
  height: 670px;

  margin-top: 45px;
`;

export const TeamBlocks = styled.div<{ isMyTeam: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: ${({ isMyTeam }) => (isMyTeam ? 'flex-end' : 'flex-start')};
`;
