import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import LoadingSpinner from '../../widgets/loading_spinner';
import LogsTable from './logs_table';
import ChevronLeftIcon from '../../widgets/chevron-left-icon';
import ChevronRightIcon from '../../widgets/chevron-right-icon';
import IrmaButton from '../../widgets/irma_button';
import './index.scss';

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
          <div className={'button-row'}>
            <IrmaButton
              theme={'plain'}
              className={'refresh'}
              disabled={this.props.currentIndex > 0}
              onClick={() => this.loadLogs(0)}
            >
              {this.t('refresh')}
            </IrmaButton>
            <IrmaButton
              theme={'plain'}
              className={'previous'}
              disabled={this.props.currentIndex === 0}
              onClick={() => this.loadLogs(-LOGS_PER_PAGE)}
            >
              <ChevronLeftIcon />
              {this.t('previous')}
            </IrmaButton>
            <IrmaButton
              theme={'plain'}
              className={'next'}
              disabled={!this.props.haveMore}
              onClick={() => this.loadLogs(LOGS_PER_PAGE)}
            >
              {this.t('next')}
              <ChevronRightIcon />
            </IrmaButton>
          </div>
          <LogsTable logEntries={this.props.logEntries} />
        </>
      );
    }
  }

  render() {
    return (
      <>
        <h2>{this.t('header')}</h2>
        {this.renderLogs()}
      </>
    );
  }
}

export default connect(mapStateToProps)(withTranslation('logs')(Logs));
