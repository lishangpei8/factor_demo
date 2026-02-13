import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Statistic, Tag, Typography, Spin, Button, Descriptions, Space, Divider, App,
} from 'antd';
import {
  ArrowLeftOutlined, BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, BarChart, Bar,
} from 'recharts';
import { useFactorStore } from '@/stores/factorStore';
import { useNotificationStore } from '@/stores/notificationStore';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  normal: { color: 'success', label: '正常' },
  warning: { color: 'warning', label: '预警' },
  critical: { color: 'error', label: '异常' },
  inactive: { color: 'default', label: '停用' },
};

const FactorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentFactor, performance, detailLoading, fetchFactorDetail, fetchPerformance } = useFactorStore();
  const { sendNotification } = useNotificationStore();
  const { message: messageApi, modal } = App.useApp();

  useEffect(() => {
    if (id) {
      fetchFactorDetail(id);
      fetchPerformance(id);
    }
  }, [id, fetchFactorDetail, fetchPerformance]);

  const handleNotify = () => {
    if (!currentFactor) return;
    const factor = currentFactor;
    modal.confirm({
      title: '发送异常通知',
      icon: <ExclamationCircleOutlined />,
      content: `确认向研究员 ${factor.researcher} (${factor.researcherEmail}) 发送关于 ${factor.name} 的异常通知？`,
      okText: '确认发送',
      cancelText: '取消',
      onOk: async () => {
        const success = await sendNotification({
          factorId: factor.id,
          factorName: factor.name,
          researcher: factor.researcher,
          researcherEmail: factor.researcherEmail,
          type: factor.status === 'critical' ? 'critical' : 'warning',
          message: `因子 ${factor.name} 需要关注，年化收益 ${factor.metrics.annualReturn.toFixed(2)}%，IC ${factor.metrics.ic.toFixed(3)}`,
        });
        if (success) messageApi.success('通知已发送');
        else messageApi.error('发送失败');
      },
    });
  };

  if (detailLoading || !currentFactor) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const f = currentFactor;
  const m = f.metrics;
  const sc = STATUS_CONFIG[f.status] || STATUS_CONFIG.normal;

  // Sample every 5th point for IC bar chart
  const icData = performance.filter((_, i) => i % 5 === 0);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/factors')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>{f.name}</Title>
        <Tag color={sc.color}>{sc.label}</Tag>
        <Tag>{f.type}</Tag>
        <Button type="primary" danger icon={<BellOutlined />} onClick={handleNotify}>
          通知研究员
        </Button>
      </Space>

      {/* Basic Info */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 4 }} size="small">
          <Descriptions.Item label="因子ID"><Text copyable style={{ fontFamily: 'monospace' }}>{f.id}</Text></Descriptions.Item>
          <Descriptions.Item label="因子类型">{f.type}</Descriptions.Item>
          <Descriptions.Item label="研究员">{f.researcher}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{f.researcherEmail}</Descriptions.Item>
          <Descriptions.Item label="创建日期">{f.createdAt}</Descriptions.Item>
          <Descriptions.Item label="最后更新">{f.updatedAt}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{f.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Metrics */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: 'IC', value: m.ic, precision: 3, good: m.ic >= 0.03 },
          { title: 'ICIR', value: m.icir, precision: 2, good: m.icir >= 0.5 },
          { title: '年化收益', value: m.annualReturn, precision: 2, suffix: '%', good: m.annualReturn >= 0 },
          { title: '夏普比率', value: m.sharpeRatio, precision: 2, good: m.sharpeRatio >= 1 },
          { title: '最大回撤', value: m.maxDrawdown, precision: 2, suffix: '%', good: false },
          { title: '换手率', value: m.turnover, precision: 1, suffix: '%', good: m.turnover < 100 },
          { title: '胜率', value: m.winRate, precision: 1, suffix: '%', good: m.winRate >= 50 },
          { title: 'Calmar比率', value: m.calmarRatio, precision: 2, good: m.calmarRatio >= 1 },
          { title: '波动率', value: m.volatility, precision: 2, suffix: '%', good: m.volatility < 15 },
          { title: '相关性', value: m.correlation, precision: 3, good: Math.abs(m.correlation) < 0.3 },
        ].map((item) => (
          <Col xs={12} sm={8} lg={4} xl={4} key={item.title}>
            <Card size="small" hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.precision}
                suffix={item.suffix}
                prefix={item.title === '年化收益' ? (item.value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />) : undefined}
                valueStyle={{
                  color: item.title === '最大回撤' ? '#ff4d4f' : item.good ? '#52c41a' : '#faad14',
                  fontSize: 18,
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Performance Chart */}
      <Card title="累计收益曲线" size="small" style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={performance}>
            <defs>
              <linearGradient id="factorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1677ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1677ff" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#999" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#999" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={20} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v: number | undefined) => `${(v ?? 0).toFixed(2)}%`} />
            <Legend />
            <Area type="monotone" dataKey="cumulativeReturn" name="因子收益" stroke="#1677ff" fill="url(#factorGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="benchmark" name="基准收益" stroke="#999" fill="url(#benchGrad)" strokeWidth={1.5} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Return & IC */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="日收益率分布" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performance.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={15} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: number | undefined) => `${(v ?? 0).toFixed(2)}%`} />
                <Line type="monotone" dataKey="dailyReturn" name="日收益" stroke="#1677ff" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="IC序列" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={icData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={8} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => (v ?? 0).toFixed(3)} />
                <Bar dataKey="ic" name="IC">
                  {icData.map((entry, index) => {
                    const fill = entry.ic >= 0.03 ? '#52c41a' : entry.ic >= 0 ? '#faad14' : '#ff4d4f';
                    return <rect key={index} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />
    </div>
  );
};

export default FactorDetail;
