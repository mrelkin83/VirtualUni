import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  description,
}) => {
  return (
    <div className={`bg-pn-surface rounded-lg shadow p-8 text-center`}>
      <AlertCircle className={`mx-auto mb-4 text-pn-accent-text`} size={48} />
      <h3 className={`text-2xl font-bold text-pn-ink mb-2`}>{title}</h3>
      <p className={`text-pn-ink-2`}>{description}</p>
      <p className={`text-sm text-pn-muted mt-4`}>
        Esta sección mantiene toda la funcionalidad original del diseño.
      </p>
    </div>
  );
};
