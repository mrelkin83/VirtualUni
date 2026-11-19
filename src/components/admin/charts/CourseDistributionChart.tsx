import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { EJE, LEYENDA, REJILLA, TOOLTIP } from './tema';

interface CourseDistributionChartProps {
  courseAnalytics: any;
  assignmentAnalytics: any;
}

export function CourseDistributionChart({ courseAnalytics, assignmentAnalytics }: CourseDistributionChartProps) {
  if (!courseAnalytics || !assignmentAnalytics) {
    return (
      <div className="flex h-64 items-center justify-center rounded-pn-md border border-pn-line bg-pn-surface-2">
        <p className="font-body text-sm text-pn-muted">No hay datos disponibles</p>
      </div>
    );
  }

  // Course status pie chart data
  const courseStatusData = [
    {
      name: 'Activos',
      value: courseAnalytics.coursesByStatus?.active || 0,
      color: 'var(--pn-ok)'
    },
    {
      name: 'Inactivos',
      value: courseAnalytics.coursesByStatus?.inactive || 0,
      color: 'var(--pn-muted)'
    }
  ];

  // Assignment statistics bar chart data
  const assignmentData = [
    {
      name: 'Tareas Creadas',
      value: assignmentAnalytics.totalAssignments || 0,
      color: 'var(--pn-accent)'
    },
    {
      name: 'Entregas Totales',
      value: assignmentAnalytics.totalSubmissions || 0,
      color: 'var(--pn-info)'
    },
    {
      name: 'Calificadas',
      value: assignmentAnalytics.gradedSubmissions || 0,
      color: 'var(--pn-ok)'
    },
    {
      name: 'Pendientes',
      value: assignmentAnalytics.pendingGrading || 0,
      color: 'var(--pn-warn)'
    }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Course Status Pie Chart */}
      <div className="rounded-pn-md border border-pn-line bg-pn-surface p-4">
        <h3 className="mb-4 font-display text-base font-bold text-pn-ink">
          Distribución de Cursos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={courseStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="var(--pn-accent)"
              dataKey="value"
            >
              {courseStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP} />
            <Legend {...LEYENDA} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Assignment Statistics Bar Chart */}
      <div className="rounded-pn-md border border-pn-line bg-pn-surface p-4">
        <h3 className="mb-4 font-display text-base font-bold text-pn-ink">
          Estadísticas de Tareas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assignmentData}>
            <CartesianGrid {...REJILLA} />
            <XAxis dataKey="name" {...EJE} />
            <YAxis {...EJE} />
            <Tooltip {...TOOLTIP} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            >
              {assignmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
