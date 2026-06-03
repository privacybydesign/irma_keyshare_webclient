import React from 'react';
import styles from './yivi_button.module.scss';

type Theme = 'primary' | 'secondary' | 'tertiary' | 'ghost';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
}

class YiviButton extends React.Component<Props> {
  render() {
    const { theme, children, className, ...buttonProps } = this.props;
    return (
      <button {...buttonProps} className={[styles[`button-${theme}`], className].filter(Boolean).join(' ')}>
        {children}
      </button>
    );
  }
}

export default YiviButton;
