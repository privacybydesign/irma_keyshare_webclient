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

// yivi-frontend rejects with this string on user cancel (not an error).
const YIVI_CANCELLED_SENTINEL = 'Aborted';

function mapStateToProps(state) {
  return {
    emails: state.userdata.emails,
    addEmailYiviSession: state.userdata.addEmailYiviSession,
  };
}

class Emails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailToBeDeleted: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.emailToBeDeleted === null) return null;
    const stillActive = props.emails.some(
      (address) => !address.delete_in_progress && address.email === state.emailToBeDeleted,
    );
    return stillActive ? null : { emailToBeDeleted: null };
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
        if (err !== YIVI_CANCELLED_SENTINEL)
          this.props.dispatch({ type: 'raiseError', errorMessage: `Error while adding email address: ${err}` });
      });
  }

  renderDeleteEmailConfirmation() {
    return (
      <YiviModal
        title={this.props.t('delete-confirm-header')}
        action={this.props.t('delete')}
        onConfirm={() => this.onConfirmDeleteEmail()}
        onDismiss={() => this.setState({ emailToBeDeleted: null })}
      >
        <p>{this.props.t('delete-confirm-explanation', { email: this.state.emailToBeDeleted })}</p>
      </YiviModal>
    );
  }

  renderEmailHeader() {
    return (
      <thead>
        <tr>
          <th>{this.props.t('emailaddress')}</th>
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
            <span
              className={styles.tooltip}
              data-title={this.props.t('delete-in-progress-explanation')}
              aria-label={this.props.t('delete-in-progress-explanation')}
            >
              {this.props.t('delete-in-progress')}
            </span>
          ) : address.revalidate_in_progress ? (
            <span
              className={styles.tooltip}
              data-title={this.props.t('revalidate-in-progress-explanation')}
              aria-label={this.props.t('revalidate-in-progress-explanation')}
            >
              {this.props.t('revalidate-in-progress')}
            </span>
          ) : (
            <YiviButton theme={'ghost'} onClick={() => this.onDeleteEmail(address.email)}>
              <CrossIcon />
              {this.props.t('delete')}
            </YiviButton>
          )}
        </td>
      </tr>
    );
  }

  renderEmailList() {
    if (this.props.emails.length === 0) {
      return <p>{this.props.t('no-email-addresses')}</p>;
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
        <h2>{this.props.t('header')}</h2>
        <p>
          <Trans
            t={this.props.t}
            i18nKey="explanation"
            components={[
              <a
                key="issuer-link"
                href={
                  window.config?.emailIssuanceUrl?.[this.props.i18n.language] || window.config?.emailIssuanceUrl?.en
                }
              />,
            ]}
          />
        </p>
        {this.renderEmailList()}
        <YiviButton theme={'tertiary'} className={'add-email'} onClick={() => this.onAddEmail()}>
          <PlusIcon />
          {this.props.t('add-email')}
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
