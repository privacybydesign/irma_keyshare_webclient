import React from 'react';
import styles from './yivi_app_bar.module.scss';
import YiviButton from './yivi_button';
import { withTranslation } from 'react-i18next';
import Column from './column';

class YiviAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  render() {
    return (
      <header className={styles.bar}>
        <Column className={styles.content}>
          <h1>{this.props.title}</h1>
          {this.props.onLogout ? (
            <div>
              <YiviButton theme={'primary'} onClick={this.props.onLogout} type={'button'}>
                {this.t('logout')}
              </YiviButton>
            </div>
          ) : null}
        </Column>
      </header>
    );
  }
}
export default withTranslation('yivi-app-bar')(YiviAppBar);
