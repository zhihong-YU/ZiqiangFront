import { fetchAllPages } from '@/utils/apiFetch'
import React, { useEffect, useState } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { AppForm, Button, Input, Modal, Table } from '@/components/ui'
import { Descriptions, Select, Space, Tag, Upload, message } from 'antd'
import { CalendarOutlined, PushpinOutlined, SearchOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'

type EventStatus = 'draft' | 'published' | 'ongoing' | 'closed'

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
}


const statusText: Record<EventStatus, string> = {
  draft: '草稿',
  published: '已发布',
  ongoing: '进行中',
  closed: '已关闭',
}

const statusColor: Record<EventStatus, string> = {
  draft: 'orange',
  published: 'green',
  ongoing: 'blue',
  closed: 'default',
}

const ResumeUploader = ({ value, onChange, uploading, onUploadingChange }: {
  value?: string; onChange?: (value: string) => void;
  uploading: boolean; onUploadingChange: (uploading: boolean) => void;
}) => (
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
        message.error('简历文件不能超过 20MB')
        return Upload.LIST_IGNORE
      }
      return true
    }}
    customRequest={async ({ file, onSuccess, onError }) => {
      onUploadingChange(true)
      try {
        const formData = new FormData()
        formData.append('file', file as File)
        formData.append('category', 'application_resume')
        const res = await fetch('/api/file/uploads/', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.detail || '上传失败')
        onChange?.(data.id)
        onSuccess?.(data)
        message.success('简历上传成功')
      } catch (e) {
        onError?.(e as Error)
        message.error('简历上传失败')
      } finally {
        onUploadingChange(false)
      }
    }}
  >
    <Button loading={uploading} icon={<UploadOutlined />}>{value ? '重新上传简历' : '上传简历(可选)'}</Button>
  </Upload>
)

const ProjectMarket: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [applyVisible, setApplyVisible] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null)
  const [teacherKeyword, setTeacherKeyword] = useState('')
  const [status, setStatus] = useState<EventStatus | undefined>()
  const [form] = AppForm.useForm()

  const fetchPublicEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (teacherKeyword) params.set('teacher_name', teacherKeyword)
      if (status) params.set('status', status)
      setEvents(await fetchAllPages<EventItem>(`/api/event/events/?${params.toString()}`))
    } catch {
      message.error('获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchEventDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/event/events/${id}/`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      setCurrentEvent(data)
      setDetailVisible(true)
    } catch {
      message.error('获取项目详情失败')
    }
  }

  useEffect(() => {
    fetchPublicEvents()
    // Initial load; filters are applied with the query button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApply = async (values: { statement?: string; resume_id?: string }) => {
    if (!currentEvent || resumeUploading) return
    try {
      const payload = {
        statement: values.statement,
        resume_id: values.resume_id || undefined,
      }
      const res = await fetch(`/api/event/events/${currentEvent.id}/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || '申请失败')
      message.success('申请成功')
      setApplyVisible(false)
      form.resetFields()
      fetchPublicEvents()
    } catch (e) {
      message.error((e as Error).message || '申请失败')
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: EventItem) => <a onClick={() => fetchEventDetail(record.id)}>{text}</a>,
    },
    {
      title: '指导教师',
      dataIndex: 'teacher_name',
      key: 'teacher_name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: EventStatus) => <Tag color={statusColor[s]}>{statusText[s]}</Tag>,
    },
    {
      title: '人数',
      key: 'participants',
      render: (_: unknown, record: EventItem) => `${record.current_participants}/${record.expected_participants}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EventItem) => {
        // 项目处于“已发布”或“进行中”状态 且 未满员 才可申请
        const canApply = (record.status === 'published' || record.status === 'ongoing') && record.current_participants < record.expected_participants;
        return (
          <Button
            type="primary"
            size="small"
            disabled={!canApply}
            onClick={() => {
              setCurrentEvent(record)
              setApplyVisible(true)
            }}
          >
            申请
          </Button>
        )
      },
    },
  ]

  return (
    <MainLayout>
      <PageHeader title="项目广场" />
      <ContentCard>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="按教师姓名筛选"
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
            onChange={(e) => setTeacherKeyword(e.target.value)}
            onPressEnter={fetchPublicEvents}
          />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 140 }}
            onChange={(v) => setStatus(v)}
            options={[
              { label: '已发布', value: 'published' },
              { label: '进行中', value: 'ongoing' },
              { label: '已关闭', value: 'closed' },
            ]}
          />
          <Button type="primary" onClick={fetchPublicEvents}>查询</Button>
        </Space>
        <Table rowKey="id" loading={loading} dataSource={events} columns={columns} />
      </ContentCard>

      <Modal
        title="项目详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={760}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button
            key="apply"
            type="primary"
            disabled={(currentEvent?.status !== 'published' && currentEvent?.status !== 'ongoing') || (currentEvent && currentEvent.current_participants >= currentEvent.expected_participants)}
            onClick={() => {
              setDetailVisible(false)
              setApplyVisible(true)
            }}
          >
            立即申请
          </Button>,
        ]}
      >
        {currentEvent ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="名称">{currentEvent.title}</Descriptions.Item>
            <Descriptions.Item label="教师">{currentEvent.teacher_name}</Descriptions.Item>
            <Descriptions.Item label="日期">
              <Space>
                <CalendarOutlined />
                {currentEvent.start_time} ~ {currentEvent.end_time}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="地点">
              <Space>
                <PushpinOutlined />
                {currentEvent.location}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="简介">{currentEvent.description}</Descriptions.Item>
            <Descriptions.Item label="附件">
              {currentEvent.attachment?.file_url ? (
                <a href={currentEvent.attachment.file_url} target="_blank" rel="noreferrer">{currentEvent.attachment.original_name || '下载附件'}</a>
              ) : '无'}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal title={`申请项目 - ${currentEvent?.title || ''}`} open={applyVisible} closable={!resumeUploading} maskClosable={!resumeUploading} keyboard={!resumeUploading} onCancel={() => setApplyVisible(false)} footer={null}>
        <AppForm form={form} onFinishAsync={handleApply} layout="vertical">
          <AppForm.Item name="statement" label="申请陈述" rules={[{ required: true, message: '请填写申请陈述' }]}>
            <Input.TextArea rows={4} maxLength={500} showCount />
          </AppForm.Item>
          <AppForm.Item name="resume_id" label="简历(可选)">
            <ResumeUploader uploading={resumeUploading} onUploadingChange={setResumeUploading} />
          </AppForm.Item>
          <AppForm.Item>
            <Space style={{ float: 'right' }}>
              <Button disabled={resumeUploading} onClick={() => setApplyVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" disabled={resumeUploading}>提交申请</Button>
            </Space>
          </AppForm.Item>
        </AppForm>
      </Modal>
    </MainLayout>
  )
}

export default ProjectMarket
