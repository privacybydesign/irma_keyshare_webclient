import styles from './yivi_table.module.scss';

const YiviTable = ({ children, ...tableProps }: React.TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className={styles.wrapper}>
      <table {...tableProps} className={styles.table}>
        {children}
      </table>
    </div>
  );
};

export default YiviTable;
