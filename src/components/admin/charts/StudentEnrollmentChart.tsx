import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { EJE, LEYENDA, REJILLA, TOOLTIP } from './tema';

interface StudentEnrollmentChartProps {
  data: any;
}

export function StudentEnrollmentChart({ data }: StudentEnrollmentChartProps) {
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
    estudiantes: values.students || 0,
    inscripciones: values.enrollments || 0,
  })).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="rounded-pn-md border border-pn-line bg-pn-surface p-4">
      <h3 className="mb-4 font-display text-base font-bold text-pn-ink">
        Tendencia de Estudiantes e Inscripciones
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--pn-accent)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--pn-accent)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--pn-ok)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--pn-ok)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...REJILLA} />
          <XAxis dataKey="month" {...EJE} />
          <YAxis {...EJE} />
          <Tooltip {...TOOLTIP} />
          <Legend {...LEYENDA} />
          <Area
            type="monotone"
            dataKey="estudiantes"
            stroke="var(--pn-accent)"
            fillOpacity={1}
            fill="url(#colorStudents)"
            name="Nuevos Estudiantes"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="inscripciones"
            stroke="var(--pn-ok)"
            fillOpacity={1}
            fill="url(#colorEnrollments)"
            name="Nuevas Inscripciones"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
