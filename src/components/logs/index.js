import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import LoadingSpinner from '../../widgets/loading_spinner';
import LogsTable from './logs_table';
import ChevronLeftIcon from '../../widgets/chevron-left-icon';
import ChevronRightIcon from '../../widgets/chevron-right-icon';
import YiviButton from '../../widgets/yivi_button';
import styles from './index.module.scss';
import UpdateIcon from '../../widgets/update_icon';

const LOGS_PER_PAGE = 10;

const mapStateToProps = (state) => {
  return {
    ...state.logs,
  };
};

class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.t = props.t;
    this.mounting = true;
  }

  componentDidMount() {
    if (!this.props.loading) {
      this.loadLogs(0);
    }
    this.mounting = false;
  }

  loadLogs(offset) {
    this.props.dispatch({
      type: 'loadLogs',
      index: this.props.currentIndex + offset,
    });
  }

  renderLogs() {
    if (this.mounting || this.props.loading) {
      return <LoadingSpinner />;
    } else {
      return (
        <>
          <div className={styles.buttonRow}>
            <div>
              <h2>{this.t('header')}</h2>
            </div>
            <div>
              <YiviButton
                theme={'tertiary'}
                className={'refresh'}
                disabled={this.props.currentIndex > 0}
                onClick={() => this.loadLogs(0)}
              >
                <UpdateIcon />
                {this.t('refresh')}
              </YiviButton>
            </div>
          </div>
          <hr className={styles.ruler} />
          <LogsTable logEntries={this.props.logEntries} />
          <div className={styles.buttonRow}>
            <div>
              <YiviButton
                theme={'tertiary'}
                className={'previous'}
                disabled={this.props.currentIndex === 0}
                onClick={() => this.loadLogs(-LOGS_PER_PAGE)}
              >
                <ChevronLeftIcon />
                {this.t('previous')}
              </YiviButton>
            </div>
            <div className={'right'}>
              <YiviButton
                theme={'tertiary'}
                className={'next'}
                disabled={!this.props.haveMore}
                onClick={() => this.loadLogs(LOGS_PER_PAGE)}
              >
                {this.t('next')}
                <ChevronRightIcon />
              </YiviButton>
            </div>
          </div>
        </>
      );
    }
  }

  render() {
    return <>{this.renderLogs()}</>;
  }
}

export default connect(mapStateToProps)(withTranslation('logs')(Logs));
