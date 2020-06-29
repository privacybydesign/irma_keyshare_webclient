import React from 'react';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import 'moment/locale/nl';

import './select_candidate.scss';
import IrmaAppBar from '../../helpers/irma_app_bar';

class SelectCandidate extends React.Component {
  t = this.props.t;

  handleSelectCandidate(username) {
    this.props.dispatch({type: 'finishTokenLogin', token: this.props.token, username: username});
  }

  renderCandidates() {
    return this.props.candidates.map((candidate) => {
      let lastActive = moment.unix(candidate['last_active']).locale(this.props.i18n.language);
      return (
        <tr key={candidate['username']}>
          <td>
            {candidate['username']}
          </td>
          <td title={lastActive.format('dddd, D MMM YYYY, H:mm:ss')}>
            {lastActive.fromNow()}
          </td>
          <td className={'button-td'}>
            <button className={'btn-primary'} onClick={() => this.handleSelectCandidate(candidate['username'])}>
              {this.t('login')}
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <>
        <IrmaAppBar title={this.t('title')}/>
        <div className={'column'}>
          <p>
            {this.t('explanation')}
          </p>
          <ul>
            <li>
              <strong>
                {this.t('username')}:
              </strong>
              &ensp;
              {this.t('candidates-item-1')}
            </li>
            <li>
              <strong>
                {this.t('last-seen')}:
              </strong>
              &ensp;
              {this.t('candidates-item-2')}
              </li>
          </ul>
          <table className="candidate-table" id="user-candidates">
            <thead>
            <tr>
              <th>
                {this.t('username')}
              </th>
              <th>
                {this.t('last-seen')}
              </th>
              <th className={'button-td'}/>
            </tr>
            </thead>
            <tbody id="user-candidates-body">
              {this.renderCandidates()}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}

export default withTranslation('login-select-candidate')(SelectCandidate);
