import { useEffect, useState } from 'react'
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Tag, Upload } from 'antd'
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { fetchAllPages } from '@/utils/apiFetch'
import { handleApiError } from '@/utils/handleApiError'

interface Template {
  key: string
  name: string
  description: string
  is_active: boolean
  file: { id: string; original_name: string; file_url: string; file_size: number }
}
interface TemplateValues { key: string; name: string; description?: string; file_id: string }

export function TemplateLibrary({ admin = false }: { admin?: boolean }) {
  const [items, setItems] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form] = Form.useForm<TemplateValues>()
  const base = admin ? '/api/file/admin/templates/' : '/api/file/templates/'

  const load = async () => {
    setLoading(true)
    try { setItems(await fetchAllPages<Template>(base)) }
    catch { message.error('获取资料列表失败') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const save = async (values: TemplateValues) => {
    setSaving(true)
    try {
      const res = await fetch(editing ? `${base}${editing.key}/` : base, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) { handleApiError(data, res.status); return }
      message.success('资料已发布')
      setOpen(false)
      await load()
    } catch { message.error('保存失败，请重试') }
    finally { setSaving(false) }
  }
  const disable = async (item: Template) => {
    try {
      const res = await fetch(`${base}${item.key}/`, { method: 'DELETE' })
      if (!res.ok) { handleApiError(await res.json(), res.status); return }
      message.success('资料已停用')
      await load()
    } catch { message.error('停用失败') }
  }
  return <>
    {admin && <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => {
      setEditing(null); form.resetFields(); setOpen(true)
    }}>发布资料</Button>}
    <Table<Template> rowKey="key" loading={loading} dataSource={items} scroll={{ x: 640 }}
      locale={{ emptyText: '暂无资料，管理员发布后将显示在这里' }}
      columns={[
        { title: '名称', dataIndex: 'name' },
        { title: '说明', dataIndex: 'description' },
        { title: '文件', render: (_, item) => item.file.original_name },
        ...(admin ? [{ title: '状态', render: (_: unknown, item: Template) => <Tag color={item.is_active ? 'green' : 'default'}>{item.is_active ? '已发布' : '已停用'}</Tag> }] : []),
        { title: '操作', render: (_, item) => <Space wrap>
          <Button type="link" icon={<DownloadOutlined />} href={item.file.file_url} target="_blank" rel="noreferrer">下载</Button>
          {admin && <>
            <Button type="link" onClick={() => { setEditing(item); form.resetFields(); form.setFieldsValue({ ...item, file_id: item.file.id }); setOpen(true) }}>编辑/发布</Button>
            {item.is_active && <Popconfirm title="停用这份资料？" onConfirm={() => disable(item)}><Button type="link" danger>停用</Button></Popconfirm>}
          </>}
        </Space> },
      ]} />
    <Modal title={editing ? '编辑资料' : '发布资料'} open={open} confirmLoading={saving} closable={!uploading} maskClosable={!uploading} keyboard={!uploading} cancelButtonProps={{ disabled: uploading }} onOk={() => { if (!uploading) form.submit() }} okButtonProps={{ disabled: uploading }} onCancel={() => setOpen(false)}>
      <Form<TemplateValues> form={form} layout="vertical" onFinish={save}>
        <Form.Item name="key" label="资料标识" rules={[{ required: true }, { pattern: /^[a-zA-Z0-9_-]+$/, message: '仅支持字母、数字、下划线和短横线' }]}><Input disabled={!!editing} maxLength={50} placeholder="例如 resume-template" /></Form.Item>
        <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input maxLength={100} /></Form.Item>
        <Form.Item name="description" label="说明"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="file_id" rules={[{ required: true, message: '请上传资料文件' }]} hidden><Input /></Form.Item>
        <Upload maxCount={1} accept=".pdf,.doc,.docx,.zip" beforeUpload={file => {
          if (!/\.(pdf|docx?|zip)$/i.test(file.name) || file.size > 20 * 1024 * 1024) {
            message.error('请上传 20MB 以内的 PDF、Word 或 ZIP 文件'); return Upload.LIST_IGNORE
          }
          return true
        }} customRequest={async ({ file, onSuccess, onError }) => {
          setUploading(true)
          try {
            const body = new FormData(); body.append('file', file as File); body.append('category', 'template')
            const res = await fetch('/api/file/uploads/', { method: 'POST', body })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || '上传失败')
            form.setFieldValue('file_id', data.id); onSuccess?.(data)
          } catch (error) { onError?.(error as Error); message.error('上传失败') }
          finally { setUploading(false) }
        }}><Button loading={uploading} icon={<UploadOutlined />}>{editing ? '替换文件' : '上传文件'}</Button></Upload>
        {editing && <p>当前文件：{editing.file.original_name}</p>}
      </Form>
    </Modal>
  </>
}
