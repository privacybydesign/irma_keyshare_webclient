import React from 'react';

const ChevronRightIcon = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 48 48"
    >
      <mask
        id="mask0_4425_8294"
        style={{ maskType: 'alpha' }}
        width="14"
        height="24"
        x="17"
        y="12"
        maskUnits="userSpaceOnUse"
      >
        <path
          fill="#484747"
          d="M17.7 34.9c-.27-.33-.41-.7-.42-1.1-.01-.4.12-.75.42-1.05l8.8-8.8-8.85-8.85c-.27-.27-.39-.62-.38-1.07.02-.45.16-.81.42-1.07.33-.33.69-.49 1.08-.48.38.02.73.18 1.02.48l9.95 9.95c.17.17.28.33.35.5.07.17.1.35.1.55 0 .2-.03.38-.1.55-.07.17-.18.33-.35.5l-9.9 9.9c-.3.3-.65.44-1.05.42-.4-.02-.77-.16-1.1-.42l.01-.01z"
        ></path>
      </mask>
      <g mask="url(#mask0_4425_8294)">
        <path fill="#484747" d="M48 0H0v48h48V0z"></path>
      </g>
    </svg>
  );
};

export default ChevronRightIcon;
