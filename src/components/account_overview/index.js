import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import IrmaAppBar from '../../helpers/irma_app_bar';
import LoadingSpinner from '../../helpers/loading_spinner';
import Emails from '../emails';
import Logs from '../logs';
import Column from '../../helpers/column';
import DeleteAccount from '../delete_account';
import LoadCards from '../load_cards';

const mapStateToProps = state => {
  return {
    username: state.userdata.username,
    fetching: state.userdata.fetching,
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
          <LoadCards/>
          <Emails/>
          <DeleteAccount/>
        </Column>
      );
    }
  }

  render() {
    return (
      <>
        <IrmaAppBar
          title={this.t('title')}
          onLogout={() => this.props.dispatch({type: 'logout'})}
        />
        {this.renderBody()}
      </>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('account-overview')(AccountOverview));
