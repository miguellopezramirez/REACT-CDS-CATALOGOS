import { useState, useEffect } from 'react';
import TableLabels from "../components/TableLabels";
import { Title } from '@ui5/webcomponents-react';
import ModalNewCatalogo from "../components/ModalNewCatalogo";
import ModalNewValor from "../components/ModalNewValor";
import ModalDeleteCatalogo from "../components/ModalDeleteCatalogo";
import ModalSaveChanges from "../components/ModalSaveChanges";
import { fetchLabels } from '../services/labelService';
import { setLabels } from '../store/labelStore';
import { MessageStrip } from '@ui5/webcomponents-react';

export default function Catalogos() {
    const [saveMessage, setSaveMessage] = useState('');

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
        >
            Catalagos y Valores
        </Title>
        <ModalNewCatalogo/>
        <ModalNewValor/>
        <ModalDeleteCatalogo/>
        <ModalSaveChanges onSave={handleSave} />
        {saveMessage && <MessageStrip design="Positive" style={{ marginBottom: '1rem' }}>{saveMessage}</MessageStrip>}
        <TableLabels />
      </div>
    );
  }