import React from 'react';

const ChevronLeftIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_5705_46459"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="16"
        y="12"
        width="14"
        height="24"
      >
        <path
          d="M26.9501 34.9L17.0501 25C16.8801 24.83 16.7701 24.67 16.7001 24.5C16.6301 24.33 16.6001 24.15 16.6001 23.95C16.6001 23.75 16.6301 23.57 16.7001 23.4C16.7701 23.23 16.8801 23.07 17.0501 22.9L27.0001 12.95C27.3001 12.65 27.6601 12.5 28.0801 12.5C28.5001 12.5 28.8501 12.65 29.1601 12.95C29.4601 13.25 29.6001 13.62 29.5801 14.05C29.5601 14.48 29.4101 14.85 29.1001 15.15L20.3001 23.95L29.1501 32.8C29.4501 33.1 29.6001 33.45 29.6001 33.85C29.6001 34.25 29.4501 34.6 29.1501 34.9C28.8501 35.2 28.4801 35.35 28.0501 35.35C27.6201 35.35 27.2501 35.2 26.9501 34.9Z"
          fill="#484747"
        />
      </mask>
      <g mask="url(#mask0_5705_46459)">
        <path d="M48 0H0V48H48V0Z" fill="#484747" />
      </g>
    </svg>
  );
};

export default ChevronLeftIcon;
