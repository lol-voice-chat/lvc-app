import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';

const SUMMONER_BLOCK_RESPONSIVE_WIDTH = '2000px';

export const SummonerBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  width: 230px;
  height: 550px;

  margin: 40px 1vw 0 1vw;
  border-radius: 10px;

  background-color: ${PALETTE.BLACK_1};
  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.2);

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    width: 300px;
    height: 670px;
    border-radius: 15px;
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

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    width: 110px;
    height: 110px;
    top: -55px;
    border: 5.5px solid ${({ visualize }) => (visualize ? '#50a361' : 'transparent')};
  }
`;

export const NameTag = styled.div<{ length: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 75%;
  padding-top: 24.5%;

  #name {
    font-size: ${({ length }) => (length < 8 ? '16px' : '13px')};
    color: ${PALETTE.WHITE_1};
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    #name {
      width: 60%;
      font-size: ${({ length }) => (length < 8 ? '20px' : '13px')};
    }
  }
`;

export const TitleTag = styled.div`
  display: flex;
  align-items: center;

  #title-name {
    margin: 10px 0;

    font-size: 14px;
    color: ${PALETTE.GRAY_1};
  }

  #question-circle {
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0.35px 3.5px;
    margin-left: 6px;

    border-radius: 50%;
    border: 1.5px solid ${PALETTE.GRAY_2};

    font-size: 10.5px;
    color: ${PALETTE.GRAY_2};
    cursor: pointer;

    &:hover {
      color: ${PALETTE.GRAY_1};
      border-color: ${PALETTE.GRAY_1};

      #title-description {
        display: flex;
      }
    }
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    #title-name {
      font-size: 18px;
    }
    #question-circle {
      padding: 0.5px 5px;
      margin-left: 8px;
      border: 1.5px solid ${PALETTE.GRAY_2};
      font-size: 13.5px;
    }
  }
`;

export const TitleDescription = styled.div`
  position: absolute;
  top: 20px;
  right: -70px;

  display: none;
  flex-direction: column;

  width: 120px;
  padding: 10px;
  border-radius: 5px;

  background-color: #111214;
  box-shadow: 0 5px 18px -7px rgba(0, 0, 0, 0.3);

  #name {
    font-size: 13px;
    color: ${PALETTE.WHITE_1};
    margin-bottom: 5px;
  }
  #description {
    font-weight: ${FONT.REGULAR};
    font-size: 11px;
    color: #878f9a;
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    top: 30px;
    width: 140px;
    border-radius: 6.5px;

    #name {
      font-size: 16px;
      margin-bottom: 7px;
    }
    #description {
      font-size: 14px;
    }
  }
`;

export const SoundBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  border-bottom: 1px solid #484b52;

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

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    #mic-button {
      width: 40px;
      height: 40px;
      margin: 0 0 16px 0;
      cursor: pointer;
    }

    #speaker-ctrl {
      margin: 0 0 16px 0;

      #speaker-button {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }
    }
  }
`;

export const AverageGameData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  margin: 12px 0 20px 0;

  #name {
    margin-bottom: 15px;
    font-size: 16px;
    color: ${PALETTE.GRAY_1};
  }

  div {
    display: flex;
    justify-content: space-between;

    width: 80%;
    margin: 3.5px 0;

    p {
      font-size: 15px;
      color: ${PALETTE.GRAY_1};
    }
    #value {
      color: ${PALETTE.WHITE_1};
    }
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    #name {
      margin-bottom: 20px;
      font-size: 20px;
    }
    div {
      margin: 5.5px 0;
      p {
        font-size: 17px;
      }
    }
  }
`;

export const GameRecord = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;

  #warning-box {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      width: 27%;
      height: auto;
      margin: 17px;
    }
    p {
      font-size: 16.5px;
      color: ${PALETTE.GRAY_1};
    }
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    p {
      font-size: 18.5px;
    }
  }
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

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    p {
      font-size: 23px;
    }
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
  #fail {
    right: 6px;
  }

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    margin: 15px 0;

    progress {
      height: 23px;
    }
    &::-webkit-progress-bar {
      border-radius: 4px;
    }
    &::-webkit-progress-value {
      border-radius: 4px 0 0 4px;
    }
    p {
      font-size: 14px;
    }
    #win {
      left: 8px;
    }
    #fail {
      right: 8px;
    }
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

  @media (min-width: ${SUMMONER_BLOCK_RESPONSIVE_WIDTH}) {
    grid-template-columns: repeat(2, 105px);
    grid-template-rows: repeat(5, 30px);
    column-gap: 30px;
    row-gap: 10px;

    div {
      width: 105px;
      height: 30px;
    }
    p {
      font-size: 15px;
    }
    img {
      height: 30px;
      width: 30px;
    }
  }
`;