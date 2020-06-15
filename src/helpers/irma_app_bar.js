import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import React from 'react';


const IrmaAppBar = (props) => {
  return (
    <AppBar position={'relative'}>
      <Toolbar style={{justifyContent: 'center'}}>
        {props.title}
      </Toolbar>
    </AppBar>
  );
};

export default IrmaAppBar;
