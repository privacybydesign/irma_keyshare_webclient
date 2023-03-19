import React from 'react';
import { connect } from 'react-redux';
import p from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import YiviButton from '../../widgets/yivi_button';
import YiviModal from '../../widgets/yivi_modal';
import YiviTable from '../../widgets/yivi_table';
import PlusIcon from '../../widgets/plus_icon';
import styles from './index.module.scss';
import * as YiviFrontend from '@privacybydesign/yivi-frontend';
import CrossIcon from '../../widgets/cross_icon';

function mapStateToProps(state) {
  return {
    emails: state.userdata.emails,
    addEmailYiviSession: state.userdata.addEmailYiviSession,
  };
}

class Emails extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
    this.state = {
      emailToBeDeleted: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const activeEmailAddresses = props.emails
      .filter((address) => !address.delete_in_progress)
      .map((address) => address.email);
    if (!activeEmailAddresses.includes(state.emailToBeDeleted)) {
      return {
        emailToBeDeleted: null,
      };
    }
    return state;
  }

  onConfirmDeleteEmail() {
    this.props.dispatch({
      type: 'removeEmail',
      email: this.state.emailToBeDeleted,
    });
  }

  onDeleteEmail(address) {
    this.setState({
      emailToBeDeleted: address,
    });
  }

  onAddEmail() {
    YiviFrontend.newPopup({
      language: this.props.i18n.language,
      session: this.props.addEmailYiviSession,
    })
      .start()
      .then(() => {
        this.props.dispatch({ type: 'startUpdateInfo' });
      })
      .catch((err) => {
        if (err !== 'Aborted')
          this.props.dispatch({ type: 'raiseError', errorMessage: `Error while adding email address: ${err}` });
      });
  }

  renderDeleteEmailConfirmation() {
    return (
      <YiviModal
        title={this.t('delete-confirm-header')}
        action={this.t('delete')}
        onConfirm={() => this.onConfirmDeleteEmail()}
        onDismiss={() => this.setState({ emailToBeDeleted: null })}
      >
        <p>{this.t('delete-confirm-explanation', { email: this.state.emailToBeDeleted })}</p>
      </YiviModal>
    );
  }

  renderEmailHeader() {
    return (
      <thead>
        <tr>
          <th>{this.t('emailaddress')}</th>
          <th />
        </tr>
      </thead>
    );
  }

  renderEmailRow(address) {
    return (
      <tr key={address.email}>
        <td>{address.email}</td>
        <td className={styles.deleteColumn}>
          {address.delete_in_progress ? (
            this.t('delete-in-progress')
          ) : (
            <YiviButton theme={'ghost'} onClick={() => this.onDeleteEmail(address.email)}>
              <CrossIcon />
              {this.t('delete')}
            </YiviButton>
          )}
        </td>
      </tr>
    );
  }

  renderEmailList() {
    if (this.props.emails.length === 0) {
      return <p>{this.t('no-email-addresses')}</p>;
    } else {
      return (
        <YiviTable>
          {this.renderEmailHeader()}
          <tbody>{this.props.emails.map((email) => this.renderEmailRow(email))}</tbody>
        </YiviTable>
      );
    }
  }

  render() {
    return (
      <>
        <h2>{this.t('header')}</h2>
        <p>
          <Trans
            t={this.t}
            i18nKey="explanation"
            // eslint-disable-next-line
            components={[ <a href={window.config.emailIssuanceUrl[this.props.i18n.language]} /> ]}
          />
        </p>
        {this.renderEmailList()}
        <YiviButton theme={'tertiary'} className={'add-email'} onClick={() => this.onAddEmail()}>
          <PlusIcon />
          {this.t('add-email')}
        </YiviButton>
        {this.state.emailToBeDeleted ? this.renderDeleteEmailConfirmation() : null}
      </>
    );
  }
}

Emails.propTypes = {
  t: p.func.isRequired,
  dispatch: p.func.isRequired,
  emails: p.arrayOf(p.object.isRequired).isRequired,
};

export default withTranslation('emails')(connect(mapStateToProps)(Emails));
