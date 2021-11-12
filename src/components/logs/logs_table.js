import React from 'react';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import 'moment/locale/nl';

import './logs_table.scss';
import IrmaTable from '../../helpers/irma_table';

class LogsTable extends React.Component {
    constructor(props) {
        super(props);
        this.t = props.t;
    }

    renderLogEntryTime(timestamp) {
    let time = moment.unix(timestamp).locale(this.props.i18n.language);

    return (
      <td className={'when-column'} title={time.format('dddd, D MMM YYYY, H:mm:ss')}>
        {time.fromNow()}
      </td>
    );
  }

  renderLogEntry(logEntry, index) {
    return (
      <tr key={index}>
        {this.renderLogEntryTime(logEntry.timestamp)}
        <td className={'event-column'}>
          {this.t(`logs-events:${logEntry.event}`, {param: logEntry.param})}
        </td>
      </tr>
    );
  }

  render() {
      return (
          <IrmaTable>
              <thead>
              <tr>
                  <th className={'when-column'}>{this.t('when')}</th>
                  <th className={'event-column'}>{this.t('event')}</th>
              </tr>
              </thead>
              <tbody>
              { this.props.logEntries.map((entry, index) => this.renderLogEntry(entry, index)) }
              </tbody>
          </IrmaTable>
      );
  }
}

export default withTranslation(['logs-table', 'logs-events'])(LogsTable);
