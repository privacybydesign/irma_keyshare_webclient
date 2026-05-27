import React from 'react';
import p from 'prop-types';
import styles from './yivi_button.module.scss';

class YiviButton extends React.Component {
  render() {
    const { theme, children, className, ...buttonProps } = this.props;
    return (
      <button {...buttonProps} className={[styles[`button-${theme}`], className].filter((x) => x).join(' ')}>
        {children}
      </button>
    );
  }
}

YiviButton.propTypes = {
  theme: p.oneOf(['primary', 'secondary', 'tertiary', 'ghost']).isRequired,
};

export default YiviButton;
