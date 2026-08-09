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

interface CourseDistributionChartProps {
  courseAnalytics: any;
  assignmentAnalytics: any;
}

export function CourseDistributionChart({ courseAnalytics, assignmentAnalytics }: CourseDistributionChartProps) {
  if (!courseAnalytics || !assignmentAnalytics) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Course status pie chart data
  const courseStatusData = [
    {
      name: 'Activos',
      value: courseAnalytics.coursesByStatus?.active || 0,
      color: '#10B981'
    },
    {
      name: 'Inactivos',
      value: courseAnalytics.coursesByStatus?.inactive || 0,
      color: '#6B7280'
    }
  ];

  // Assignment statistics bar chart data
  const assignmentData = [
    {
      name: 'Tareas Creadas',
      value: assignmentAnalytics.totalAssignments || 0,
      color: '#3B82F6'
    },
    {
      name: 'Entregas Totales',
      value: assignmentAnalytics.totalSubmissions || 0,
      color: '#8B5CF6'
    },
    {
      name: 'Calificadas',
      value: assignmentAnalytics.gradedSubmissions || 0,
      color: '#10B981'
    },
    {
      name: 'Pendientes',
      value: assignmentAnalytics.pendingGrading || 0,
      color: '#F59E0B'
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              fill="#8884d8"
              dataKey="value"
            >
              {courseStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Assignment Statistics Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas de Tareas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assignmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              style={{ fontSize: '11px' }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
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
