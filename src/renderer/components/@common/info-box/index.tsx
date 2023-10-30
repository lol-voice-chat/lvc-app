import React, { ReactElement } from 'react';
import { BoxContainer } from './style';

type InfoBoxPropsType = {
  width: number;
  height: number;
  infoElement: ReactElement;
};

function InfoBox(props: InfoBoxPropsType) {
  return (
    <BoxContainer width={props.width} height={props.height}>
      <div id="info-box">{props.infoElement}</div>
    </BoxContainer>
  );
}

export default InfoBox;
