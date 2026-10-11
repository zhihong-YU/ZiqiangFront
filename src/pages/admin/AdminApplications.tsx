import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Button, Table, Modal } from '@/components/ui'
import { Space, Tag, Select, Input as AntInput, message, Descriptions } from 'antd'
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { handleApiError } from '@/utils/handleApiError'

type AppStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

interface ApplicationItem {
  id: number
  event: number
  event_title: string
  student: number
  student_name: string
  student_id: string
  student_email: string
  statement: string
  resume: { id: string; original_name: string; file_url: string } | null
  status: AppStatus
  review_note: string
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

const statusText: Record<AppStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消',
}
const statusColor: Record<AppStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
}

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray((payload as Record<string, unknown>).results)) {
    return (payload as Record<string, unknown>).results as T[]
  }
  return []
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [eventFilter, setEventFilter] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentApp, setCurrentApp] = useState<ApplicationItem | null>(null)
  const [reviewVisible, setReviewVisible] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNote, setReviewNote] = useState('')

  const fetchApplications = async (requestPage = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (eventFilter) params.set('event', eventFilter)
      params.set('page', String(requestPage))
      params.set('page_size', '20')
      const res = await fetch(`/api/admin/applications/?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      const data = await res.json()
      setApplications(normalizeList<ApplicationItem>(data))
      setTotal(data.count || 0)
    } catch {
      message.error('获取申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(1)
    fetchApplications(1)
  }

  const openDetail = (app: ApplicationItem) => {
    setCurrentApp(app)
    setDetailVisible(true)
  }

  const openReview = (app: ApplicationItem, action: 'approve' | 'reject') => {
    setCurrentApp(app)
    setReviewAction(action)
    setReviewNote('')
    setReviewVisible(true)
  }

  const handleReview = async () => {
    if (!currentApp) return
    try {
      const res = await fetch(`/api/admin/applications/${currentApp.id}/${reviewAction}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_note: reviewNote }),
      })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      message.success(reviewAction === 'approve' ? '已通过' : '已拒绝')
      setReviewVisible(false)
      setDetailVisible(false)
      fetchApplications()
    } catch {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '项目名称', dataIndex: 'event_title', key: 'event_title' },
    { title: '申请人', dataIndex: 'student_name', key: 'student_name' },
    { title: '学号', dataIndex: 'student_id', key: 'student_id' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: AppStatus) => <Tag color={statusColor[s]}>{statusText[s]}</Tag>,
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApplicationItem) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => openReview(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => openReview(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <PageHeader title="申请管理" />

      <ContentCard>
        <Space style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="状态筛选"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1) }}
            options={[
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已拒绝', value: 'rejected' },
              { label: '已取消', value: 'cancelled' },
            ]}
          />
          <AntInput
            placeholder="按项目ID筛选"
            prefix={<SearchOutlined />}
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 180 }}
          />
          <Button onClick={handleSearch}>搜索</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            showSizeChanger: false,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t: number) => `共 ${t} 条`,
          }}
          scroll={{ x: 900 }}
        />
      </ContentCard>

      {/* 详情 Modal */}
      <Modal
        title="申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={700}
        footer={
          <Space>
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
            {currentApp?.status === 'pending' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    setReviewAction('approve')
                    setReviewNote('')
                    setReviewVisible(true)
                  }}
                >
                  通过
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setReviewAction('reject')
                    setReviewNote('')
                    setReviewVisible(true)
                  }}
                >
                  拒绝
                </Button>
              </>
            )}
          </Space>
        }
      >
        {currentApp && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="项目名称">{currentApp.event_title}</Descriptions.Item>
            <Descriptions.Item label="申请人">{currentApp.student_name}</Descriptions.Item>
            <Descriptions.Item label="学号">{currentApp.student_id}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentApp.student_email}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColor[currentApp.status]}>{statusText[currentApp.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请陈述">
              <div style={{ whiteSpace: 'pre-wrap' }}>{currentApp.statement || '-'}</div>
            </Descriptions.Item>
            {currentApp.resume && (
              <Descriptions.Item label="简历附件">
                <a href={currentApp.resume.file_url} target="_blank" rel="noreferrer">
                  {currentApp.resume.original_name}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="申请时间">
              {new Date(currentApp.created_at).toLocaleString()}
            </Descriptions.Item>
            {currentApp.reviewed_at && (
              <>
                <Descriptions.Item label="审核时间">
                  {new Date(currentApp.reviewed_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="审核意见">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{currentApp.review_note || '-'}</div>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 审核 Modal */}
      <Modal
        title={reviewAction === 'approve' ? '通过申请' : '拒绝申请'}
        open={reviewVisible}
        onOk={handleReview}
        onCancel={() => setReviewVisible(false)}
        okText={reviewAction === 'approve' ? '确认通过' : '确认拒绝'}
        okButtonProps={{ danger: reviewAction === 'reject' }}
        destroyOnHidden
      >
        <div style={{ marginBottom: 16 }}>
          <p>申请人: <strong>{currentApp?.student_name}</strong></p>
          <p>项目: <strong>{currentApp?.event_title}</strong></p>
        </div>
        <AntInput.TextArea
          rows={3}
          placeholder="审核意见（选填）"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
        />
      </Modal>
    </AdminLayout>
  )
}

export default AdminApplications
