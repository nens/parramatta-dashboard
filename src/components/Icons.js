import React from "react";

export const IconActiveAlarmSVG = (
  <svg height="30" width="30">
    <circle cx="15" cy="15" r="10" stroke="white" strokeWidth="2" fill="red" />
    <path
      transform="translate(5,5)"
      d="M9,5 L11,5 L11,7.38977636 L10.4824281,11.7859425 L9.53035144,11.7859425 L9,7.38977636 L9,5 Z M9.04472843,12.5399361 L10.9488818,12.5399361 L10.9488818,14.3865815 L9.04472843,14.3865815 L9.04472843,12.5399361 Z"
      id="!"
      fill="#FFFFFF"
    />
  </svg>
);

export const IconInactiveAlarmSVG = (
  <svg height="30" width="30">
    <circle
      cx="15"
      cy="15"
      r="10"
      stroke="white"
      strokeWidth="2"
      fill="green"
    />
    <g transform="translate(8 8)" fill="#FFF">
      <g transform="translate(0 .58)">
        <polygon points="5 10.42 0 5.42 1.41 4.01 5 7.59 12.59 0 14 1.42" />
      </g>
    </g>
  </svg>
);

export const IconNoAlarmSVG = (
  <svg height="30" width="30">
    <circle cx="15" cy="15" r="10" stroke="white" strokeWidth="2" fill="blue" />
  </svg>
);
