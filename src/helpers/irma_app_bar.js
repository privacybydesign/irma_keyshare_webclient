import React from 'react';

import './irma_app_bar.css'

const IrmaAppBar = (props) => {
  return (
    <header>
      <h1>
        {props.title}
      </h1>
    </header>
  );
};

export default IrmaAppBar;
