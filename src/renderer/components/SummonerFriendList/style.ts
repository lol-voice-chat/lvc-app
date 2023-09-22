import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 80%;
`;

export const StatusTag = styled.p`
  width: 100%;
  margin: 50px 0 2.5px 0;
  font-size: 16px;
  color: #949ba4;
`;

export const SummonerBlock = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  margin: 2.5px 0;
  padding: 6.5px 12px;

  border-radius: 5px;
  transition: background-color 0.15s;

  #user-status {
    transition: border-color 0.15s;
  }
  &:hover {
    background-color: #404249;
    &,
    p {
      cursor: pointer;
    }
    #user-status {
      border-color: #404249;
    }
    #display-name {
      color: #dcdee1;
    }
  }

  #display-name {
    font-weight: ${FONT.MEDIUM};
    font-size: 15px;
    color: #949ba4;
    transition: color 0.15s;
  }
  #user-icon-with-status {
    margin-right: 10px;
  }
`;
