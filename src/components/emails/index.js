import React from 'react';
import {connect} from 'react-redux';
import p from 'prop-types';
import {Trans, withTranslation} from 'react-i18next';
import IrmaButton from '../../helpers/irma_button';
import IrmaModal from "../../helpers/irma_modal";
import IrmaTable from '../../helpers/irma_table';
import './index.scss';
import * as IrmaFrontend from '@privacybydesign/irma-frontend';

function mapStateToProps(state) {
  return {
    emails: state.userdata.emails,
    addEmailIrmaSession: state.userdata.addEmailIrmaSession,
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

  addEmail() {
    let irma = IrmaFrontend.newPopup({
      language: this.props.i18n.language,
      session: this.props.addEmailIrmaSession,
    });
    irma.start()
    .then(() =>
      this.props.dispatch({type: 'startUpdateInfo'})
    )
    .catch((err) => {
      if (err !== "Aborted")
        this.props.dispatch({ type: 'raiseError', errorMessage: `Error while adding email address: ${err}` });
    });
  }

  renderDeleteEmailConfirmation() {
    return <IrmaModal
        theme={'secondary'}
        title={this.t('delete-confirm-header')}
        action={this.t('delete')}
        onConfirm={() => this.onConfirmDeleteEmail()}
        onDismiss={() => this.setState({ emailToBeDeleted: null })}
    >
      <p>
        { this.t('delete-confirm-explanation', { email: this.state.emailToBeDeleted }) }
      </p>
    </IrmaModal>
  }

  renderEmailHeader() {
    return (
      <thead>
      <tr>
        <th>{this.t('emailaddress')}</th>
        <th/>
      </tr>
      </thead>
    );
  }

  renderEmailRow(address) {
    return (
      <tr key={address.email}>
        <td>{address.email}</td>
        <td className={'delete-column'}>{
          address.delete_in_progress
            ? this.t('delete-in-progress')
            : <IrmaButton theme={'secondary'} onClick={() => this.onDeleteEmail(address.email)}>{this.t('delete')}</IrmaButton>
        }</td>
      </tr>
    );
  }

  renderEmailList() {
    if (this.props.emails.length === 0) {
      return (
        <p>
          {this.t('no-email-addresses')}
        </p>
      );
    } else {
      return (
        <IrmaTable>
          {this.renderEmailHeader()}
          <tbody>
          {this.props.emails.map((email) => this.renderEmailRow(email))}
          </tbody>
        </IrmaTable>
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
        <IrmaButton theme={'primary'} className={'add-email'} onClick={() => this.addEmail()}>
          {this.t('add-email')}
        </IrmaButton>
        { this.state.emailToBeDeleted ? this.renderDeleteEmailConfirmation() : null }
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