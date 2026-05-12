import { Card, CardProps } from 'antd';
import React from 'react';

export const ContentCard: React.FC<CardProps> = (props) => {
  return <Card variant="borderless" {...props} style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', ...props.style }} />;
};
