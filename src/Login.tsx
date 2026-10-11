import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, message, Segmented } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined, SolutionOutlined } from '@ant-design/icons';
import { AppForm, Input, Button } from '@/components/ui';
import { useState } from 'react';
import { handleApiError } from '@/utils/handleApiError';
import './Login.css';

const { Title, Text } = Typography;

interface LoginValues {
  student_id: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleLogin = async (values: LoginValues) => {
    try {
      const response = await fetch('/api/user/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: values.student_id,
          password: values.password,
          remember_me: false,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/profile');
      } else {
        handleApiError(data, response.status)
        throw new Error(data.detail || 'Login failed');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
         message.error('网络错误，请检查后端是否启动');
      }
      throw error;
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card" variant="borderless">
          <div className="login-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img src="/Ziqianglogo.jpg" alt="Logo" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <Title level={2} style={{ marginBottom: 8 }}>自强科协</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>欢迎回来，请登录您的账户</Text>
          </div>

          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Segmented
              options={[
                { label: '我是学生', value: 'student', icon: <TeamOutlined /> },
                { label: '我是教师', value: 'teacher', icon: <SolutionOutlined /> },
              ]}
              value={role}
              onChange={(value) => setRole(value as 'student' | 'teacher')}
              block
              size="large"
            />
          </div>

          <AppForm<LoginValues>
              onFinishAsync={handleLogin}
              successMessage="登录成功"
              size="large"
          >
              <AppForm.Item
                  name="student_id"
                  rules={[{ required: true, message: role === 'student' ? '请输入学号' : '请输入工号' }]}
              >
                  <Input
                      prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                      placeholder={role === 'student' ? "学号 (例如: 2023001)" : "工号"}
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
                <Text type="secondary">还没有账号？ </Text>
                <Link to="/register">立即注册</Link>
              </div>
          </AppForm>
        </Card>

        <div className="login-footer">
           <Text type="secondary" style={{ fontSize: 12 }}>© {new Date().getFullYear()} Ziqiang Studio. All rights reserved.</Text>
        </div>
      </div>
    </div>
  );
}

export default Login;
