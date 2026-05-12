import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { MainLayout } from '@/layouts/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { AppForm, Input, Button, Table, Modal } from '@/components/ui'
import { DatePicker, InputNumber, Space, Tag, Tabs, Upload, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined, UsergroupAddOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

type EventStatus = 'draft' | 'published' | 'ongoing' | 'closed'
type AppStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

interface FileInfo {
  id: string
  original_name: string
  file_url: string
}

interface EventItem {
  id: number
  title: string
  event_type: string
  start_time: string
  end_time: string
  location: string
  description: string
  expected_participants: number
  current_participants: number
  status: EventStatus
  teacher_name: string
  attachment?: FileInfo | null
  created_at: string
  can_delete?: boolean
  can_publish?: boolean
  can_close?: boolean
  pending_applications_count?: number
}

interface ApplicationItem {
  id: number
  student_name: string
  student_id: string
  statement: string
  status: AppStatus
  created_at: string
}

const normalizeList = <T,>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const statusColor: Record<EventStatus, string> = {
  draft: 'orange',
  published: 'green',
  ongoing: 'blue',
  closed: 'default',
}

const statusText: Record<EventStatus, string> = {
  draft: '草稿',
  published: '已发布',
  ongoing: '进行中',
  closed: '已关闭',
}

const UploadField = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  const [uploading, setUploading] = useState(false)

  return (
    <Space>
      <Upload
        showUploadList={false}
        beforeUpload={(file) => {
          const allowedExtensions = ['.pdf', '.doc', '.docx', '.zip']
          const fileName = file.name.toLowerCase()
          const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext))
          
          if (!isValidType) {
            message.error('只允许上传 .pdf, .doc, .docx, .zip 格式的文件')
            return Upload.LIST_IGNORE
          }

          if (file.size / 1024 / 1024 > 20) {
            message.error('文件大小不能超过 20MB')
            return Upload.LIST_IGNORE
          }
          return true
        }}
        customRequest={async ({ file, onSuccess, onError }) => {
          try {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', file as File)
            formData.append('category', 'event_attachment')
            const res = await fetch('/api/file/uploads/', {
              method: 'POST',
              body: formData,
            })
            const data = await res.json()
            if (!res.ok) {
              throw new Error(data?.detail || '上传失败')
            }
            onChange?.(data.id)
            onSuccess?.(data)
            message.success('附件上传成功')
          } catch (e) {
            onError?.(e as Error)
            message.error('附件上传失败')
          } finally {
            setUploading(false)
          }
        }}
      >
        <Button loading={uploading} icon={<UploadOutlined />}>上传附件 (≤20MB)</Button>
      </Upload>
      {value ? <Tag color="success">已选择附件</Tag> : null}
    </Space>
  )
}

const ProjectManagement: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [appsVisible, setAppsVisible] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [form] = AppForm.useForm()

  const fetchTeacherEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/event/teacher/events/')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || '获取失败')
      setEvents(normalizeList<EventItem>(data))
    } catch {
      message.error('获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (eventId: number) => {
    try {
      const res = await fetch(`/api/event/teacher/applications/?event=${eventId}`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      setApplications(normalizeList<ApplicationItem>(data))
    } catch {
      message.error('获取申请列表失败')
    }
  }

  useEffect(() => {
    fetchTeacherEvents()
  }, [])

  const handleCreateOrUpdate = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        event_type: '科研',
        start_time: values.date_range[0].toISOString(),
        end_time: values.date_range[1].toISOString(),
        location: values.location,
        description: values.description,
        expected_participants: values.expected_participants,
        attachment_id: values.attachment_id || undefined,
      }
      const url = currentEvent ? `/api/event/teacher/events/${currentEvent.id}/` : '/api/event/teacher/events/'
      const method = currentEvent ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || '提交失败')
      message.success(currentEvent ? '更新成功' : '创建成功')
      setEditVisible(false)
      form.resetFields()
      setCurrentEvent(null)
      fetchTeacherEvents()
    } catch {
      message.error('提交失败')
    }
  }

  const handleDelete = async (event: EventItem) => {
    try {
      const res = await fetch(`/api/event/teacher/events/${event.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      message.success('删除成功')
      fetchTeacherEvents()
    } catch {
      message.error('删除失败')
    }
  }

  const handlePublish = async (event: EventItem) => {
    try {
      const res = await fetch(`/api/event/teacher/events/${event.id}/publish/`, { method: 'POST' })
      if (!res.ok) throw new Error()
      message.success('发布成功')
      fetchTeacherEvents()
    } catch {
      message.error('发布失败')
    }
  }

  const handleClose = async (event: EventItem) => {
    try {
      const res = await fetch(`/api/event/teacher/events/${event.id}/close/`, { method: 'POST' })
      if (!res.ok) throw new Error()
      message.success('关闭成功')
      fetchTeacherEvents()
    } catch {
      message.error('关闭失败')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/event/teacher/applications/${id}/approve/`, { method: 'POST' })
      if (!res.ok) throw new Error()
      message.success('已通过')
      if (currentEvent) fetchApplications(currentEvent.id)
    } catch {
      message.error('操作失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`/api/event/teacher/applications/${id}/reject/`, { method: 'POST' })
      if (!res.ok) throw new Error()
      message.success('已拒绝')
      if (currentEvent) fetchApplications(currentEvent.id)
    } catch {
      message.error('操作失败')
    }
  }

  const eventColumns = [
    { title: '项目名称', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => <Tag color={statusColor[status]}>{statusText[status]}</Tag>,
    },
    {
      title: '参与人数',
      key: 'participants',
      render: (_: unknown, record: EventItem) => `${record.current_participants}/${record.expected_participants}`,
    },
    {
      title: '待审申请',
      dataIndex: 'pending_applications_count',
      key: 'pending_applications_count',
      render: (v: number | undefined) => v ?? 0,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EventItem) => (
        <Space>
          <Button
            type="link"
            icon={<UsergroupAddOutlined />}
            onClick={() => {
              setCurrentEvent(record)
              fetchApplications(record.id)
              setAppsVisible(true)
            }}
          >
            申请
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentEvent(record)
              form.setFieldsValue({
                title: record.title,
                location: record.location,
                description: record.description,
                expected_participants: record.expected_participants,
                attachment_id: record.attachment?.id,
                date_range: [dayjs(record.start_time), dayjs(record.end_time)],
              })
              setEditVisible(true)
            }}
          >
            编辑
          </Button>
          {record.can_publish ? <Button type="link" onClick={() => handlePublish(record)}>发布</Button> : null}
          {record.can_close ? <Button type="link" danger onClick={() => handleClose(record)}>关闭</Button> : null}
          {record.can_delete ? (
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  const appColumns = [
    { title: '学生', dataIndex: 'student_name', key: 'student_name' },
    { title: '学号', dataIndex: 'student_id', key: 'student_id' },
    { title: '申请说明', dataIndex: 'statement', key: 'statement', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppStatus) => <Tag>{status}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApplicationItem) =>
        record.status === 'pending' ? (
          <Space>
            <Button size="small" type="primary" onClick={() => handleApprove(record.id)}>通过</Button>
            <Button size="small" danger onClick={() => handleReject(record.id)}>拒绝</Button>
          </Space>
        ) : null,
    },
  ]

  return (
    <MainLayout>
      <PageHeader
        title="项目发布与管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentEvent(null)
              form.resetFields()
              setEditVisible(true)
            }}
          >
            新建草稿
          </Button>
        }
      />

      <ContentCard>
        <Tabs
          defaultActiveKey="published"
          items={[
            {
              key: 'published',
              label: '非草稿',
              children: <Table rowKey="id" loading={loading} dataSource={events.filter((e) => e.status !== 'draft')} columns={eventColumns} />,
            },
            {
              key: 'draft',
              label: '草稿',
              children: <Table rowKey="id" loading={loading} dataSource={events.filter((e) => e.status === 'draft')} columns={eventColumns} />,
            },
          ]}
        />
      </ContentCard>

      <Modal open={editVisible} onCancel={() => setEditVisible(false)} footer={null} title={currentEvent ? '编辑项目' : '创建项目'} width={760}>
        <AppForm form={form} onFinishAsync={handleCreateOrUpdate} layout="vertical">
          <AppForm.Item name="title" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </AppForm.Item>
          <AppForm.Item name="date_range" label="日期" rules={[{ required: true, message: '请选择时间' }]}>
            <RangePicker showTime />
          </AppForm.Item>
          <AppForm.Item name="location" label="地点" rules={[{ required: true, message: '请输入地点' }]}>
            <Input />
          </AppForm.Item>
          <AppForm.Item name="expected_participants" label="教师希望人数" rules={[{ required: true, message: '请输入人数' }]}>
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </AppForm.Item>
          <AppForm.Item name="description" label="简介" rules={[{ required: true, message: '请输入简介' }]}>
            <Input.TextArea rows={4} />
          </AppForm.Item>
          <AppForm.Item name="attachment_id" label="补充文件(≤20MB)">
            <UploadField />
          </AppForm.Item>
          <AppForm.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setEditVisible(false)}>取消</Button>
            </Space>
          </AppForm.Item>
        </AppForm>
      </Modal>

      <Modal open={appsVisible} onCancel={() => setAppsVisible(false)} footer={null} title={`申请管理 - ${currentEvent?.title || ''}`} width={900}>
        <Table rowKey="id" dataSource={applications} columns={appColumns} pagination={false} />
      </Modal>
    </MainLayout>
  )
}

export default ProjectManagement
