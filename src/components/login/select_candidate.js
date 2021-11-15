import React from 'react';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/nl';

import './select_candidate.scss';
import Column from '../../widgets/column';
import IrmaAppBar from '../../widgets/irma_app_bar';
import IrmaButton from '../../widgets/irma_button';

class SelectCandidate extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
  }

  handleSelectCandidate(username) {
    this.props.dispatch({ type: 'finishTokenLogin', token: this.props.token, username: username });
  }

  renderCandidates() {
    return this.props.candidates.map((candidate) => {
      const lastActive = moment.unix(candidate.last_active).locale(this.props.i18n.language);
      return (
        <tr key={candidate.username}>
          <td>{candidate.username}</td>
          <td title={lastActive.format('dddd, D MMM YYYY, H:mm:ss')}>{lastActive.fromNow()}</td>
          <td className={'button-td'}>
            <IrmaButton theme={'primary'} onClick={() => this.handleSelectCandidate(candidate.username)}>
              {this.t('login')}
            </IrmaButton>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <>
        <IrmaAppBar title={this.t('title')} />
        <Column>
          <p>{this.t('explanation')}</p>
          <ul>
            <li>
              <strong>{this.t('username')}:</strong>
              &ensp;
              {this.t('candidates-item-1')}
            </li>
            <li>
              <strong>{this.t('last-seen')}:</strong>
              &ensp;
              {this.t('candidates-item-2')}
            </li>
          </ul>
          <table className="candidate-table" id="user-candidates">
            <thead>
              <tr>
                <th>{this.t('username')}</th>
                <th>{this.t('last-seen')}</th>
                <th className={'button-td'} />
              </tr>
            </thead>
            <tbody id="user-candidates-body">{this.renderCandidates()}</tbody>
          </table>
        </Column>
      </>
    );
  }
}

export default withTranslation('login-select-candidate')(SelectCandidate);
