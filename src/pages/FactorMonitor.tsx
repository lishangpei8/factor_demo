import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Select, Tag, Button, Space, Typography, Card, App, Tooltip,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, BellOutlined, EyeOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useFactorStore } from '@/stores/factorStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import type { Factor, FactorType, FactorStatus } from '@/types/factor';
import type { TableProps } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_CONFIG: Record<FactorStatus, { color: string; label: string }> = {
  normal: { color: 'success', label: '正常' },
  warning: { color: 'warning', label: '预警' },
  critical: { color: 'error', label: '异常' },
  inactive: { color: 'default', label: '停用' },
};

const FACTOR_TYPES: FactorType[] = ['Alpha', 'Size', 'Liquidity', 'Value', 'Momentum', 'Quality', 'Volatility', 'Growth', 'Dividend', 'Reversal'];

const FactorMonitor: React.FC = () => {
  const { factors, total, loading, params, setParams, fetchFactors } = useFactorStore();
  const { sendNotification } = useNotificationStore();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(params.search || '');
  const { message: messageApi, modal } = App.useApp();

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors, params]);

  const handleSearch = useCallback(() => {
    setParams({ search: searchValue, page: 1 });
  }, [searchValue, setParams]);

  const handleNotify = (factor: Factor) => {
    modal.confirm({
      title: '发送异常通知',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确认向研究员 <strong>{factor.researcher}</strong> 发送通知？</p>
          <p style={{ color: '#666', fontSize: 13 }}>
            因子：{factor.name} ({factor.id})<br />
            邮箱：{factor.researcherEmail}<br />
            当前年化收益：{factor.metrics.annualReturn.toFixed(2)}%<br />
            当前IC：{factor.metrics.ic.toFixed(3)}
          </p>
        </div>
      ),
      okText: '确认发送',
      cancelText: '取消',
      onOk: async () => {
        const success = await sendNotification({
          factorId: factor.id,
          factorName: factor.name,
          researcher: factor.researcher,
          researcherEmail: factor.researcherEmail,
          type: factor.status === 'critical' ? 'critical' : 'warning',
          message: `因子 ${factor.name} 表现异常，年化收益 ${factor.metrics.annualReturn.toFixed(2)}%，IC ${factor.metrics.ic.toFixed(3)}，最大回撤 ${factor.metrics.maxDrawdown.toFixed(2)}%，请及时调整策略参数。`,
        });
        if (success) {
          messageApi.success(`已成功发送通知给 ${factor.researcher}`);
        } else {
          messageApi.error('通知发送失败');
        }
      },
    });
  };

  const handleTableChange: TableProps<Factor>['onChange'] = (pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setParams({
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 20,
      sortField: s?.field ? String(s.field).replace(',', '.') : '',
      sortOrder: s?.order || undefined,
    });
  };

  const columns: TableProps<Factor>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 85,
      fixed: 'left',
      render: (id: string) => (
        <a onClick={() => navigate(`/factors/${id}`)} style={{ fontFamily: 'monospace' }}>{id}</a>
      ),
    },
    {
      title: '因子名称',
      dataIndex: 'name',
      key: 'name',
      width: 170,
      fixed: 'left',
      ellipsis: { showTitle: false },
      render: (name: string, record: Factor) => (
        <Tooltip title={record.description}>
          <a onClick={() => navigate(`/factors/${record.id}`)}>{name}</a>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: FactorStatus) => (
        <Tag color={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</Tag>
      ),
    },
    {
      title: 'IC',
      dataIndex: ['metrics', 'ic'],
      key: 'metrics.ic',
      width: 80,
      sorter: true,
      render: (v: number) => (
        <Text style={{ color: v >= 0.03 ? '#52c41a' : v < 0 ? '#ff4d4f' : '#faad14', fontFamily: 'monospace' }}>
          {v.toFixed(3)}
        </Text>
      ),
    },
    {
      title: 'ICIR',
      dataIndex: ['metrics', 'icir'],
      key: 'metrics.icir',
      width: 80,
      sorter: true,
      render: (v: number) => <span style={{ fontFamily: 'monospace' }}>{v.toFixed(2)}</span>,
    },
    {
      title: '年化收益',
      dataIndex: ['metrics', 'annualReturn'],
      key: 'metrics.annualReturn',
      width: 100,
      sorter: true,
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600, fontFamily: 'monospace' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </Text>
      ),
    },
    {
      title: '夏普比率',
      dataIndex: ['metrics', 'sharpeRatio'],
      key: 'metrics.sharpeRatio',
      width: 95,
      sorter: true,
      render: (v: number) => <span style={{ fontFamily: 'monospace' }}>{v.toFixed(2)}</span>,
    },
    {
      title: '最大回撤',
      dataIndex: ['metrics', 'maxDrawdown'],
      key: 'metrics.maxDrawdown',
      width: 100,
      sorter: true,
      render: (v: number) => (
        <Text style={{ color: '#ff4d4f', fontFamily: 'monospace' }}>{v.toFixed(2)}%</Text>
      ),
    },
    {
      title: '换手率',
      dataIndex: ['metrics', 'turnover'],
      key: 'metrics.turnover',
      width: 90,
      sorter: true,
      render: (v: number) => <span style={{ fontFamily: 'monospace' }}>{v.toFixed(1)}%</span>,
    },
    {
      title: '胜率',
      dataIndex: ['metrics', 'winRate'],
      key: 'metrics.winRate',
      width: 80,
      sorter: true,
      render: (v: number) => <span style={{ fontFamily: 'monospace' }}>{v.toFixed(1)}%</span>,
    },
    {
      title: '研究员',
      dataIndex: 'researcher',
      key: 'researcher',
      width: 90,
    },
    {
      title: '更新日期',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 110,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: Factor) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/factors/${record.id}`)} />
          </Tooltip>
          <Tooltip title="发送通知">
            <Button
              type="link"
              size="small"
              icon={<BellOutlined />}
              danger={record.status === 'critical'}
              style={record.status === 'warning' ? { color: '#faad14' } : undefined}
              onClick={() => handleNotify(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>因子监控</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap size={[12, 12]} style={{ width: '100%' }}>
          <Input
            placeholder="搜索因子名称、ID、研究员..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="因子类型"
            value={params.type || undefined}
            onChange={(v) => setParams({ type: v || '', page: 1 })}
            allowClear
            style={{ width: 140 }}
          >
            {FACTOR_TYPES.map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
          <Select
            placeholder="状态筛选"
            value={params.status || undefined}
            onChange={(v) => setParams({ status: v || '', page: 1 })}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="normal">正常</Option>
            <Option value="warning">预警</Option>
            <Option value="critical">异常</Option>
            <Option value="inactive">停用</Option>
          </Select>
          <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchValue('');
              setParams({ search: '', type: '', status: '', page: 1, sortField: '', sortOrder: undefined });
            }}
          >
            重置
          </Button>
          <Text type="secondary" style={{ marginLeft: 'auto' }}>
            共 {total} 个因子
          </Text>
        </Space>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table<Factor>
          columns={columns}
          dataSource={factors}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 1400 }}
          onChange={handleTableChange}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (t) => `共 ${t} 条`,
          }}
          rowClassName={(record) =>
            record.status === 'critical' ? 'row-critical' : record.status === 'warning' ? 'row-warning' : ''
          }
        />
      </Card>
    </div>
  );
};

export default FactorMonitor;
