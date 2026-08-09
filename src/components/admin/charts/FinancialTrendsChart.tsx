import React from 'react';
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

interface FinancialTrendsChartProps {
  data: any;
}

export function FinancialTrendsChart({ data }: FinancialTrendsChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
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

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tendencias Financieras Mensuales
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="ingresos"
            fill="#10B981"
            name="Ingresos"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="egresos"
            fill="#EF4444"
            name="Egresos"
            radius={[8, 8, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3B82F6"
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
