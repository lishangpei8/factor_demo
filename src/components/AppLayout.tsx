import React, { useState } from 'react';
import { Layout, Menu, Badge, Typography, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  MonitorOutlined,
  PlusCircleOutlined,
  BellOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '总览面板' },
  { key: '/factors', icon: <MonitorOutlined />, label: '因子监控' },
  { key: '/register', icon: <PlusCircleOutlined />, label: '因子注册' },
  { key: '/notifications', icon: <BellOutlined />, label: '通知中心' },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotificationStore((s) => s.notifications);
  const pendingCount = notifications.filter((n) => n.status === 'pending').length;

  const selectedKey = location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
        }}
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <BarChartOutlined style={{ fontSize: 24, color: '#1677ff', marginRight: collapsed ? 0 : 10 }} />
          {!collapsed && (
            <Text strong style={{ color: '#fff', fontSize: 18, letterSpacing: 1 }}>
              FactorLens
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 15, color: '#666' }}>
            蒙玺投资因子监控平台
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={pendingCount} size="small">
              <BellOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#555' }}
                onClick={() => navigate('/notifications')}
              />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: '个人信息', icon: <UserOutlined /> },
                  { key: 'logout', label: '退出登录' },
                ],
              }}
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <Text style={{ color: '#333' }}>基金经理</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 0,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
