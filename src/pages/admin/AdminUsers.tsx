import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ContentCard } from '@/components/common/ContentCard'
import { Button, Table, Modal, AppForm } from '@/components/ui'
import { Space, Tag, Select, Input as AntInput, message, Popconfirm, Avatar } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { handleApiError } from '@/utils/handleApiError'

interface UserItem {
  id: number
  username: string
  email: string
  name: string
  student_id: string
  class_name: string
  phone: string
  wechat_id: string
  bio: string
  role: string
  is_active: boolean
  date_joined: string
  events_count: number
  applications_count: number
  avatar: string | null
  avatar_url: string | null
}

const roleColors: Record<string, string> = {
  student: 'blue',
  teacher: 'gold',
  admin: 'red',
}
const roleNames: Record<string, string> = {
  student: '学生',
  teacher: '教师',
  admin: '管理员',
}

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray((payload as Record<string, unknown>).results)) {
    return (payload as Record<string, unknown>).results as T[]
  }
  return []
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [form] = AppForm.useForm<UserItem>()

  const fetchUsers = async (requestPage = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)
      if (searchText) params.set('search', searchText)
      params.set('page', String(requestPage))
      params.set('page_size', '20')
      const res = await fetch(`/api/admin/users/?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers(normalizeList<UserItem>(data))
      setTotal(data.count || 0)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter])

  const handleSearch = () => {
    setPage(1)
    fetchUsers(1)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/delete/`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      message.success('删除成功')
      fetchUsers()
    } catch {
      message.error('删除失败')
    }
  }

  const openCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openEdit = (user: UserItem) => {
    setEditingUser(user)
    form.resetFields()
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleSubmit = async (values: UserItem) => {
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}/update/`
        : '/api/admin/users/create/'
      const method = editingUser ? 'PUT' : 'POST'
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
      message.success(editingUser ? '更新成功' : '创建成功')
      setModalVisible(false)
      fetchUsers()
    } catch {
      // error handled
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '头像',
      dataIndex: 'avatar_url',
      key: 'avatar',
      width: 60,
      render: (url: string | null) => (
        <Avatar size={32} src={url || undefined} icon={!url ? <UserOutlined /> : undefined} />
      ),
    },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '学号/工号', dataIndex: 'student_id', key: 'student_id' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (r: string) => <Tag color={roleColors[r] || 'default'}>{roleNames[r] || r}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: UserItem) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <PageHeader title="用户管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建用户</Button>
      } />

      <ContentCard>
        <Space style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="角色筛选"
            style={{ width: 120 }}
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1) }}
            options={[
              { label: '学生', value: 'student' },
              { label: '教师', value: 'teacher' },
              { label: '管理员', value: 'admin' },
            ]}
          />
          <AntInput
            placeholder="搜索姓名/学号/邮箱"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
          />
          <Button onClick={handleSearch}>搜索</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
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

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnHidden
        width={600}
      >
        <AppForm form={form} onFinishAsync={handleSubmit} layout="vertical">
          <AppForm.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="username" label="用户名" rules={[{ required: !editingUser, message: '请输入用户名' }]}>
            <AntInput disabled={!!editingUser} />
          </AppForm.Item>
          <AppForm.Item name="student_id" label="学号/工号" rules={[{ required: true, message: '请输入学号/工号' }]}>
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="password" label={editingUser ? '新密码（留空不修改）' : '密码'} rules={[{ required: !editingUser, message: '请输入密码' }, { min: 6, message: '密码至少需要6个字符' }]}>
            <AntInput.Password />
          </AppForm.Item>
          <AppForm.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={[
              { label: '学生', value: 'student' },
              { label: '教师', value: 'teacher' },
              { label: '管理员', value: 'admin' },
            ]} />
          </AppForm.Item>
          <AppForm.Item name="class_name" label="班级/部门">
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="phone" label="手机号">
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="wechat_id" label="微信号">
            <AntInput />
          </AppForm.Item>
          <AppForm.Item name="bio" label="个人简介">
            <AntInput.TextArea rows={2} />
          </AppForm.Item>
          {editingUser && (
            <AppForm.Item name="is_active" label="启用">
              <Select options={[
                { label: '启用', value: true },
                { label: '禁用', value: false },
              ]} />
            </AppForm.Item>
          )}
        </AppForm>
      </Modal>
    </AdminLayout>
  )
}

export default AdminUsers
