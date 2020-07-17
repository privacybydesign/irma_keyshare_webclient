import React from 'react';

import './irma_app_bar.scss'
import LogoutIcon from './logout_icon';
import p from 'prop-types';

const IrmaAppBar = ({title, theme, onLogout}) => {
  return (
    <header className={`irma-app-bar theme-${theme}`}>
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

IrmaAppBar.defaultProps = {
  theme: 'primary',
}

IrmaAppBar.propTypes = {
  theme: p.oneOf(['primary', 'secondary']).isRequired,
};

export default IrmaAppBar;
