import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Button, Table, Modal, AppForm } from '@/components/ui'
import { Space, Tag, Select, Input as AntInput, message, Popconfirm, Descriptions } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { handleApiError } from '@/utils/handleApiError'

type EventStatus = 'draft' | 'published' | 'ongoing' | 'closed'

interface EventItem {
  id: number
  title: string
  event_type: string
  start_time: string
  end_time: string
  location: string
  description: string
  attachment: { id: string; original_name: string; file_url: string } | null
  expected_participants: number
  current_participants: number
  status: EventStatus
  teacher: number
  teacher_name: string
  can_delete: boolean
  can_publish: boolean
  can_close: boolean
  pending_applications_count: number
  created_at: string
  updated_at: string
}

const statusText: Record<EventStatus, string> = {
  draft: '草稿',
  published: '已发布',
  ongoing: '进行中',
  closed: '已关闭',
}
const statusColor: Record<EventStatus, string> = {
  draft: 'default',
  published: 'blue',
  ongoing: 'green',
  closed: 'red',
}

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray((payload as Record<string, unknown>).results)) {
    return (payload as Record<string, unknown>).results as T[]
  }
  return []
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null)
  const [form] = AppForm.useForm<EventItem>()

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (searchText) params.set('search', searchText)
      params.set('page', String(page))
      params.set('page_size', '20')
      const res = await fetch(`/api/admin/events/?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEvents(normalizeList<EventItem>(data))
      setTotal(data.count || 0)
    } catch {
      message.error('获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(1)
    fetchEvents()
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      message.success('删除成功')
      fetchEvents()
    } catch {
      message.error('删除失败')
    }
  }

  const handleStatusChange = async (id: number, action: 'publish' | 'close') => {
    try {
      const res = await fetch(`/api/admin/events/${id}/${action}/`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      message.success(action === 'publish' ? '发布成功' : '关闭成功')
      fetchEvents()
    } catch {
      message.error('操作失败')
    }
  }

  const openCreate = () => {
    setEditingEvent(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openEdit = (event: EventItem) => {
    setEditingEvent(event)
    form.setFieldsValue(event)
    setModalVisible(true)
  }

  const openDetail = (event: EventItem) => {
    setCurrentEvent(event)
    setDetailVisible(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}/`
        : '/api/admin/events/'
      const method = editingEvent ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      message.success(editingEvent ? '更新成功' : '创建成功')
      setModalVisible(false)
      fetchEvents()
    } catch {
      // handled
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '项目名称', dataIndex: 'title', key: 'title' },
    { title: '发布教师', dataIndex: 'teacher_name', key: 'teacher_name' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: EventStatus) => <Tag color={statusColor[s]}>{statusText[s]}</Tag>,
    },
    {
      title: '人数',
      key: 'participants',
      render: (_: unknown, r: EventItem) => `${r.current_participants}/${r.expected_participants}`,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EventItem) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.can_publish && (
            <Popconfirm title="确定发布此项目？" onConfirm={() => handleStatusChange(record.id, 'publish')}>
              <Button type="link" icon={<PlayCircleOutlined />} style={{ color: '#1677ff' }}>发布</Button>
            </Popconfirm>
          )}
          {record.can_close && (
            <Popconfirm title="确定关闭此项目？" onConfirm={() => handleStatusChange(record.id, 'close')}>
              <Button type="link" danger icon={<StopOutlined />}>关闭</Button>
            </Popconfirm>
          )}
          <Popconfirm title="确定删除此项目？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <PageHeader title="项目管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建项目</Button>
      } />

      <ContentCard>
        <Space style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="状态筛选"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1) }}
            options={[
              { label: '草稿', value: 'draft' },
              { label: '已发布', value: 'published' },
              { label: '进行中', value: 'ongoing' },
              { label: '已关闭', value: 'closed' },
            ]}
          />
          <AntInput
            placeholder="搜索项目名称"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button onClick={handleSearch}>搜索</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t: number) => `共 ${t} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </ContentCard>

      {/* 编辑/创建 Modal */}
      <Modal
        title={editingEvent ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnHidden
        width={640}
      >
        <AppForm form={form} onFinishAsync={handleSubmit} layout="vertical">
          <AppForm.Item name="title" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="teacher_id" label="教师ID" rules={[{ required: !editingEvent, message: '请输入教师ID' }]}>
            <AntInput disabled={!!editingEvent} />
          </AppForm.Item>
          <AppForm.Item name="event_type" label="项目类型" rules={[{ required: true, message: '请输入项目类型' }]}>
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="location" label="地点">
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="start_time" label="开始时间">
            <AntInput placeholder="2024-09-01T09:00:00Z" />
          </AppForm.Item>
          <AppForm.Item name="end_time" label="结束时间">
            <AntInput placeholder="2024-12-31T18:00:00Z" />
          </AppForm.Item>
          <AppForm.Item name="expected_participants" label="期望人数">
            <AntInput type="number" />
          </AppForm.Item>
          <AppForm.Item name="description" label="项目描述">
            <AntInput.TextArea rows={3} />
          </AppForm.Item>
          <AppForm.Item name="attachment_id" label="附件ID">
            <AntInput />
          </AppForm.Item>
        </AppForm>
      </Modal>

      {/* 详情 Modal */}
      <Modal
        title="项目详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={700}
      >
        {currentEvent && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="ID">{currentEvent.id}</Descriptions.Item>
            <Descriptions.Item label="项目名称">{currentEvent.title}</Descriptions.Item>
            <Descriptions.Item label="项目类型">{currentEvent.event_type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColor[currentEvent.status]}>{statusText[currentEvent.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发布教师">{currentEvent.teacher_name} (ID: {currentEvent.teacher})</Descriptions.Item>
            <Descriptions.Item label="时间">{currentEvent.start_time} ~ {currentEvent.end_time}</Descriptions.Item>
            <Descriptions.Item label="地点">{currentEvent.location}</Descriptions.Item>
            <Descriptions.Item label="人数">{currentEvent.current_participants}/{currentEvent.expected_participants}</Descriptions.Item>
            <Descriptions.Item label="待审核申请">{currentEvent.pending_applications_count}</Descriptions.Item>
            <Descriptions.Item label="描述">{currentEvent.description || '-'}</Descriptions.Item>
            {currentEvent.attachment && (
              <Descriptions.Item label="附件">
                <a href={currentEvent.attachment.file_url} target="_blank" rel="noreferrer">
                  {currentEvent.attachment.original_name}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{new Date(currentEvent.created_at).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{new Date(currentEvent.updated_at).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default AdminEvents
