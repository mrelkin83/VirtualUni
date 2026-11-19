import React, { useState } from 'react';
import { FileText, Package, BarChart3 } from 'lucide-react';
import { PlantillasTab } from './PlantillasTab';
import { ExpedicionesTab } from './ExpedicionesTab';

// La pestania "Carnets" (modulo idcards del backend) se retiro de la UI: era
// un segundo sistema de carnetizacion en paralelo a expediciones/plantillas
// (card-issuances + card-templates + card-generator), con modelo de datos
// propio, de modo que un carnet emitido en una pestania no existia en la
// otra. Se conserva el sistema con plantillas y PDF; el modulo idcards sigue
// en el backend por si hay datos que migrar.
type TabType = 'plantillas' | 'expediciones';

export const CarnetizacionMejorada: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('expediciones');

  const tabs = [
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
          <h2 className="text-3xl font-bold text-pn-ink">
            Sistema de Carnetización
          </h2>
          <p className="text-pn-ink-2 mt-1">
            Gestión completa de carnets, plantillas y expediciones
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-pn-accent-soft text-pn-accent-text rounded-lg">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Sistema Completo</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-pn-surface rounded-lg shadow-sm border border-pn-line">
        <div className="border-b border-pn-line">
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
                        ? 'border-pn-accent-line text-pn-accent-text'
                        : 'border-transparent text-pn-muted hover:text-pn-ink-2 hover:border-pn-line'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 mr-2
                      ${isActive ? 'text-pn-accent-text' : 'text-pn-muted group-hover:text-pn-muted'}
                    `}
                  />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs text-pn-muted">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'plantillas' && <PlantillasTab />}
          {activeTab === 'expediciones' && <ExpedicionesTab />}
        </div>
      </div>
    </div>
  );
};

export default CarnetizacionMejorada;
