import { fetchAllPages } from '@/utils/apiFetch'
import React, { useEffect, useState } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Button, Modal, Table } from '@/components/ui'
import { Descriptions, Space, Tag, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

interface FileInfo {
  id: string
  original_name: string
  file_url: string
}

interface ApplicationItem {
  id: number
  event: number
  event_title: string
  student: number
  student_name: string
  student_id: string
  student_email: string
  statement: string
  resume?: FileInfo | null
  status: ApplicationStatus
  review_note: string
  reviewed_at: string | null
  created_at: string
  updated_at: string
}


const statusText: Record<ApplicationStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消',
}

const statusColor: Record<ApplicationStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
}

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentApp, setCurrentApp] = useState<ApplicationItem | null>(null)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setApplications(await fetchAllPages<ApplicationItem>('/api/event/my-applications/'))
    } catch {
      message.error('获取申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/event/my-applications/${id}/`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      setCurrentApp(data)
      setDetailVisible(true)
    } catch {
      message.error('获取申请详情失败')
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const columns = [
    {
      title: '申请项目',
      dataIndex: 'event_title',
      key: 'event_title',
      width: '30%',
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: ApplicationStatus) => (
        <Tag color={statusColor[val]}>{statusText[val]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApplicationItem) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => fetchApplicationDetail(record.id)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <PageHeader
        title="我的申请"
        description="查看和管理您已提交的项目申请"
      />
      <ContentCard>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </ContentCard>

      <Modal
        title="申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentApp && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="项目名称">{currentApp.event_title}</Descriptions.Item>
            <Descriptions.Item label="申请状态">
              <Tag color={statusColor[currentApp.status]}>{statusText[currentApp.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {new Date(currentApp.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="申请陈述">
              <div style={{ whiteSpace: 'pre-wrap' }}>{currentApp.statement || '无'}</div>
            </Descriptions.Item>
            {currentApp.resume && (
              <Descriptions.Item label="简历/附件">
                <a href={currentApp.resume.file_url} target="_blank" rel="noreferrer">
                  {currentApp.resume.original_name}
                </a>
              </Descriptions.Item>
            )}
            {currentApp.status !== 'pending' && (
              <>
                <Descriptions.Item label="审批时间">
                  {currentApp.reviewed_at ? new Date(currentApp.reviewed_at).toLocaleString() : '无'}
                </Descriptions.Item>
                <Descriptions.Item label="审批意见">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{currentApp.review_note || '无'}</div>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </MainLayout>
  )
}

export default MyApplications
