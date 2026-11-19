import React from 'react';
import { LucideIcon } from 'lucide-react';
import { tintaDeRelleno } from '../../../utils/tintas';

interface StatsCardProps {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  titulo,
  valor,
  icon: Icon,
  color,
}) => {
  return (
    <div className={`bg-pn-surface rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm text-pn-ink-2`}>{titulo}</p>
          <p className={`text-3xl font-bold text-pn-ink mt-2`}>{valor}</p>
        </div>
        <div className={`${color} ${tintaDeRelleno(color)} p-4 rounded-full`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
