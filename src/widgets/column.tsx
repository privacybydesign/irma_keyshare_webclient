import styles from './column.module.scss';

const Column = ({ children, className, ...columnProps }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...columnProps} className={[styles.column, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
};

export default Column;
