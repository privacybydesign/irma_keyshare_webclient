import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import YiviAppBar from '../../widgets/yivi_app_bar';
import LoadingSpinner from '../../widgets/loading_spinner';
import Emails from '../emails';
import Logs from '../logs';
import Column from '../../widgets/column';
import DeleteAccount from '../delete_account';
import LoadCards from '../load_cards';
import Spacer from '../../widgets/spacer';

const mapStateToProps = (state) => {
  return {
    username: state.userdata.username,
    fetching: state.userdata.fetching,
  };
};

class AccountOverview extends React.Component {
  renderUsername() {
    return (
      <p>
        {this.props.t('logged-in-as')}
        &nbsp;
        <span>{this.props.username}</span>
      </p>
    );
  }

  renderBody() {
    if (this.props.fetching) {
      return <LoadingSpinner />;
    } else {
      return (
        <Column>
          {this.renderUsername()}
          <Logs />
          <Spacer />
          <LoadCards />
          <Spacer />
          <Emails />
          <Spacer />
          <DeleteAccount />
        </Column>
      );
    }
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.props.t('title')} onLogout={() => this.props.dispatch({ type: 'logout' })} />
        {this.renderBody()}
      </>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('account-overview')(AccountOverview));
