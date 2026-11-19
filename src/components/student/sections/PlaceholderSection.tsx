import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-pn-ink`}>{title}</h2>
      <div className={`bg-pn-surface rounded-lg shadow p-12 text-center`}>
        <Construction
          size={64}
          className={`mx-auto mb-4 text-pn-muted`}
        />
        <h3 className={`text-xl font-bold text-pn-ink mb-2`}>Sección en Desarrollo</h3>
        <p className={`text-pn-ink-2`}>
          {description}
        </p>
      </div>
    </div>
  );
};
