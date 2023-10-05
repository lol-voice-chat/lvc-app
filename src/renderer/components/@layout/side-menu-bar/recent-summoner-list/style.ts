import styled from 'styled-components';
import { FONT } from '../../../../const';

export const RecentSummonerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 250px;
  height: 80%;
  margin-top: 30px;

  overflow: hidden;
`;

export const SummonerList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  height: 100%;

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

    #sk-summoner-icon {
      margin-right: 10px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #2f3035;
    }
    #sk-name {
      width: 130px;
      height: 20px;
      border-radius: 3.5px;
      background-color: #404249;
    }
  }
`;

export const StatusTag = styled.p`
  width: 100%;
  margin: 0 0 5px 0;
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
  #summoner-icon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 10px;
  }
  #name {
    font-weight: ${FONT.MEDIUM};
    font-size: 15px;
    color: #949ba4;
    transition: color 0.15s;
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
    #name {
      color: #dcdee1;
    }
  }
`;
