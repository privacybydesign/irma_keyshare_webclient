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
import { baseLanguage } from '../../i18n';

// See select_method.jsx for the rationale on the cancellation sentinel.
// Keep this string in sync with that one — both call sites should switch
// together if yivi-frontend ever exports a typed cancel marker.
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
    // React's contract: return `null` to signal "no state change". Returning
    // `state` (the same object reference) still schedules a no-op re-render
    // pass internally — null is the documented zero-cost signal.
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
      language: baseLanguage(this.props.i18n),
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
            <a
              role="button"
              tabIndex="0"
              className={styles.tooltip}
              data-title={this.props.t('delete-in-progress-explanation')}
            >
              {this.props.t('delete-in-progress')}
            </a>
          ) : address.revalidate_in_progress ? (
            <a
              role="button"
              tabIndex="0"
              className={styles.tooltip}
              data-title={this.props.t('revalidate-in-progress-explanation')}
            >
              {this.props.t('revalidate-in-progress')}
            </a>
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
                  // Optional chaining: see load_cards/index.jsx for rationale —
                  // a missing /config.js shouldn't crash the AccountOverview
                  // render path on top of the reducer-level guards.
                  window.config?.emailIssuanceUrl?.[baseLanguage(this.props.i18n)] ||
                  window.config?.emailIssuanceUrl?.en
                }
              >
                {/* Trans fills in the link text from the translation. */}
              </a>,
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
