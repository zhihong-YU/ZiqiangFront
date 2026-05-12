import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { ContentCard } from '@/components/common/ContentCard';
import { AppForm, Input, Button } from '@/components/ui';
import { Tabs, Descriptions, Tag, message, Modal, Skeleton, Avatar, Upload } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined, SafetyCertificateOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { handleApiError } from '@/utils/handleApiError';

interface UserProfile {
  id: number;
  name: string;
  student_id: string;
  phone: string;
  wechat_id: string;
  bio: string;
  role: string;
  avatar: string | null;
  avatar_url: string | null;
  email?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  
  // Email Change State
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailForm] = AppForm.useForm();
  
  // Password Change State
  const [passwordForm] = AppForm.useForm();

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/me/profile/');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        const data = await response.json();
        handleApiError(data, response.status);
      }
    } catch (error) {
      console.error(error);
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    let timer: number;
    if (emailCountdown > 0) {
      timer = window.setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  const handleUpdateProfile = async (values: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/user/me/profile/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        return true;
      } else {
        const data = await response.json();
        handleApiError(data, response.status);
        throw new Error(data.detail || '更新失败');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSendEmailCode = async () => {
    try {
      const email = emailForm.getFieldValue('email');
      if (!email) {
        message.error('请输入新邮箱');
        return;
      }
      
      const response = await fetch('/api/user/send-change-email-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        message.success('验证码已发送');
        setEmailCountdown(60);
      } else {
        const data = await response.json();
        message.error(data.detail || '发送失败');
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const handleChangeEmail = async (values: any) => {
    try {
      const response = await fetch('/api/user/change-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('邮箱修改成功');
        setEmailModalVisible(false);
        emailForm.resetFields();
        fetchProfile(); // Refresh profile if it contains email
      } else {
        const data = await response.json();
        throw new Error(data.non_field_errors?.[0] || data.detail || '修改失败');
      }
    } catch (error: any) {
      message.error(error.message);
      throw error;
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      const response = await fetch('/api/user/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('密码修改成功');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        const data = await response.json();
        throw new Error(data.non_field_errors?.[0] || data.detail || '修改失败');
      }
    } catch (error: any) {
      message.error(error.message);
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await fetch('/api/user/me/avatar/', {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        handleApiError(err, res.status)
        message.error(err.detail || '头像上传失败')
        return
      }
      const data = await res.json()
      setProfile((prev) => prev ? { ...prev, avatar_url: data.avatar_url } : prev)
      message.success('头像更新成功')
    } catch {
      message.error('网络错误')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="个人中心" />
        <ContentCard><Skeleton active /></ContentCard>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="个人中心" />
      
      <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
        {/* 头像区域 */}
        <ContentCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar
              size={80}
              src={profile?.avatar_url || undefined}
              icon={!profile?.avatar_url ? <UserOutlined /> : undefined}
              style={{ flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{profile?.name}</div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
                {profile?.role === 'teacher' ? '教师' : '学生'} · {profile?.student_id}
              </div>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  if (file.size > 1024 * 1024) {
                    message.error('图片大小不能超过1MB')
                    return false
                  }
                  handleAvatarUpload(file)
                  return false
                }}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} size="small">更换头像</Button>
              </Upload>
            </div>
          </div>
        </ContentCard>

        {/* 基本信息展示 */}
        <ContentCard title="基本资料">
          <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
            <Descriptions.Item label="姓名">{profile?.name}</Descriptions.Item>
            <Descriptions.Item label={profile?.role === 'teacher' ? '工号' : '学号'}>{profile?.student_id}</Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag color={profile?.role === 'teacher' ? 'gold' : 'blue'}>
                {profile?.role === 'teacher' ? '教师' : '学生'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="手机号">{profile?.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="微信">{profile?.wechat_id || '-'}</Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="个人简介">
              <div style={{ whiteSpace: 'pre-wrap' }}>{profile?.bio || '-'}</div>
            </Descriptions.Item>
          </Descriptions>
        </ContentCard>

        {/* 资料修改与安全设置 */}
        <ContentCard>
          <Tabs
            items={[
              {
                key: 'profile',
                label: '编辑资料',
                children: (
                  <AppForm
                    initialValues={profile || undefined}
                    onFinishAsync={handleUpdateProfile}
                    successMessage="资料更新成功"
                    style={{ maxWidth: 600, marginTop: 16 }}
                  >
                    <AppForm.Item name="phone" label="手机号">
                      <Input prefix={<PhoneOutlined />} />
                    </AppForm.Item>
                    <AppForm.Item name="wechat_id" label="微信号">
                      <Input />
                    </AppForm.Item>
                    <AppForm.Item name="bio" label="个人简介">
                      <Input.TextArea rows={4} showCount maxLength={200} />
                    </AppForm.Item>
                    <AppForm.Item>
                      <Button type="primary" htmlType="submit">保存更改</Button>
                    </AppForm.Item>
                  </AppForm>
                ),
              },
              {
                key: 'security',
                label: '账号安全',
                children: (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 16 }}>登录密码</div>
                        <div style={{ color: '#888', fontSize: 14 }}>定期修改密码可以保护您的账号安全</div>
                      </div>
                      <Button onClick={() => setPasswordModalVisible(true)}>修改密码</Button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 16 }}>绑定邮箱</div>
                        <div style={{ color: '#888', fontSize: 14 }}>用于接收通知和找回密码</div>
                      </div>
                      <Button onClick={() => setEmailModalVisible(true)}>修改邮箱</Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </ContentCard>
      </div>

      {/* 修改邮箱 Modal */}
      <Modal
        title="修改邮箱"
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <AppForm
          form={emailForm}
          onFinishAsync={handleChangeEmail}
          layout="vertical"
        >
          <AppForm.Item
            name="email"
            label="新邮箱"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input prefix={<MailOutlined />} />
          </AppForm.Item>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <AppForm.Item
              name="code"
              label="验证码"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<SafetyCertificateOutlined />} />
            </AppForm.Item>
            <Button 
              style={{ marginTop: 30 }}
              onClick={handleSendEmailCode}
              disabled={emailCountdown > 0}
            >
              {emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码'}
            </Button>
          </div>

          <AppForm.Item>
            <Button type="primary" htmlType="submit" block>确认修改</Button>
          </AppForm.Item>
        </AppForm>
      </Modal>

      {/* 修改密码 Modal */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <AppForm
          form={passwordForm}
          onFinishAsync={handleChangePassword}
          layout="vertical"
        >
          <AppForm.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </AppForm.Item>
          
          <AppForm.Item
            name="new_password"
            label="新密码"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </AppForm.Item>

          <AppForm.Item
            name="new_password_confirm"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </AppForm.Item>

          <AppForm.Item>
            <Button type="primary" htmlType="submit" block>确认修改</Button>
          </AppForm.Item>
        </AppForm>
      </Modal>
    </MainLayout>
  );
};

export default Profile;
