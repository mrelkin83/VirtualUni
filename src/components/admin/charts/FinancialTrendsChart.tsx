import React from 'react';
import { formatearCop } from '../../../utils/formato';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { EJE, LEYENDA, REJILLA, TOOLTIP } from './tema';

interface FinancialTrendsChartProps {
  data: any;
}

export function FinancialTrendsChart({ data }: FinancialTrendsChartProps) {
  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-pn-md border border-pn-line bg-pn-surface-2">
        <p className="font-body text-sm text-pn-muted">No hay datos disponibles</p>
      </div>
    );
  }

  // Transform monthly trends data for the chart
  const chartData = Object.entries(data).map(([month, values]: [string, any]) => ({
    month,
    ingresos: values.income || 0,
    egresos: values.expenses || 0,
    balance: (values.income || 0) - (values.expenses || 0),
  })).sort((a, b) => a.month.localeCompare(b.month));


  return (
    <div className="rounded-pn-md border border-pn-line bg-pn-surface p-4">
      <h3 className="mb-4 font-display text-base font-bold text-pn-ink">
        Tendencias Financieras Mensuales
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <CartesianGrid {...REJILLA} />
          <XAxis dataKey="month" {...EJE} />
          <YAxis
            stroke="var(--pn-muted)"
            style={{ fontSize: '12px' }}
            tickFormatter={(v: number) => formatearCop(v)}
          />
          <Tooltip
            {...TOOLTIP}
            formatter={(value: any) => formatearCop(Number(value))}
          />
          <Legend {...LEYENDA} />
          <Bar
            dataKey="ingresos"
            fill="var(--pn-ok)"
            name="Ingresos"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="egresos"
            fill="var(--pn-danger)"
            name="Egresos"
            radius={[8, 8, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--pn-accent)"
            strokeWidth={3}
            name="Balance"
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
