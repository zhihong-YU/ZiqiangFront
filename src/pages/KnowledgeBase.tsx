import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Layout, Empty } from 'antd';

const { Content } = Layout;

const KnowledgeBase: React.FC = () => {
  return (
    <MainLayout>
      <PageHeader title="知识库" />
      
      <Layout style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', minHeight: 600, border: '1px solid #f0f0f0' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty 
            description="模块建设中，敬请期待..." 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Content>
      </Layout>
    </MainLayout>
  );
};

export default KnowledgeBase;
