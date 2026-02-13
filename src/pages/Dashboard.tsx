import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin, Progress } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FundOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { useFactorStore } from '@/stores/factorStore';
import { useNavigate } from 'react-router-dom';
import type { Factor } from '@/types/factor';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  normal: '#52c41a',
  warning: '#faad14',
  critical: '#ff4d4f',
  inactive: '#d9d9d9',
};

const STATUS_LABEL: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  critical: '异常',
  inactive: '停用',
};

const TYPE_COLORS = ['#1677ff', '#13c2c2', '#722ed1', '#eb2f96', '#fa8c16', '#52c41a', '#2f54eb', '#fadb14', '#a0d911', '#f5222d'];

const Dashboard: React.FC = () => {
  const { dashboard, dashboardLoading, fetchDashboard } = useFactorStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (dashboardLoading || !dashboard) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  const anomalyColumns = [
    {
      title: '因子ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: string) => <a onClick={() => navigate(`/factors/${id}`)}>{id}</a>,
    },
    { title: '名称', dataIndex: 'name', key: 'name', width: 160, ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    {
      title: '年化收益',
      dataIndex: ['metrics', 'annualReturn'],
      key: 'return',
      width: 100,
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </Text>
      ),
    },
    {
      title: 'IC',
      dataIndex: ['metrics', 'ic'],
      key: 'ic',
      width: 80,
      render: (v: number) => v.toFixed(3),
    },
    { title: '研究员', dataIndex: 'researcher', key: 'researcher', width: 80 },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>总览面板</Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #1677ff' }}>
            <Statistic
              title="因子总数"
              value={dashboard.totalFactors}
              prefix={<FundOutlined style={{ color: '#1677ff' }} />}
              suffix="个"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>活跃 {dashboard.activeFactors} 个</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic
              title="平均年化收益"
              value={dashboard.avgReturn}
              precision={2}
              prefix={dashboard.avgReturn >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
              suffix="%"
              valueStyle={{ color: dashboard.avgReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>平均夏普 {dashboard.avgSharpe.toFixed(2)}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #faad14' }}>
            <Statistic
              title="预警因子"
              value={dashboard.warningFactors}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              suffix="个"
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={Math.round((dashboard.warningFactors / dashboard.totalFactors) * 100)}
                size="small"
                strokeColor="#faad14"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #ff4d4f' }}>
            <Statistic
              title="异常因子"
              value={dashboard.criticalFactors}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              suffix="个"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                健康率 {Math.round(((dashboard.totalFactors - dashboard.criticalFactors - dashboard.warningFactors) / dashboard.totalFactors) * 100)}%
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="因子类型分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.typeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="数量" radius={[4, 4, 0, 0]}>
                  {dashboard.typeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="因子状态分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                  label={(props) => `${STATUS_LABEL[(props as unknown as Record<string, string>).status] || (props as unknown as Record<string, string>).status}: ${(props as unknown as Record<string, number>).count}`}
                >
                  {dashboard.statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLOR[entry.status] || '#999'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown, name: unknown) => [String(value ?? 0), STATUS_LABEL[String(name)] || String(name)]} />
                <Legend formatter={(v: string) => STATUS_LABEL[v] || v} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top/Worst performers */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="🏆 表现最佳因子 TOP5" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboard.topPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number | undefined) => `${(v ?? 0).toFixed(2)}%`} />
                <Bar dataKey="metrics.annualReturn" name="年化收益" fill="#52c41a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="⚠️ 表现最差因子 TOP5" size="small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboard.worstPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number | undefined) => `${(v ?? 0).toFixed(2)}%`} />
                <Bar dataKey="metrics.annualReturn" name="年化收益" fill="#ff4d4f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Anomalies */}
      <Card title="近期异常因子" size="small" style={{ marginTop: 16 }}
        extra={<a onClick={() => navigate('/factors')}>查看全部</a>}
      >
        <Table<Factor>
          columns={anomalyColumns}
          dataSource={dashboard.recentAnomalies}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
