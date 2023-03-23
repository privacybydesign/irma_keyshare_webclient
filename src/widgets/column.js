import React from 'react';
import styles from './column.module.scss';

const Column = ({ children, className, ...columnProps }) => {
  return (
    <div {...columnProps} className={[styles.column, className].filter((x) => x).join(' ')}>
      {children}
    </div>
  );
};

export default Column;
