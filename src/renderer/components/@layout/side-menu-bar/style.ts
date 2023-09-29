import styled from 'styled-components';
import { PALETTE } from '../../../const';

export const SideBarContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 300px;
  height: 100vh;

  background-color: ${PALETTE.BLACK_2};
`;
