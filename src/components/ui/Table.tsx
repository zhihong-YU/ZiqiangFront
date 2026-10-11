import { Table as AntTable, TableProps } from 'antd';

export const Table = <RecordType extends object = Record<string, unknown>>(props: TableProps<RecordType>) => {
  return <AntTable<RecordType> {...props} />;
};
