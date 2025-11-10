import { Title, Panel, Select, Option } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';
import { getDbServer, setDbServer, DbServerType } from '../../../share/services/settingsService';
import { clearLabelsCache } from '../../etiquetasValores/store/labelStore';

export default function Settings() {
  const [selectedDb, setSelectedDb] = useState<DbServerType>('MongoDB');

  useEffect(() => {
    setSelectedDb(getDbServer());
  }, []);

  // Maneja el cambio de selección en el Select
  const handleDbChange = (event: any) => {
    const newServer = event.target.value as DbServerType;

    if (newServer) {
      console.log('Cambiando DB a:', newServer); // Para depuración
      setSelectedDb(newServer); // Actualiza el estado local
      setDbServer(newServer); // Guarda la nueva selección
      clearLabelsCache(); // Limpia la caché de etiquetas al cambiar la DB
    }
  };

  return (
    <div>
      <Title level="H1" size="H2" style={{ marginBottom: "1rem" }}>
        Configuración (Settings)
      </Title>
      
      <Panel headerText="Base de Datos" collapsed={false}>
        <div style={{ padding: "1rem" }}>
          <Select
            onChange={handleDbChange}
            value={selectedDb} // Usamos 'value' para controlar el componente
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
      </Panel>
      
      <p style={{marginTop: '1rem'}}>
        Selección actual: <strong>{selectedDb}</strong>
      </p>
    </div>
  );
}