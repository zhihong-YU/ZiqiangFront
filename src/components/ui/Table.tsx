import { Table as AntTable, TableProps } from 'antd';

export const Table = <RecordType extends object = any>(props: TableProps<RecordType>) => {
  return <AntTable<RecordType> {...props} />;
};
