import React from 'react';
import {connect} from 'react-redux';
import p from 'prop-types';
import {Trans, withTranslation} from 'react-i18next';
import IrmaButton from '../../helpers/irma_button';
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
  t = this.props.t;

  deleteEmail(address) {
    this.props.dispatch({
      type: 'removeEmail',
      email: address,
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
        console.error(err); // TODO: show in error page
    });
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
            : <IrmaButton theme={'secondary'} onClick={() => this.deleteEmail(address.email)}>{this.t('delete')}</IrmaButton>
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

  render = () => {
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