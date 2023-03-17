import React from 'react';
import p from 'prop-types';
import styles from './spacer.module.scss';

class Spacer extends React.Component {
  render() {
    const { size } = this.props;
    return <div className={styles[size || 'large']} />;
  }
}

Spacer.propTypes = {
  size: p.oneOf(['large', 'small']),
};

export default Spacer;
