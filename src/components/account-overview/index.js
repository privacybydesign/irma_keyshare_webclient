import React from 'react';
import {withTranslation} from 'react-i18next';
import IrmaAppBar from '../../helpers/irma_app_bar';

import '../../templates/column.scss';

class AccountOverview extends React.Component {
  t = this.props.t;

  render() {
    return (
      <>
        <IrmaAppBar
          title={this.t('common:title')}
          onLogout={() => this.props.dispatch({type: 'loggedOut'})}
        />
        <div className={'column'}>
          <p>
            TODO.
          </p>
        </div>
      </>
    );
  }
}

export default withTranslation(['account-overview', 'common'])(AccountOverview);
