import styled from 'styled-components';
import { PALETTE } from '../../const';
import { LEAGUE_SUMMONER_BLOCK_RESPONSIVE_WIDTH } from '../SummonerLeagueVoiceBlock/style';

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

  /* width: ; */
  height: 670px;
  margin-top: 45px;

  @media (min-width: ${LEAGUE_SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    height: 900px;
    margin-top: 25px;
  }
`;

export const TeamBlocks = styled.div<{ isMyTeam: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: ${({ isMyTeam }) => (isMyTeam ? 'flex-end' : 'flex-start')};
`;
