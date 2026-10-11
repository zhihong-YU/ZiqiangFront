import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { ContentCard } from '@/components/common/ContentCard';
import { TemplateLibrary } from '@/components/common/TemplateLibrary';

const KnowledgeBase: React.FC = () => {
  return (
    <MainLayout>
      <PageHeader title="知识库" description="下载项目申请模板与学习资料" />
      <ContentCard><TemplateLibrary /></ContentCard>
    </MainLayout>
  );
};

export default KnowledgeBase;
