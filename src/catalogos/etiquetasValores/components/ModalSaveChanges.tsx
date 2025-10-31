
import { Button, MessageBox, MessageBoxType, MessageBoxAction } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
import { saveChanges } from '../services/labelService';
import { useState } from 'react';
import { clearStatuses } from '../store/labelStore';

interface ModalSaveChangesProps {
    onSave: () => void;
}

function ModalSaveChanges({ onSave }: ModalSaveChangesProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleSaveChanges = async () => {
        const result = await saveChanges();
        if (result.success) {
            clearStatuses(); // Clear statuses on successful save
            Modals.showMessageBox({
                type: MessageBoxType.Success,
                children: 'Cambios guardados con éxito.'
            });
            if (onSave) {
                onSave();
            }
        } else {
            Modals.showMessageBox({
                type: MessageBoxType.Error,
                children: `Error al guardar los cambios: ${result.message}`
            });
        }
    };

    return (
        <>
            <Button
                design="Emphasized"
                icon="save"
                onClick={() => setShowConfirmDialog(true)}
            >
                Guardar cambios
            </Button>
            <MessageBox
                open={showConfirmDialog}
                type={MessageBoxType.Confirm}
                
                onClose={(event: any) => {
                    if (event === MessageBoxAction.OK) {
                        console.log("Saving changes...")
                        handleSaveChanges();
                    }
                    setShowConfirmDialog(false);
                }}
            >
                ¿Seguro que quieres guardar los cambios?
            </MessageBox>
        </>
    );
}

export default ModalSaveChanges;
