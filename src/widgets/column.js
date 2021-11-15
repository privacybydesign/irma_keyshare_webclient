import React from 'react';

import './column.scss';

const Column = ({ children, className, ...columnProps }) => {
  return (
    <div {...columnProps} className={['column', className].filter((x) => x).join(' ')}>
      {children}
    </div>
  );
};

export default Column;
