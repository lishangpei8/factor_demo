export type FactorType = 'Alpha' | 'Size' | 'Liquidity' | 'Value' | 'Momentum' | 'Quality' | 'Volatility' | 'Growth' | 'Dividend' | 'Reversal';

export type FactorStatus = 'normal' | 'warning' | 'critical' | 'inactive';

export interface Factor {
  id: string;
  name: string;
  type: FactorType;
  status: FactorStatus;
  researcher: string;
  researcherEmail: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metrics: FactorMetrics;
}

export interface FactorMetrics {
  ic: number;          // Information Coefficient
  icir: number;        // IC Information Ratio
  annualReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  turnover: number;
  correlation: number;
  winRate: number;
  volatility: number;
  calmarRatio: number;
}

export interface FactorPerformance {
  date: string;
  cumulativeReturn: number;
  dailyReturn: number;
  ic: number;
  benchmark: number;
}

export interface Notification {
  id: string;
  factorId: string;
  factorName: string;
  researcher: string;
  researcherEmail: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  status: 'pending' | 'sent' | 'acknowledged';
  createdAt: string;
}

export interface DashboardSummary {
  totalFactors: number;
  activeFactors: number;
  warningFactors: number;
  criticalFactors: number;
  avgReturn: number;
  avgSharpe: number;
  avgIC: number;
  totalAUM: number;
  typeDistribution: { type: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  topPerformers: Factor[];
  worstPerformers: Factor[];
  recentAnomalies: Factor[];
}

export interface FactorListParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: FactorType | '';
  status?: FactorStatus | '';
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export interface FactorListResponse {
  data: Factor[];
  total: number;
  page: number;
  pageSize: number;
}
