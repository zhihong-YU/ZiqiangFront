import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, extra }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
      <div><Title level={4} style={{ margin: 0 }}>{title}</Title>{description && <Typography.Text type="secondary">{description}</Typography.Text>}</div>
      <div>{extra}</div>
    </div>
  );
};
