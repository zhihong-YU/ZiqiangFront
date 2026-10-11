import { useNavigate, Link } from 'react-router-dom'
import { Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { AppForm, Input, Button } from '@/components/ui'
import { handleApiError } from '@/utils/handleApiError'
import '../../Login.css'

const { Title, Text } = Typography

interface AdminLoginValues {
  student_id: string
  password: string
}

function AdminLogin() {
  const navigate = useNavigate()

  const handleLogin = async (values: AdminLoginValues) => {
    try {
      const response = await fetch('/api/admin/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: values.student_id,
          password: values.password,
          remember_me: false
        }),
      })

      const data = await response.json()

      if (response.ok) {
        navigate('/admin')
      } else {
        handleApiError(data, response.status)
        throw new Error(data.detail || 'Admin login failed')
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        message.error('网络错误，请检查后端是否启动')
      }
      throw error
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card" variant="borderless">
          <div className="login-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4d4f 0%, #eb2f96 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SafetyCertificateOutlined style={{ fontSize: 40, color: '#fff' }} />
              </div>
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>管理员登录</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>自强科协 - 后台管理系统</Text>
          </div>

          <AppForm<AdminLoginValues>
            onFinishAsync={handleLogin}
            successMessage="登录成功"
            size="large"
          >
            <AppForm.Item
              name="student_id"
              rules={[{ required: true, message: '请输入管理员账号' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="管理员账号"
              />
            </AppForm.Item>

            <AppForm.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="密码"
              />
            </AppForm.Item>

            <AppForm.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" block size="large" style={{ height: 48, fontSize: 16 }}>
                登 录
              </Button>
            </AppForm.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                返回 <Link to="/">用户登录</Link>
              </Text>
            </div>
          </AppForm>
        </Card>

        <div className="login-footer">
          <Text type="secondary" style={{ fontSize: 12 }}>© {new Date().getFullYear()} Ziqiang Studio. All rights reserved.</Text>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
