import styled from 'styled-components';
import { FONT } from '../../../const';

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 80%;
  height: 100%;
  margin-top: 30px;

  overflow-x: hidden;
  overflow-y: scroll;

  /* 스크롤바 숨기기 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  #sk-summoner-block {
    display: flex;
    align-items: center;

    width: 90%;
    margin: 2.5px 0;
    padding: 6.5px 12px;

    border-radius: 5px;
    background-color: #36373c;

    #sk-user-icon {
      margin-right: 10px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #2f3035;
    }
    #sk-display-name {
      width: 130px;
      height: 20px;
      border-radius: 3.5px;
      background-color: #404249;
    }
  }
`;

export const StatusTag = styled.p`
  width: 100%;
  margin: 0 0 2.5px 0;
  font-size: 15px;
  color: #949ba4;
`;

export const SummonerBlock = styled.div`
  display: flex;
  align-items: center;

  width: 90%;
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
