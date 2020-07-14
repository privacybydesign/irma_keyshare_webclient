import React from 'react';
import {withTranslation} from 'react-i18next';

import moment from 'moment';
import 'moment/locale/nl';

import './logs_table.scss';

const LogsTable = (props) => {

  const renderLogEntryTime = (timestamp) => {
    let time = moment.unix(timestamp).locale(props.i18n.language);

    return (
      <td className={'when-column'} title={time.format('dddd, D MMM YYYY, H:mm:ss')}>
        {time.fromNow()}
      </td>
    );
  }

  const renderLogEntry = (logEntry, index) => {
    return (
      <tr key={index}>
        {renderLogEntryTime(logEntry.timestamp)}
        <td className={'event-column'}>
          {props.t(`logs-events:${logEntry.event}`, {param: logEntry.param})}
        </td>
      </tr>
    );
  }

  return (
    <table className={'logs-table'}>
      <thead>
      <tr>
        <th className={'when-column'}>{props.t('when')}</th>
        <th className={'event-column'}>{props.t('event')}</th>
      </tr>
      </thead>
      <tbody>
      {props.logEntries.map((entry, index) => renderLogEntry(entry, index))}
      </tbody>
    </table>
  );
}

export default withTranslation(['logs-table', 'logs-events'])(LogsTable);
