import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  color: string;
  darkMode: boolean;
  card: string;
  text: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  titulo,
  valor,
  icon: Icon,
  color,
  darkMode,
  card,
  text
}) => {
  return (
    <div className={`${card} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{titulo}</p>
          <p className={`text-3xl font-bold ${text} mt-2`}>{valor}</p>
        </div>
        <div className={`${color} p-4 rounded-full`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};
