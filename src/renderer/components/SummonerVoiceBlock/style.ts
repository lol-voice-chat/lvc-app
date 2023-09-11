import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';

export const SummonerBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  width: 250px;
  height: 550px;

  border-radius: 10px;

  background-color: ${PALETTE.BLACK_1};

  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.2);
`;

export const ProfileImg = styled.img`
  position: absolute;
  top: -50px;

  width: 100px;
  height: 100px;

  border-radius: 50%;

  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.3);
`;

export const NameTag = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 75%;

  padding-top: 24.5%;

  #displayName {
    font-size: 16px;
    color: ${PALETTE.WHITE_1};
  }
`;

export const TitleTag = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  #titleName {
    margin: 10px 0;

    font-size: 14.5px;
    color: ${PALETTE.GRAY_1};
  }

  #questionCircle {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0.35px 3.5px;
    margin-left: 6px;

    border-radius: 50%;
    border: 1.5px solid ${PALETTE.GRAY_2};

    font-size: 10.5px;
    color: ${PALETTE.GRAY_2};
  }
`;

export const SoundBox = styled.div`
  width: 100%;

  border-bottom: 1px solid #484b52;
`;

export const AverageGameData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  margin: 20px 0;

  div {
    display: flex;
    justify-content: space-between;

    width: 80%;

    margin: 3.5px 0;

    p {
      font-size: 15.5px;
      color: ${PALETTE.GRAY_1};
    }
    #value {
      color: ${PALETTE.WHITE_1};
    }
  }
`;

export const GameRecord = styled.div`
  display: flex;
  flex-direction: column;

  width: 80%;
`;

export const WinningPercentage = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Text = styled.div`
  display: flex;
  justify-content: space-between;

  p {
    font-size: 17px;
    color: ${PALETTE.GRAY_1};
  }

  #value {
    color: ${PALETTE.RED};
  }
`;

export const ProgressBar = styled.div`
  position: relative;

  margin: 10px 0;

  progress {
    appearance: none;

    width: 100%;
    height: 19px;

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
  #lose {
    right: 6px;
  }
`;

export const KDAList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 95px);
  grid-template-rows: repeat(5, 25px);
  column-gap: 10px;
  row-gap: 7px;

  div {
    position: relative;

    display: flex;
    align-items: center;

    height: 25px;
    width: 95px;
  }

  p {
    margin-left: 37px;

    font-weight: ${FONT.MEDIUM};
    font-size: 14px;
    color: ${PALETTE.WHITE_1};
  }

  img {
    position: absolute;
    top: 0;
    left: 0;

    height: 25px;
    width: 25px;
  }
`;
