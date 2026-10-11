import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { TemplateLibrary } from '@/components/common/TemplateLibrary'

export default function AdminTemplates() {
  return <AdminLayout><PageHeader title="资料管理" description="上传、发布和停用知识库资料" /><ContentCard><TemplateLibrary admin /></ContentCard></AdminLayout>
}
