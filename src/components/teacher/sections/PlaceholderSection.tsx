import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  card: string;
  text: string;
  darkMode: boolean;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  description,
  card,
  text,
  darkMode
}) => {
  return (
    <div className={`${card} rounded-lg shadow p-8 text-center`}>
      <AlertCircle className={`mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={48} />
      <h3 className={`text-2xl font-bold ${text} mb-2`}>{title}</h3>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-4`}>
        Esta sección mantiene toda la funcionalidad original del diseño.
      </p>
    </div>
  );
};
