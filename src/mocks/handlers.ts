import { http, HttpResponse, delay } from 'msw';
import type { FactorListParams, DashboardSummary } from '@/types/factor';
import { ALL_FACTORS, generatePerformanceHistory, getMockNotifications, addMockNotification } from './data';

export const handlers = [
  // Dashboard summary
  http.get('*/api/dashboard/summary', async () => {
    await delay(300);
    const factors = ALL_FACTORS;
    const active = factors.filter(f => f.status === 'normal');
    const warning = factors.filter(f => f.status === 'warning');
    const critical = factors.filter(f => f.status === 'critical');

    const typeMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    factors.forEach(f => {
      typeMap.set(f.type, (typeMap.get(f.type) || 0) + 1);
      statusMap.set(f.status, (statusMap.get(f.status) || 0) + 1);
    });

    const summary: DashboardSummary = {
      totalFactors: factors.length,
      activeFactors: active.length,
      warningFactors: warning.length,
      criticalFactors: critical.length,
      avgReturn: Math.round(factors.reduce((s, f) => s + f.metrics.annualReturn, 0) / factors.length * 100) / 100,
      avgSharpe: Math.round(factors.reduce((s, f) => s + f.metrics.sharpeRatio, 0) / factors.length * 100) / 100,
      avgIC: Math.round(factors.reduce((s, f) => s + f.metrics.ic, 0) / factors.length * 1000) / 1000,
      totalAUM: 156.8,
      typeDistribution: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
      statusDistribution: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      topPerformers: [...factors].sort((a, b) => b.metrics.annualReturn - a.metrics.annualReturn).slice(0, 5),
      worstPerformers: [...factors].sort((a, b) => a.metrics.annualReturn - b.metrics.annualReturn).slice(0, 5),
      recentAnomalies: factors.filter(f => f.status === 'critical' || f.status === 'warning').slice(0, 10),
    };

    return HttpResponse.json(summary);
  }),

  // Factor list with pagination, search, filter, sort
  http.get('*/api/factors', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const params: FactorListParams = {
      page: parseInt(url.searchParams.get('page') || '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') || '20'),
      search: url.searchParams.get('search') || '',
      type: (url.searchParams.get('type') || '') as FactorListParams['type'],
      status: (url.searchParams.get('status') || '') as FactorListParams['status'],
      sortField: url.searchParams.get('sortField') || '',
      sortOrder: (url.searchParams.get('sortOrder') || '') as FactorListParams['sortOrder'],
    };

    let filtered = [...ALL_FACTORS];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(s) ||
        f.id.toLowerCase().includes(s) ||
        f.researcher.toLowerCase().includes(s) ||
        f.type.toLowerCase().includes(s)
      );
    }
    if (params.type) {
      filtered = filtered.filter(f => f.type === params.type);
    }
    if (params.status) {
      filtered = filtered.filter(f => f.status === params.status);
    }

    if (params.sortField && params.sortOrder) {
      const order = params.sortOrder === 'ascend' ? 1 : -1;
      filtered.sort((a, b) => {
        const field = params.sortField!;
        const aVal = field.includes('.') ? (a.metrics as unknown as Record<string, number>)[field.split('.')[1]] : (a as unknown as Record<string, unknown>)[field];
        const bVal = field.includes('.') ? (b.metrics as unknown as Record<string, number>)[field.split('.')[1]] : (b as unknown as Record<string, unknown>)[field];
        if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * order;
        return String(aVal).localeCompare(String(bVal)) * order;
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const paged = filtered.slice(start, start + params.pageSize);

    return HttpResponse.json({
      data: paged,
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
    });
  }),

  // Factor detail
  http.get('*/api/factors/:id', async ({ params }) => {
    await delay(200);
    const factor = ALL_FACTORS.find(f => f.id === params.id);
    if (!factor) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(factor);
  }),

  // Factor performance history
  http.get('*/api/factors/:id/performance', async ({ params }) => {
    await delay(300);
    const data = generatePerformanceHistory(params.id as string);
    return HttpResponse.json(data);
  }),

  // Register new factor
  http.post('*/api/factors', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newFactor = {
      id: `F${String(ALL_FACTORS.length + 1).padStart(5, '0')}`,
      ...body,
      status: 'normal',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      metrics: {
        ic: 0, icir: 0, annualReturn: 0, sharpeRatio: 0,
        maxDrawdown: 0, turnover: 0, correlation: 0,
        winRate: 50, volatility: 0, calmarRatio: 0,
      },
    };
    ALL_FACTORS.push(newFactor as typeof ALL_FACTORS[0]);
    return HttpResponse.json(newFactor, { status: 201 });
  }),

  // Notifications
  http.get('*/api/notifications', async () => {
    await delay(200);
    return HttpResponse.json(getMockNotifications());
  }),

  http.post('*/api/notifications', async ({ request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const notification = addMockNotification(body as Parameters<typeof addMockNotification>[0]);
    return HttpResponse.json(notification, { status: 201 });
  }),
];
