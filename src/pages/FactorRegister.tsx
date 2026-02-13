import React from 'react';
import {
  Card, Form, Input, Select, Button, Typography, message, Row, Col, Divider,
} from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useFactorStore } from '@/stores/factorStore';
import { useNavigate } from 'react-router-dom';
import type { FactorType } from '@/types/factor';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FACTOR_TYPES: FactorType[] = ['Alpha', 'Size', 'Liquidity', 'Value', 'Momentum', 'Quality', 'Volatility', 'Growth', 'Dividend', 'Reversal'];

const RESEARCHERS = [
  { name: '张明远', email: 'zhang.my@quantfund.com' },
  { name: '李思涵', email: 'li.sh@quantfund.com' },
  { name: '王浩然', email: 'wang.hr@quantfund.com' },
  { name: '陈雨萱', email: 'chen.yx@quantfund.com' },
  { name: '刘博文', email: 'liu.bw@quantfund.com' },
  { name: '赵子轩', email: 'zhao.zx@quantfund.com' },
  { name: '孙晓峰', email: 'sun.xf@quantfund.com' },
  { name: '周思远', email: 'zhou.sy@quantfund.com' },
  { name: '吴嘉琪', email: 'wu.jq@quantfund.com' },
  { name: '郑凯文', email: 'zheng.kw@quantfund.com' },
];

const FactorRegister: React.FC = () => {
  const [form] = Form.useForm();
  const { registerFactor, registerLoading } = useFactorStore();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleResearcherChange = (name: string) => {
    const r = RESEARCHERS.find((r) => r.name === name);
    if (r) {
      form.setFieldsValue({ researcherEmail: r.email });
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const success = await registerFactor(values);
    if (success) {
      messageApi.success('因子注册成功！');
      form.resetFields();
      setTimeout(() => navigate('/factors'), 1000);
    } else {
      messageApi.error('注册失败，请重试');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {contextHolder}
      <Title level={4}>
        <PlusOutlined style={{ marginRight: 8 }} />
        注册新因子
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        填写以下信息注册新的量化因子策略，注册后可在因子监控页面查看。
      </Text>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          size="large"
        >
          <Divider>基本信息</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="因子名称"
                rules={[{ required: true, message: '请输入因子名称' }]}
              >
                <Input placeholder="例如：多因子Alpha_v2.0" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="因子类型"
                rules={[{ required: true, message: '请选择因子类型' }]}
              >
                <Select placeholder="选择因子类型">
                  {FACTOR_TYPES.map((t) => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="researcher"
                label="负责研究员"
                rules={[{ required: true, message: '请选择负责研究员' }]}
              >
                <Select placeholder="选择研究员" onChange={handleResearcherChange}>
                  {RESEARCHERS.map((r) => (
                    <Option key={r.name} value={r.name}>{r.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="researcherEmail" label="研究员邮箱">
                <Input disabled placeholder="自动填充" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="因子描述"
            rules={[{ required: true, message: '请输入因子描述' }]}
          >
            <TextArea rows={4} placeholder="请描述因子的构建逻辑、适用场景、预期表现等信息..." />
          </Form.Item>

          <Divider>策略参数（可选）</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="universe" label="选股范围">
                <Select placeholder="选择选股范围">
                  <Option value="A全市场">A股全市场</Option>
                  <Option value="沪深300">沪深300</Option>
                  <Option value="中证500">中证500</Option>
                  <Option value="中证1000">中证1000</Option>
                  <Option value="创业板">创业板</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="frequency" label="调仓频率">
                <Select placeholder="选择频率">
                  <Option value="daily">日频</Option>
                  <Option value="weekly">周频</Option>
                  <Option value="biweekly">双周</Option>
                  <Option value="monthly">月频</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="benchmark" label="基准指数">
                <Select placeholder="选择基准">
                  <Option value="沪深300">沪深300</Option>
                  <Option value="中证500">中证500</Option>
                  <Option value="中证1000">中证1000</Option>
                  <Option value="万得全A">万得全A</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="icThreshold" label="IC预警阈值">
                <Input type="number" placeholder="例如：0.02" addonAfter="IC" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="drawdownThreshold" label="最大回撤预警">
                <Input type="number" placeholder="例如：-15" addonAfter="%" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="turnoverLimit" label="换手率上限">
                <Input type="number" placeholder="例如：200" addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={registerLoading} icon={<SaveOutlined />} size="large">
              提交注册
            </Button>
            <Button style={{ marginLeft: 12 }} onClick={() => form.resetFields()} size="large">
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FactorRegister;
