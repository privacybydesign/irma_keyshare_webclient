import React from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/nl';

import styles from './select_candidate.module.scss';
import Column from '../../widgets/column';
import YiviAppBar from '../../widgets/yivi_app_bar';
import YiviButton from '../../widgets/yivi_button';
import Spacer from '../../widgets/spacer';
import YiviTable from '../../widgets/yivi_table';
import type { AppDispatch, Candidate } from '../../types';

interface OwnProps {
  dispatch: AppDispatch;
  candidates: Candidate[];
  token: string;
}

type Props = OwnProps & WithTranslation;

class SelectCandidate extends React.Component<Props> {
  handleSelectCandidate(username: string) {
    this.props.dispatch({ type: 'finishTokenLogin', token: this.props.token, username });
  }

  renderCandidates() {
    return this.props.candidates.map((candidate) => {
      const lastActive = moment.unix(candidate.last_active).locale(this.props.i18n.language);
      return (
        <tr key={candidate.username}>
          <td>{candidate.username}</td>
          <td title={lastActive.format('dddd, D MMM YYYY, H:mm:ss')}>{lastActive.fromNow()}</td>
          <td className={styles.buttonCol}>
            <YiviButton theme={'ghost'} onClick={() => this.handleSelectCandidate(candidate.username)}>
              {this.props.t('login')}
            </YiviButton>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <>
        <YiviAppBar title={this.props.t('title')} />
        <Column>
          <Spacer />
          <p>{this.props.t('explanation')}</p>
          <ul>
            <li>
              <strong>{this.props.t('username')}:</strong>
              &ensp;
              {this.props.t('candidates-item-1')}
            </li>
            <li>
              <strong>{this.props.t('last-seen')}:</strong>
              &ensp;
              {this.props.t('candidates-item-2')}
            </li>
          </ul>
          <YiviTable id="user-candidates">
            <thead>
              <tr>
                <th>{this.props.t('username')}</th>
                <th>{this.props.t('last-seen')}</th>
                <th className={styles.buttonCol} />
              </tr>
            </thead>
            <tbody id="user-candidates-body">{this.renderCandidates()}</tbody>
          </YiviTable>
        </Column>
      </>
    );
  }
}

export default withTranslation('login-select-candidate')(SelectCandidate);
