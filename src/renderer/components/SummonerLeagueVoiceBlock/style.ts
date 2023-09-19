import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';

export const SummonerBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  width: 230px;
  height: 210px;

  margin: 0 10px 0 10px;
  border-radius: 10px;

  background-color: ${PALETTE.BLACK_1};
  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.2);

  transition: height 0.2s ease-in-out;

  &:hover {
    &,
    #summoner-info {
      height: 400px;
    }
  }
`;

export const ProfileImg = styled.img<{ visualize: boolean }>`
  position: absolute;
  top: -45px;

  width: 90px;
  height: 90px;

  border-radius: 50%;
  border: 3.5px solid ${({ visualize }) => (visualize ? '#50a361' : 'transparent')};

  transition: border-color 0.1s;

  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.3);
`;

export const SummonerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  height: 200px;

  overflow: hidden;
  transition: height 0.2s ease-in-out;
`;

export const NameTag = styled.div<{ size: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 75%;

  padding-top: 24.5%;

  #displayName {
    font-size: ${({ size }) => size};
    color: ${PALETTE.WHITE_1};
  }
`;

export const TitleTag = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;

  #titleName {
    margin: 10px 0;

    font-size: 14px;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;

  #mic-button {
    width: 30px;
    height: 30px;
    margin: 0 0 12px 0;
    cursor: pointer;
  }

  #speaker-ctrl {
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin: 0 0 12px 0;

    #speaker-button {
      width: 30px;
      height: 30px;
      cursor: pointer;
    }
    #volume-slider {
      width: 75%;
    }
  }
`;

export const WinningPercentage = styled.div<{ odds: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 85%;

  #odds {
    font-size: 13px;
    color: ${({ odds }) => (odds < 50 ? PALETTE.RED : PALETTE.WHITE_1)};
  }
`;

export const ProgressBar = styled.div`
  position: relative;
  width: 80%;

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
  #fail {
    right: 6px;
  }
`;

export const KDAList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 85px);
  grid-template-rows: repeat(5, 25px);
  column-gap: 14px;
  row-gap: 7px;

  div {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;

    height: 25px;
    width: 85px;
  }

  p {
    margin-left: 24px;

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

export const AverageKDA = styled.div`
  display: flex;
  justify-content: space-between;

  width: 80%;

  margin: 15px 0;

  p {
    font-size: 15px;
    color: ${PALETTE.GRAY_1};
  }
  #value {
    color: ${PALETTE.WHITE_1};
  }
`;
