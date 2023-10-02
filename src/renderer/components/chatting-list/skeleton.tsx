import React from 'react';
import * as _ from './style';

function SkeletonChattingList() {
  return (
    <_.SkellMessageBlock>
      <div id="sk-summoner-icon" />

      <div id="sk-content">
        <div id="sk-summoner-info">
          <div id="sk-name-tag" />
          <div id="sk-rank-badge" />
        </div>
        {Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, idx) => (
          <div id="sk-text-bundle" key={idx}>
            {Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, idx) => (
              <div
                id="sk-text"
                key={idx}
                style={{
                  width: (Math.random() * 100 + 55).toString() + 'px',
                  opacity: Math.random() + 0.3,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </_.SkellMessageBlock>
  );
}

export default SkeletonChattingList;
