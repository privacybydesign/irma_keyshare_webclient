import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import IrmaAppBar from '../../helpers/irma_app_bar';
import LoadingSpinner from '../../helpers/loading_spinner';
import Emails from '../emails';
import Logs from './logs';
import Column from '../../helpers/column';

const mapStateToProps = state => {
  return {
    ...state.userdata,
  };
};

class AccountOverview extends React.Component {
  t = this.props.t;

  renderUsername() {
    return (
      <p>
        {this.t('logged-in-as')}
        &nbsp;
        <span>{this.props.username}</span>
      </p>
    );
  }

  renderBody() {
    if (this.props.fetching) {
      return <LoadingSpinner/>;
    } else {
      return (
        <Column>
          {this.renderUsername()}
          <Logs/>
          <Emails/>
        </Column>
      );
    }
  }

  render() {
    return (
      <>
        <IrmaAppBar
          title={this.t('title')}
          onLogout={() => this.props.dispatch({type: 'loggedOut'})}
        />
        {this.renderBody()}
      </>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('account-overview')(AccountOverview));
