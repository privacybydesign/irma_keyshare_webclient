import React from 'react';
import styles from './spacer.module.scss';

interface Props {
  size?: 'large' | 'small';
}

class Spacer extends React.Component<Props> {
  render() {
    const { size } = this.props;
    return <div className={styles[size ?? 'large']} />;
  }
}

export default Spacer;
