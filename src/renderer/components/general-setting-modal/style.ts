import styled from 'styled-components';
import { PALETTE } from '../../const';

export const SettingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;
  background-color: rgba(30, 31, 34, 0.7);

  -webkit-app-region: no-drag;

  #settings-block {
    display: flex;
    justify-content: space-around;
    align-items: center;

    width: 600px;
    height: 350px;
    border-radius: 10px;
    background-color: #2b2d31;

    & > div {
      display: flex;
      align-items: flex-start;
      flex-direction: column;

      width: 40%;
      height: 75%;

      #category {
        width: 100%;
        font-size: 20px;
        color: ${PALETTE.WHITE_1};
      }
      #function {
        width: 100%;
        font-size: 14px;
        color: #949ba4;
        margin: 30px 0 7.5px 0;
      }

      #bundle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-top: 30px;
        font-size: 16px;
        color: ${PALETTE.WHITE_1};
      }

      #shortcut-key-box {
        display: flex;
        justify-content: center;
        align-items: center;

        width: auto;
        height: 40px;
        padding: 0 10px;
        margin-top: 3.5px;
        border-radius: 5px;

        font-size: 27px;
        color: #a1a1a1;
        background-color: #1c1d20;
        transition: 0.2s;
        &:hover {
          background-color: #121214;
          cursor: pointer;
        }
      }

      #getting-key-box {
        height: 40px;
        padding: 0 10px;
        margin-top: 10px;
        border-radius: 5px;
      }
    }

    #sk-select-bar {
      width: 100%;
      height: 38px;
      border-radius: 2.5px;
      background-color: #1c1d20;
    }
  }
`;
