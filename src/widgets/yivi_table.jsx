import React from 'react';

import styles from './yivi_table.module.scss';

const YiviTable = ({ children, ...tableProps }) => {
  return (
    <table {...tableProps} className={styles.table}>
      {children}
    </table>
  );
};

export default YiviTable;
