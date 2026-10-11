import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Button, Table } from '@/components/ui'
import { Space, Tag, Select, Input as AntInput, message, Popconfirm } from 'antd'
import { DeleteOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { handleApiError } from '@/utils/handleApiError'

interface FileItem {
  id: string
  original_name: string
  category: string
  file_url: string
  uploaded_by: number | null
  uploaded_by_name: string
  file_size: number
  created_at: string
}

const categoryColors: Record<string, string> = {
  event_attachment: 'blue',
  resume: 'green',
  other: 'default',
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray((payload as Record<string, unknown>).results)) {
    return (payload as Record<string, unknown>).results as T[]
  }
  return []
}

const AdminFiles: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [searchText, setSearchText] = useState('')

  const fetchFiles = async (requestPage = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set('category', categoryFilter)
      if (searchText) params.set('search', searchText)
      params.set('page', String(requestPage))
      params.set('page_size', '20')
      const res = await fetch(`/api/admin/files/?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      const data = await res.json()
      setFiles(normalizeList<FileItem>(data))
      setTotal(data.count || 0)
    } catch {
      message.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter])

  const handleSearch = () => {
    setPage(1)
    fetchFiles(1)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/files/${id}/`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        throw new Error()
      }
      message.success('删除成功')
      fetchFiles()
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: '文件名', dataIndex: 'original_name', key: 'original_name', ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (c: string) => <Tag color={categoryColors[c] || 'default'}>{c}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (v: number) => formatSize(v || 0),
    },
    {
      title: '上传者',
      dataIndex: 'uploaded_by_name',
      key: 'uploaded_by_name',
      width: 120,
      render: (v: string) => v || '-',
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: FileItem) => (
        <Space>
          <a href={record.file_url} target="_blank" rel="noreferrer">
            <Button type="link" icon={<DownloadOutlined />}>下载</Button>
          </a>
          <Popconfirm
            title="确定删除此文件？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <PageHeader title="文件管理" />

      <ContentCard>
        <Space style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="分类筛选"
            style={{ width: 140 }}
            value={categoryFilter}
            onChange={(val) => { setCategoryFilter(val); setPage(1) }}
            options={[
              { label: '项目附件', value: 'event_attachment' },
              { label: '简历', value: 'resume' },
              { label: '其他', value: 'other' },
            ]}
          />
          <AntInput
            placeholder="搜索文件名"
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
          dataSource={files}
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
    </AdminLayout>
  )
}

export default AdminFiles
