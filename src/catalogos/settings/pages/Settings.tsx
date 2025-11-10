// src/catalogos/settings/pages/Settings.tsx
import { Title, Panel, Select, Option } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';
import { getDbServer, setDbServer, DbServerType, ThemeType, getTheme, setTheme } from '../../../share/services/settingsService';
import { clearLabelsCache } from '../../etiquetasValores/store/labelStore';

// FIC: Definir y exportar un CustomEvent para notificar el cambio de tema
export const themeChangeEvent = 'app-theme-change';

export default function Settings() {
  const [selectedDb, setSelectedDb] = useState<DbServerType>('MongoDB');
  // FIC: Estado para el tema
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('sap_horizon');

  useEffect(() => {
    setSelectedDb(getDbServer());
    // FIC: Cargar el tema inicial
    setSelectedTheme(getTheme());
  }, []);

  // Maneja el cambio de selección en el Select de la base de datos
  const handleDbChange = (event: any) => {
    const newServer = event.target.value as DbServerType;

    if (newServer) {
      console.log('Cambiando DB a:', newServer);
      setSelectedDb(newServer);
      setDbServer(newServer);
      clearLabelsCache();
    }
  };
  
  // FIC: Maneja el cambio de selección en el Select del tema
  const handleThemeChange = (event: any) => {
    const newTheme = event.target.value as ThemeType;

    if (newTheme) {
      console.log('Cambiando Tema a:', newTheme);
      setSelectedTheme(newTheme); // Actualiza el estado local
      setTheme(newTheme); // Guarda la nueva selección

      // FIC: Dispara un evento personalizado para notificar a la aplicación principal (main.tsx)
      document.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: newTheme }));
    }
  };


  return (
    <div>
      <Title level="H1" size="H2" style={{ marginBottom: "1rem" }}>
        Configuración (Settings)
      </Title>
      
      <Panel headerText="Base de Datos" collapsed={false} style={{ marginBottom: "1rem" }}>
        <div style={{ padding: "1rem" }}>
          <Select
            onChange={handleDbChange}
            value={selectedDb} 
            style={{ width: '100%' }}
          >
            <Option value="MongoDB">
              MongoDB
            </Option>
            <Option value="CosmosDB">
              CosmosDB
            </Option>
          </Select>
        </div>
        <p style={{marginTop: '1rem', padding: '0 1rem 1rem 1rem'}}>
          Selección actual de DB: <strong>{selectedDb}</strong>
        </p>
      </Panel>

      {/* FIC: Panel de configuración del Tema */}
      <Panel headerText="Tema de la Aplicación" collapsed={false}>
        <div style={{ padding: "1rem" }}>
          <Select
            onChange={handleThemeChange}
            value={selectedTheme} 
            style={{ width: '100%' }}
          >
            <Option value="sap_horizon">
              Tema Claro (Light - sap_horizon)
            </Option>
            <Option value="sap_horizon_dark">
              Tema Oscuro (Dark - sap_horizon_dark)
            </Option>
          </Select>
        </div>
        <p style={{marginTop: '1rem', padding: '0 1rem 1rem 1rem'}}>
          Selección actual de Tema: <strong>{selectedTheme === 'sap_horizon_dark' ? 'Tema Oscuro' : 'Tema Claro'}</strong>
        </p>
      </Panel>

    </div>
  );
}