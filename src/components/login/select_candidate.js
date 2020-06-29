import React from 'react';
import {withTranslation} from 'react-i18next';

import './select_candidate.scss';

class SelectCandidate extends React.Component {
  t = this.props.t;

  handleSelectCandidate(username) {
    this.props.dispatch({type: 'finishTokenLogin', token: this.props.token, username: username});
  }

  renderCandidates() {
    return this.props.candidates.map((candidate) => {
      return (
        <tr key={candidate['username']}>
          <th>
            {candidate['username']}
          </th>
          <th>
            {candidate['last_active']}
          </th>
          <th>
            <button className={'btn-primary'} onClick={() => this.handleSelectCandidate(candidate['username'])}>
              {this.t('login')}
            </button>
          </th>
        </tr>
      );
    });
  }

  render() {
    return (
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
            <th/>
          </tr>
          </thead>
          <tbody id="user-candidates-body">
            {this.renderCandidates()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withTranslation('login-select-candidate')(SelectCandidate);
