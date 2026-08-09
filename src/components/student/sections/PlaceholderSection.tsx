import React from 'react';
import { Construction } from 'lucide-react';

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
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>{title}</h2>
      <div className={`${card} rounded-lg shadow p-12 text-center`}>
        <Construction
          size={64}
          className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
        />
        <h3 className={`text-xl font-bold ${text} mb-2`}>Sección en Desarrollo</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};
