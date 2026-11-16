import React from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import styles from './logs_table.module.scss';
import YiviTable from '../../widgets/yivi_table';
import { formatAbsoluteTime, formatRelativeTime } from '../../datetime';
import type { LogEntry } from '../../types';

interface OwnProps {
  logEntries: LogEntry[];
}

type Props = OwnProps & WithTranslation;

class LogsTable extends React.Component<Props> {
  renderLogEntryTime(timestamp: number) {
    const lang = this.props.i18n.language;

    return (
      <td className={'when-column'} title={formatAbsoluteTime(timestamp, lang)}>
        {formatRelativeTime(timestamp, lang)}
      </td>
    );
  }

  renderLogEntry(logEntry: LogEntry, index: number) {
    return (
      <tr key={index}>
        {this.renderLogEntryTime(logEntry.timestamp)}
        <td className={styles.eventColumn}>
          {this.props.t(`logs-events:${logEntry.event}`, { param: logEntry.param })}
        </td>
      </tr>
    );
  }

  render() {
    return (
      <YiviTable>
        <thead>
          <tr>
            <th className={styles.whenColumn}>{this.props.t('when')}</th>
            <th className={styles.eventColumn}>{this.props.t('event')}</th>
          </tr>
        </thead>
        <tbody>{this.props.logEntries.map((entry, index) => this.renderLogEntry(entry, index))}</tbody>
      </YiviTable>
    );
  }
}

export default withTranslation(['logs-table', 'logs-events'])(LogsTable);
