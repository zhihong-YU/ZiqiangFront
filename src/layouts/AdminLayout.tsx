import { Layout, Menu, theme, Dropdown, MenuProps, Avatar } from 'antd'
import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileSearchOutlined,
  FileOutlined,
  AppstoreAddOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/me/profile/')
      .then(res => res.json())
      .then(data => {
        if (data.avatar_url) setAvatarUrl(data.avatar_url)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout/', { method: 'POST' })
      navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }
  }

  const userMenu: MenuProps = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '管理仪表盘',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/events',
      icon: <AppstoreAddOutlined />,
      label: '项目管理',
      onClick: () => navigate('/admin/events'),
    },
    {
      key: '/admin/applications',
      icon: <FileSearchOutlined />,
      label: '申请管理',
      onClick: () => navigate('/admin/applications'),
    },
    {
      key: '/admin/files',
      icon: <FileOutlined />,
      label: '文件管理',
      onClick: () => navigate('/admin/files'),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '0 24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            marginRight: 40,
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={() => navigate('/admin')}
        >
          <SafetyCertificateOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          <span>后台管理</span>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              minWidth: 0,
            }}
          />

          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
              borderRadius: 8,
            }}>
              <Avatar
                size={32}
                src={avatarUrl || undefined}
                icon={!avatarUrl ? <UserOutlined /> : undefined}
                style={!avatarUrl ? { backgroundColor: '#ff4d4f' } : {}}
              />
              <span style={{ fontSize: 14, fontWeight: 500 }}>管理员</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: '0 24px', marginTop: 8 }}>
        <div style={{
          padding: 24,
          minHeight: 280,
          background: 'transparent',
        }}>
          {children ? children : <Outlet />}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', color: '#999', background: 'transparent' }}>
        自强科协 - 后台管理系统 ©{new Date().getFullYear()} Created by Ziqiang Studio
      </Footer>
    </Layout>
  )
}
