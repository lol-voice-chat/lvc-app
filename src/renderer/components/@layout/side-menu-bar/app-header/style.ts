import styled from 'styled-components';

export const AppHeader = styled.div`
  width: 100%;
  padding: 15px 0;

  -webkit-app-region: drag;

  #tool-container {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 270px;

    div {
      width: 13px;
      height: 13px;
      margin-left: 15px;

      -webkit-app-region: no-drag;
      cursor: pointer;

      img {
        width: 100%;
        height: auto;
      }
    }
  }
`;
