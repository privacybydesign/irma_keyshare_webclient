import React from 'react';
import p from 'prop-types';
import { withTranslation } from 'react-i18next';
import styles from './yivi_modal.module.scss';
import Column from './column';
import YiviButton from './yivi_button';
import CrossIcon from './cross_icon';

class YiviModal extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  render() {
    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h2>{this.props.title}</h2>
              <div onClick={() => this.props.onDismiss()}>
                <CrossIcon />
              </div>
            </div>
            <Column>
              {this.props.children}
              <div className={styles.buttonBar}>
                <YiviButton theme={'secondary'} onClick={() => this.props.onDismiss()}>
                  {this.t('cancel')}
                </YiviButton>
                <YiviButton theme={'primary'} onClick={() => this.props.onConfirm()}>
                  {this.props.action}
                </YiviButton>
              </div>
            </Column>
          </div>
        </div>
      </div>
    );
  }
}

YiviModal.propTypes = {
  title: p.string.isRequired,
  action: p.string.isRequired,
  onConfirm: p.func.isRequired,
  onDismiss: p.func.isRequired,
};

export default withTranslation('yivi-modal')(YiviModal);
