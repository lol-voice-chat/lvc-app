import styled from 'styled-components';
import { FONT, PALETTE } from '../../../const';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - 40px);
  background-color: #303236;

  overflow-x: hidden;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  #new-message-alram {
    position: absolute;
    bottom: 100px;
    left: calc(50% - 100px);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 30px;
    border-radius: 5px;
    background-color: ${PALETTE.GREEN};
    font-weight: ${FONT.REGULAR};
    font-size: 14px;
    color: ${PALETTE.WHITE_1};
    opacity: 0.7;

    transition: 0.15s;
    &:hover {
      cursor: pointer;
      opacity: 0.9;
    }
  }
`;

/* 스켈레톤 */
export const SkellMessageBlock = styled.div`
  display: flex;
  width: 96%;
  padding: 15px 4% 15px 15px;

  #sk-summoner-icon {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #404249;
    margin-right: 12px;
  }

  #sk-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    #sk-summoner-info {
      display: flex;
      align-items: center;

      #sk-name-tag {
        width: 120px;
        height: 18px;
        border-radius: 18px;
        background-color: #404249;
        margin-right: 7px;
      }
      #sk-rank-badge {
        width: 50px;
        height: 21.25px;
        border-radius: 21.25px;
        background-color: #2a2d30;
      }
    }

    #sk-text-bundle {
      display: flex;
      #sk-text {
        margin: 7px 7px 0 0;
        height: 17px;
        border-radius: 20px;
        background-color: #404249;
      }
    }
  }
`;
