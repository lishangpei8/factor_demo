import type { Factor, FactorType, FactorStatus, FactorPerformance, Notification } from '@/types/factor';

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

const FACTOR_PREFIXES: Record<FactorType, string[]> = {
  Alpha: ['多因子Alpha', '残差Alpha', '纯Alpha', '增强Alpha', '对冲Alpha', '行业Alpha', '风格Alpha', '择时Alpha'],
  Size: ['市值', '对数市值', '自由流通市值', '总市值', '相对市值', '市值偏离', '小盘', '微盘'],
  Liquidity: ['流动性', '换手率', '成交量比', '买卖价差', 'Amihud非流动性', '流动性冲击', '深度比', '流动性波动'],
  Value: ['市盈率', '市净率', '市销率', 'EV/EBITDA', '股息率', '自由现金流收益', '盈利收益', 'ROIC'],
  Momentum: ['动量', '反转', '相对强弱', '价格动量', '盈利动量', '分析师修正', 'SUE', '信息离散度'],
  Quality: ['ROE', 'ROA', '毛利率', '资产周转率', '应计利润', '盈利质量', '财务稳健', '经营效率'],
  Volatility: ['波动率', '特异波动', '下行波动', 'Beta', '尾部风险', '偏度', '峰度', '波动率偏差'],
  Growth: ['营收增长', '利润增长', '资产增长', 'ROE变化', '盈利加速', '可持续增长', '内生增长', '研发投入'],
  Dividend: ['股息率', '股息增长', '派息率', '股息稳定性', '股息覆盖', '现金分红', '特别股息', '回购收益'],
  Reversal: ['短期反转', '中期反转', '长期反转', '行业反转', '波动反转', '流动性反转', '情绪反转', '均值回归'],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateMetrics(rand: () => number, status: FactorStatus) {
  const baseIC = status === 'critical' ? -0.02 + rand() * 0.03 : status === 'warning' ? 0.01 + rand() * 0.03 : 0.03 + rand() * 0.07;
  const baseReturn = status === 'critical' ? -15 + rand() * 10 : status === 'warning' ? -5 + rand() * 15 : 5 + rand() * 25;

  return {
    ic: Math.round(baseIC * 1000) / 1000,
    icir: Math.round((baseIC * (2 + rand() * 3)) * 100) / 100,
    annualReturn: Math.round(baseReturn * 100) / 100,
    sharpeRatio: Math.round((baseReturn / (8 + rand() * 12)) * 100) / 100,
    maxDrawdown: Math.round((-3 - rand() * 25) * 100) / 100,
    turnover: Math.round((30 + rand() * 170) * 100) / 100,
    correlation: Math.round((rand() * 0.6 - 0.1) * 1000) / 1000,
    winRate: Math.round((40 + rand() * 25) * 100) / 100,
    volatility: Math.round((5 + rand() * 20) * 100) / 100,
    calmarRatio: Math.round((baseReturn / (5 + rand() * 15)) * 100) / 100,
  };
}

export function generateFactors(count: number = 500): Factor[] {
  const rand = seededRandom(42);
  const factors: Factor[] = [];

  for (let i = 0; i < count; i++) {
    const type = FACTOR_TYPES[Math.floor(rand() * FACTOR_TYPES.length)];
    const prefixes = FACTOR_PREFIXES[type];
    const prefix = prefixes[Math.floor(rand() * prefixes.length)];
    const researcher = RESEARCHERS[Math.floor(rand() * RESEARCHERS.length)];

    const statusRoll = rand();
    const status: FactorStatus = statusRoll < 0.05 ? 'critical' : statusRoll < 0.15 ? 'warning' : statusRoll < 0.2 ? 'inactive' : 'normal';

    const suffix = `_v${Math.floor(rand() * 5) + 1}.${Math.floor(rand() * 10)}`;
    const year = 2020 + Math.floor(rand() * 5);
    const month = String(Math.floor(rand() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(rand() * 28) + 1).padStart(2, '0');

    factors.push({
      id: `F${String(i + 1).padStart(5, '0')}`,
      name: `${prefix}${suffix}`,
      type,
      status,
      researcher: researcher.name,
      researcherEmail: researcher.email,
      description: `${type}类因子 - ${prefix}策略，基于${type === 'Alpha' ? '多因子模型' : type === 'Momentum' ? '价格趋势分析' : type === 'Value' ? '基本面估值' : type === 'Quality' ? '财务质量评估' : type === 'Volatility' ? '波动率建模' : '量化统计模型'}构建`,
      createdAt: `${year}-${month}-${day}`,
      updatedAt: `2025-02-${String(Math.floor(rand() * 13) + 1).padStart(2, '0')}`,
      metrics: generateMetrics(rand, status),
    });
  }

  return factors;
}

export function generatePerformanceHistory(factorId: string, days: number = 252): FactorPerformance[] {
  const seed = parseInt(factorId.replace('F', ''), 10) || 1;
  const rand = seededRandom(seed);
  const data: FactorPerformance[] = [];
  let cumReturn = 0;
  let benchReturn = 0;

  const startDate = new Date('2024-02-01');
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (rand() - 0.48) * 2;
    const benchDaily = (rand() - 0.49) * 1.5;
    cumReturn += dailyReturn;
    benchReturn += benchDaily;

    data.push({
      date: date.toISOString().split('T')[0],
      cumulativeReturn: Math.round(cumReturn * 100) / 100,
      dailyReturn: Math.round(dailyReturn * 100) / 100,
      ic: Math.round((rand() * 0.12 - 0.02) * 1000) / 1000,
      benchmark: Math.round(benchReturn * 100) / 100,
    });
  }
  return data;
}

let mockNotifications: Notification[] = [
  {
    id: 'N001',
    factorId: 'F00003',
    factorName: '残差Alpha_v2.3',
    researcher: '王浩然',
    researcherEmail: 'wang.hr@quantfund.com',
    type: 'critical',
    message: '因子IC持续低于阈值，最大回撤超过20%，请及时检查模型参数',
    status: 'sent',
    createdAt: '2025-02-12T10:30:00Z',
  },
  {
    id: 'N002',
    factorId: 'F00015',
    factorName: '动量_v3.1',
    researcher: '李思涵',
    researcherEmail: 'li.sh@quantfund.com',
    type: 'warning',
    message: '因子近期表现偏离历史均值，夏普比率显著下降',
    status: 'acknowledged',
    createdAt: '2025-02-11T14:20:00Z',
  },
  {
    id: 'N003',
    factorId: 'F00042',
    factorName: 'ROE_v1.5',
    researcher: '陈雨萱',
    researcherEmail: 'chen.yx@quantfund.com',
    type: 'warning',
    message: '因子换手率异常升高，请关注交易成本影响',
    status: 'pending',
    createdAt: '2025-02-10T09:15:00Z',
  },
];

export function getMockNotifications(): Notification[] {
  return [...mockNotifications];
}

export function addMockNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `N${String(mockNotifications.length + 1).padStart(3, '0')}`,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };
  mockNotifications = [newNotification, ...mockNotifications];
  return newNotification;
}

// Pre-generate factors
export const ALL_FACTORS = generateFactors(500);
