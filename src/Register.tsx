import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, message, Segmented, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined, SolutionOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { AppForm, Input, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import './Login.css';

const { Title, Text } = Typography;

interface RegisterValues {
  student_id: string;
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  code: string;
  phone?: string;
  wechat_id?: string;
  class_name?: string;
}

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [countdown, setCountdown] = useState(0);
  const [loadingCode, setLoadingCode] = useState(false);
  const [form] = AppForm.useForm();

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const sendVerificationCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error('请先输入邮箱');
        return;
      }

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        message.error('请输入有效的邮箱地址');
        return;
      }

      setLoadingCode(true);
      const response = await fetch('/api/user/send-register-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('验证码已发送，请查收邮件');
        setCountdown(60);
      } else {
        // 处理错误信息，如果是对象形式则取第一个错误
        const errorMsg = typeof data.email === 'object' ? data.email[0] : (data.detail || '发送失败');
        message.error(errorMsg);
      }
    } catch {
      message.error('网络错误，无法发送验证码');
    } finally {
      setLoadingCode(false);
    }
  };

  const handleRegister = async (values: RegisterValues) => {
    try {
      if (values.password !== values.password_confirm) {
        message.error('两次输入的密码不一致');
        return;
      }

      const payload = {
        ...values,
        role,
      };

      const response = await fetch('/api/user/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // AppForm handle success message
        // navigate to login after short delay or immediately
        setTimeout(() => navigate('/'), 1000);
      } else {
        const errorMsg = data.non_field_errors ? data.non_field_errors[0] : (data.detail || '注册失败，请检查输入');
        // 如果有具体的字段错误，也可以在这里处理，Ant Design Form 会自动处理字段名匹配的错误
        // 这里主要处理 non_field_errors
        message.error(errorMsg);
        throw new Error(errorMsg);
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
      <div className="login-container" style={{ maxWidth: 520 }}>
        <Card className="login-card" variant="borderless">
          <div className="login-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img src="/Ziqianglogo.jpg" alt="Logo" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <Title level={2} style={{ marginBottom: 8 }}>注册账户</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>加入自强科协</Text>
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

          <AppForm<RegisterValues>
              form={form}
              onFinishAsync={handleRegister}
              successMessage="注册成功，即将跳转登录"
              size="large"
              scrollToFirstError
          >
              <Row gutter={16}>
                <Col span={12}>
                  <AppForm.Item
                      name="student_id"
                      rules={[{ required: true, message: role === 'student' ? '请输入学号' : '请输入工号' }]}
                  >
                      <Input
                          prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                          placeholder={role === 'student' ? "学号" : "工号"}
                      />
                  </AppForm.Item>
                </Col>
                <Col span={12}>
                  <AppForm.Item
                      name="name"
                      rules={[{ required: true, message: '请输入姓名' }]}
                  >
                      <Input
                          prefix={<SolutionOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                          placeholder="姓名"
                      />
                  </AppForm.Item>
                </Col>
              </Row>

              <AppForm.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
              >
                  <Input
                      prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                      placeholder="邮箱"
                  />
              </AppForm.Item>

              <Row gutter={8}>
                <Col flex="auto">
                  <AppForm.Item
                      name="code"
                      rules={[{ required: true, message: '请输入验证码' }]}
                  >
                      <Input
                          prefix={<SafetyCertificateOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                          placeholder="验证码"
                      />
                  </AppForm.Item>
                </Col>
                <Col>
                  <Button
                    onClick={sendVerificationCode}
                    disabled={countdown > 0 || loadingCode}
                    loading={loadingCode}
                    style={{ width: 120 }}
                  >
                    {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                  </Button>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <AppForm.Item
                      name="password"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, message: '密码至少6位' }
                      ]}
                  >
                      <Input.Password
                          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                          placeholder="密码"
                      />
                  </AppForm.Item>
                </Col>
                <Col span={12}>
                  <AppForm.Item
                      name="password_confirm"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: '请确认密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次密码不一致'));
                          },
                        }),
                      ]}
                  >
                      <Input.Password
                          prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                          placeholder="确认密码"
                      />
                  </AppForm.Item>
                </Col>
              </Row>

              <AppForm.Item
                  name="phone"
              >
                  <Input
                      prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                      placeholder="手机号 (选填)"
                  />
              </AppForm.Item>

              <AppForm.Item style={{ marginBottom: 12, marginTop: 16 }}>
                  <Button type="primary" htmlType="submit" block size="large" style={{ height: 48, fontSize: 16 }}>
                      注 册
                  </Button>
              </AppForm.Item>

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">已有账号？ </Text>
                <Link to="/">立即登录</Link>
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

export default Register;
