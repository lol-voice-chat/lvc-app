import styled from 'styled-components';

export const AppHeader = styled.div`
  width: 100%;
  padding: 15px 0;

  -webkit-app-region: drag;

  div {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 270px;

    img {
      width: 13px;
      height: auto;
      margin-left: 15px;

      cursor: pointer;
      -webkit-app-region: no-drag;
    }
  }
`;
