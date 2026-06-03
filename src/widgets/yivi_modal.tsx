import React from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import styles from './yivi_modal.module.scss';
import Column from './column';
import YiviButton from './yivi_button';
import CrossIcon from './cross_icon';
import Spacer from './spacer';

interface OwnProps {
  title: string;
  action: string;
  onConfirm: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
}

type Props = OwnProps & WithTranslation;

class YiviModal extends React.Component<Props> {
  render() {
    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h2>{this.props.title}</h2>
              <button
                type="button"
                className={styles.dismissButton}
                aria-label={this.props.t('cancel')}
                onClick={() => this.props.onDismiss()}
              >
                <CrossIcon />
              </button>
            </div>
            <Column>
              {this.props.children}
              <Spacer size={'small'} />
              <div className={styles.buttonBar}>
                <YiviButton theme={'secondary'} onClick={() => this.props.onDismiss()}>
                  {this.props.t('cancel')}
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

export default withTranslation('yivi-modal')(YiviModal);
