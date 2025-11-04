import { useState, useEffect } from 'react';
import TableLabels from "../components/TableLabels";
import { Title, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react';
import ModalNewCatalogo from "../components/ModalNewCatalogo";
import ModalNewValor from "../components/ModalNewValor";
import ModalDeleteCatalogo from "../components/ModalDeleteCatalogo";
import ModalSaveChanges from "../components/ModalSaveChanges";
import ModalUpdateCatalogo from "../components/ModalUpdateCatalogo";
import { fetchLabels, TableParentRow } from '../services/labelService';
import { setLabels } from '../store/labelStore';
import { MessageStrip } from '@ui5/webcomponents-react';

export default function Catalogos() {
    const [saveMessage, setSaveMessage] = useState('');
    const [selectedLabel, setSelectedLabel] = useState<TableParentRow | null>(null);

    useEffect(() => {
        fetchLabels().then((transformedData) => {
            setLabels(transformedData);
        });
    }, []);

    const handleSave = () => {
        setSaveMessage('Datos guardados correctamente.');
        setTimeout(() => {
            setSaveMessage('');
        }, 3000); // Hide message after 3 seconds
    };

    return (
      <div>
        <Title 
          level="H1" 
          size="H2"
          style={{ marginBottom: '1rem' }}
        >
            Catalagos y Valores
        </Title>
        <Toolbar 
          style={{ 
            padding: '0.5rem', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}
        >
          <ModalNewCatalogo/>
          <ModalNewValor/>
          <ModalDeleteCatalogo/>
          <ModalUpdateCatalogo label={selectedLabel}/>
          <ToolbarSpacer />
          <ModalSaveChanges onSave={handleSave} />
        </Toolbar>
        {saveMessage && <MessageStrip design="Positive" style={{ marginBottom: '1rem' }}>{saveMessage}</MessageStrip>}
        <TableLabels onSelectionChange={setSelectedLabel} />
      </div>
    );
  }