import React, { useEffect } from 'react';
import { Card, Table, Tag, Typography, Badge, Empty, Space, Button, Statistic } from 'antd';
import { BellOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types/factor';

const { Title, Text } = Typography;

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: 'red', label: '严重' },
  warning: { color: 'orange', label: '预警' },
  info: { color: 'blue', label: '信息' },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <ClockCircleOutlined />, label: '待发送', color: 'gold' },
  sent: { icon: <SendOutlined />, label: '已发送', color: 'blue' },
  acknowledged: { icon: <CheckCircleOutlined />, label: '已确认', color: 'green' },
};

const NotificationCenter: React.FC = () => {
  const { notifications, loading, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '因子',
      dataIndex: 'factorName',
      key: 'factorName',
      width: 160,
      render: (name: string, record: Notification) => (
        <a onClick={() => navigate(`/factors/${record.factorId}`)}>{name}</a>
      ),
    },
    {
      title: '因子ID',
      dataIndex: 'factorId',
      key: 'factorId',
      width: 90,
      render: (id: string) => <Text style={{ fontFamily: 'monospace' }}>{id}</Text>,
    },
    {
      title: '通知内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '接收人',
      dataIndex: 'researcher',
      key: 'researcher',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'researcherEmail',
      key: 'researcherEmail',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
          <Badge color={cfg.color} text={
            <Space size={4}>
              {cfg.icon}
              <span>{cfg.label}</span>
            </Space>
          } />
        );
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => {
        try {
          return new Date(v).toLocaleString('zh-CN');
        } catch {
          return v;
        }
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          通知中心
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchNotifications}>刷新</Button>
      </Space>

      {/* Summary */}
      <Space size={16} style={{ marginBottom: 16 }}>
        <Card size="small" style={{ minWidth: 120 }}>
          <Statistic title="总通知" value={notifications.length} />
        </Card>
        <Card size="small" style={{ minWidth: 120 }}>
          <Statistic title="待发送" value={notifications.filter(n => n.status === 'pending').length} valueStyle={{ color: '#faad14' }} />
        </Card>
        <Card size="small" style={{ minWidth: 120 }}>
          <Statistic title="已发送" value={notifications.filter(n => n.status === 'sent').length} valueStyle={{ color: '#1677ff' }} />
        </Card>
        <Card size="small" style={{ minWidth: 120 }}>
          <Statistic title="已确认" value={notifications.filter(n => n.status === 'acknowledged').length} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Space>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="id"
          loading={loading}
          size="small"
          locale={{ emptyText: <Empty description="暂无通知记录" /> }}
          pagination={false}
        />
      </Card>
    </div>
  );
};


export default NotificationCenter;
