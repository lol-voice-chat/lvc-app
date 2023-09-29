import styled from 'styled-components';
import { FONT, PALETTE } from '../../../../const';

export const RecordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 70%;
  margin-top: 15px;
  padding: 20px;

  border-radius: 10px;
  background-color: #313338;
  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.3);

  * {
    font-size: ${FONT.SEMI_BOLD};
  }
`;

export const AverageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  #info-category {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 3.5px 0;
    width: 100%;

    p {
      font-size: 15px;
    }
    #name {
      color: #7f8189;
    }
    #value {
      color: #f2f3f5;
    }
    #most-champ-list {
      display: flex;

      img {
        margin-left: 9px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
      }
    }
  }

  #sk-info-category {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5.5px 0;
    width: 100%;

    #sk-name {
      width: 75px;
      height: 20px;
      border-radius: 3.5px;
      background-color: #3b3e44;
    }
    #sk-value {
      width: 90px;
      height: 20px;
      border-radius: 3.5px;
      background-color: #3b3e44;
    }
  }
`;

export const WinningPercentage = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  margin-top: 45px;

  #winning-percentage-text {
    display: flex;
    justify-content: space-between;

    p {
      font-size: 16px;
      color: ${PALETTE.GRAY_1};
    }
    #value {
      color: ${PALETTE.RED};
    }
  }

  #sk-winning-percentage-text {
    display: flex;
    justify-content: space-between;

    div {
      width: 50px;
      height: 22px;
      border-radius: 3.5px;
      background-color: #44474e;
    }
  }
  #sk-progress {
    width: 100%;
    height: 22px;
    margin-top: 10px;
    border-radius: 2px;
    background-color: #44474e;
  }
`;

export const ProgressBar = styled.div`
  position: relative;
  margin-top: 10px;

  progress {
    appearance: none;

    width: 100%;
    height: 22px;

    &::-webkit-progress-bar {
      border-radius: 2px;
      background-color: ${PALETTE.RED};
    }
    &::-webkit-progress-value {
      border-radius: 2px 0 0 2px;
      background-color: ${PALETTE.BLUE};
    }
  }

  p {
    position: absolute;
    top: 2.5px;
    font-size: 12px;
    color: ${PALETTE.WHITE_1};
  }
  #win {
    left: 6px;
  }
  #fail {
    right: 6px;
  }
`;

export const RecentlyPlayList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  margin-top: 45px;

  #category-tag {
    display: flex;
    justify-content: space-between;

    width: 100%;
    margin-bottom: 15px;

    p {
      font-size: 16px;
      color: ${PALETTE.GRAY_1};
    }
  }

  #game-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 5px;

    #kda-info {
      display: flex;
      align-items: center;

      img {
        width: 25px;
        height: 25px;
      }
      div {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 80px;
        height: 25px;
        margin-right: 7.5px;

        font-size: 14px;
        color: ${PALETTE.WHITE_1};
      }
      p {
        font-weight: ${FONT.MEDIUM};
        font-size: 12px;
        color: #7f8189;
      }
    }

    #kill-involvement {
      font-size: 15px;
      color: ${PALETTE.WHITE_1};
    }
  }

  #sk-category-tag {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;

    div {
      width: 75px;
      height: 20px;
      border-radius: 3.5px;
      background-color: #3b3e44;
    }
  }
  #sk-game-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 5px;

    #sk-kda-info {
      width: 105px;
      height: 25px;
      background-color: #44474e;
    }
    #value {
      width: 40px;
      height: 25px;
      border-radius: 3.5px;
      background-color: #3b3e44;
    }
  }
`;
