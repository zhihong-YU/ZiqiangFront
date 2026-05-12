import { Layout, Menu, theme, Avatar, Dropdown, MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  BookOutlined, 
  LogoutOutlined,
  AppstoreAddOutlined,
  SearchOutlined,
  FileDoneOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  theme.useToken()
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me/profile/')
        .then(res => res.json())
        .then(data => {
            if (data.role) setRole(data.role);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
        })
        .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout/', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    ...(role === 'teacher' ? [{
        key: '/projects/manage',
        icon: <AppstoreAddOutlined />,
        label: '项目管理',
        onClick: () => navigate('/projects/manage'),
    }] : [
      {
        key: '/projects/market',
        icon: <SearchOutlined />,
        label: '项目广场',
        onClick: () => navigate('/projects/market'),
      },
      {
        key: '/projects/applications',
        icon: <FileDoneOutlined />,
        label: '我的申请',
        onClick: () => navigate('/projects/applications'),
      }
    ]),
    {
      key: '/knowledge',
      icon: <BookOutlined />,
      label: '知识库',
      onClick: () => navigate('/knowledge'),
    },
  ];

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
          className="logo" 
          style={{ 
            marginRight: 40, 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#333',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => navigate('/profile')}
        >
          <img src="/Ziqianglogo.jpg" alt="Logo" style={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }} />
          自强科协
        </div>
        
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            flex: 1, 
            minWidth: 0, 
            borderBottom: 'none', 
            background: 'transparent',
            lineHeight: '64px'
          }}
        />

        <div style={{ marginLeft: 'auto' }}>
          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar src={avatarUrl || undefined} icon={!avatarUrl ? <UserOutlined /> : undefined} style={{ backgroundColor: '#1677ff' }} />
              <span style={{ color: '#666', fontSize: '14px' }}>我的账户</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ padding: '24px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ 
          minHeight: 280, 
          background: 'transparent',
        }}>
          {children ? children : <Outlet />}
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', color: '#999', background: 'transparent' }}>
        自强科协平台 ©{new Date().getFullYear()} Created by Ziqiang Studio
      </Footer>
    </Layout>
  );
};
