import React, { useState } from 'react';
import {
  CreditCard,
  FileText,
  Package,
  BarChart3,
} from 'lucide-react';
import { CarnetsTab } from './CarnetsTab';
import { PlantillasTab } from './PlantillasTab';
import { ExpedicionesTab } from './ExpedicionesTab';

type TabType = 'carnets' | 'plantillas' | 'expediciones';

export const CarnetizacionMejorada: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('carnets');

  const tabs = [
    {
      id: 'carnets' as TabType,
      label: 'Carnets',
      icon: CreditCard,
      description: 'Gestión de carnets individuales',
    },
    {
      id: 'plantillas' as TabType,
      label: 'Plantillas',
      icon: FileText,
      description: 'Plantillas personalizables',
    },
    {
      id: 'expediciones' as TabType,
      label: 'Expediciones',
      icon: Package,
      description: 'Expediciones masivas',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sistema de Carnetización
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión completa de carnets, plantillas y expediciones
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Sistema Completo</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 group inline-flex items-center justify-center px-6 py-4 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 mr-2
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'carnets' && <CarnetsTab />}
          {activeTab === 'plantillas' && <PlantillasTab />}
          {activeTab === 'expediciones' && <ExpedicionesTab />}
        </div>
      </div>
    </div>
  );
};

export default CarnetizacionMejorada;
