// src/catalogos/etiquetasValores/components/ModalDeleteCatalogo.tsx

import { Button, MessageBoxType, } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
import { TableParentRow } from '../services/labelService'; // Importar TableParentRow

interface ModalDeleteCatalogoProps {
    compact?: boolean;
    // Nueva prop para la etiqueta seleccionada
    label: TableParentRow | null; 
    // Nueva prop para la función a ejecutar al confirmar la eliminación
    onDeleteConfirm: (label: TableParentRow) => void;
}

function ModalDeleteCatalogo({ compact = false, label, onDeleteConfirm }: ModalDeleteCatalogoProps){

    const handleDelete = () => {
        if (!label) {
            return;
        }

        // Mostrar la modal de confirmación con el nombre de la etiqueta
        // Se añade as any para evitar el error de TS2339, ya que la función devuelve una promesa.
        (Modals.showMessageBox({
          type: MessageBoxType.Confirm,
          children: `¿Seguro que quieres eliminar el Catálogo: ${label.etiqueta} (ID: ${label.idetiqueta})?`
        }) as any).then((result: string) => {
            if (result === 'Confirm') {
                // Si confirma, llamar al handler que agregará la operación al store
                onDeleteConfirm(label); 
            }
        });
    };  

    // Deshabilitar el botón si no hay una etiqueta seleccionada
    const isDisabled = !label;

    return <>
        <Button 
        design="Negative"
        icon="delete"
        accessibleName="Eliminar Catalogo"
        onClick={handleDelete}
        disabled={isDisabled} // Deshabilitar si no hay selección
      >
          {!compact && 'Eliminar Catalogo'}
        </Button>
      </>;

}

export default ModalDeleteCatalogo;