import React from 'react';

import './irma_table.scss';

const IrmaTable = ({children, ...tableProps}) => {
  return (
    <table {...tableProps} className={`irma-table`}>
      {children}
    </table>
  );
}

export default IrmaTable;
