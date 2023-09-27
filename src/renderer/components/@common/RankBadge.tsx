import React from 'react';
import styled from 'styled-components';
import { FONT, PALETTE } from '../../const';

type sizeType = 'small' | 'medium' | 'large';
let RankBadgeSize = new Map<sizeType, number>([
  ['small', 50],
  ['medium', 65],
  ['large', 80],
]);

function RankBadge(props: { size: sizeType; tierImg: string; tier: string }) {
  return (
    <Badge id="rank-badge" size={RankBadgeSize.get(props.size) ?? 50} tier={props.tier}>
      {props.tier !== 'Unrank' && props.tier !== '' && <img src={props.tierImg} alt="티어 뱃지" />}
      <p>{props.tier}</p>
    </Badge>
  );
}

const Badge = styled.div<{ size: number; tier: string }>`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  width: ${(p) => p.size}px;
  height: ${(p) => p.size * 0.425}px;
  border-radius: ${(p) => p.size}px;
  background-color: #222427;

  img {
    width: ${(p) => p.size * 0.4}px;
    height: ${(p) => p.size * 0.4}px;
  }
  p {
    font-weight: ${FONT.SEMI_BOLD};
    font-size: ${(p) => p.size * 0.25}px;
    color: ${PALETTE.WHITE_1};
  }
`;

export default RankBadge;
