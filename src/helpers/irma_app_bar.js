import React from 'react';

import './irma_app_bar.scss'
import LogoutIcon from './logout_icon';

const IrmaAppBar = ({title, onLogout}) => {
  return (
    <header className={'irma-app-bar'}>
      <div className={'irma-app-bar-content'}>
      <h1>
        {title}
      </h1>
        {onLogout
          ? <button className={'log-out-button'} onClick={onLogout}>
              <LogoutIcon className={'log-out-icon'}/>
            </button>
          : null
        }
      </div>
    </header>
  );
};

export default IrmaAppBar;
