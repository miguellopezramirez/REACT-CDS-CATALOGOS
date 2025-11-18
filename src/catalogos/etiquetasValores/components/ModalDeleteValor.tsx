import { useState } from 'react';
import { Button, MessageBox } from '@ui5/webcomponents-react';
import { TableSubRow, TableParentRow } from '../services/labelService'; 

interface ModalDeleteValorProps {
    compact?: boolean;
    valor: TableSubRow | null; 
    parentLabel: TableParentRow | null;
    onDeleteConfirm: (valor: TableSubRow, parent: TableParentRow) => void;
}

function ModalDeleteValor({ compact = false, valor, parentLabel, onDeleteConfirm }: ModalDeleteValorProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = (event: any) => {
        // Detectamos la acción de forma segura
        const action = event?.detail?.action || event?.detail || event;

        console.log("DEBUG - Acción recibida del Modal (Valor):", action);

        // Verificamos si es "OK" (El botón de confirmar)
        if (action === "OK" || action === "Confirm") {
            if (valor && parentLabel) {
                console.log("DEBUG - Borrando valor:", valor.valor, "de etiqueta:", parentLabel.etiqueta);
                onDeleteConfirm(valor, parentLabel);
            }
        }
        
        // Cerramos el modal SIEMPRE
        setOpen(false);
    };

    // Solo habilitado si hay un valor (hijo) seleccionado
    const isDisabled = !valor;

    return (
        <>
            <Button 
                design="Negative"
                icon="delete"
                accessibleName="Eliminar Valor"
                onClick={handleOpen}
                disabled={isDisabled} 
            >
                {!compact && 'Eliminar Valor'}
            </Button>

            <MessageBox
                open={open}
                onClose={handleClose}
                type={"Confirm" as any}
                titleText="Confirmar Eliminación de Valor" 
            >
                {valor && parentLabel 
                    ? `¿Seguro que quieres eliminar el Valor: "${valor.valor}" del Catálogo "${parentLabel.etiqueta}"?` 
                    : ''}
            </MessageBox>
        </>
    );
}

export default ModalDeleteValor;