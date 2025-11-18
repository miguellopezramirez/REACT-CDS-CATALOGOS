// src/catalogos/etiquetasValores/components/ValidationErrorDialog.tsx
import { Dialog, Bar, Title, Button, List, ListItemStandard, Icon } from '@ui5/webcomponents-react';
import { FC } from 'react';

interface ValidationErrorDialogProps {
  open: boolean;
  errors: Record<string, string>;
  onClose: () => void;
  title?: string;
}

export const ValidationErrorDialog: FC<ValidationErrorDialogProps> = ({
  open,
  errors,
  onClose,
  title = "Errores de Validación"
}) => {
  const errorEntries = Object.entries(errors);
  const errorCount = errorEntries.length;

  if (errorCount === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      style={{ width: '500px', maxWidth: '90vw' }}
      header={
        <Bar
          startContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="message-error" style={{ color: 'var(--sapNegativeColor)' }} />
              <Title>{title}</Title>
            </div>
          }
        />
      }
      footer={
        <Bar
          endContent={
            <Button design="Emphasized" onClick={onClose}>
              Entendido
            </Button>
          }
        />
      }
    >
      <div style={{ padding: '1rem' }}>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Se encontraron <strong>{errorCount}</strong> {errorCount === 1 ? 'error' : 'errores'} en el formulario:
        </p>
        
        <List>
          {errorEntries.map(([field, message], index) => (
            <ListItemStandard
              key={index}
              description={message}
              style={{
                borderLeft: '3px solid var(--sapNegativeColor)',
                marginBottom: '0.5rem',
                backgroundColor: '#fff5f5'
              }}
            >
              <strong>{formatFieldName(field)}</strong>
            </ListItemStandard>
          ))}
        </List>
      </div>
    </Dialog>
  );
};

// Función helper para formatear nombres de campos
const formatFieldName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    IDETIQUETA: 'ID Etiqueta',
    IDSOCIEDAD: 'ID Sociedad',
    IDCEDI: 'ID Cedi',
    ETIQUETA: 'Etiqueta',
    INDICE: 'Índice',
    COLECCION: 'Colección',
    SECCION: 'Sección',
    SECUENCIA: 'Secuencia',
    IMAGEN: 'Imagen',
    ROUTE: 'Ruta',
    DESCRIPCION: 'Descripción',
    IDVALOR: 'ID Valor',
    VALOR: 'Valor',
    IDVALORPA: 'ID Valor Padre',
    ALIAS: 'Alias',
    parent: 'Etiqueta Padre',
    etiqueta: 'Etiqueta',
    indice: 'Índice',
    coleccion: 'Colección',
    seccion: 'Sección',
    secuencia: 'Secuencia',
    imagen: 'Imagen',
    ruta: 'Ruta',
    descripcion: 'Descripción',
  };

  return fieldNames[field] || field;
};

export default ValidationErrorDialog;