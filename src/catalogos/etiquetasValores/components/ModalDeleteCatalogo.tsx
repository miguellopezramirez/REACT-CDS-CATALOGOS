
import { Button, MessageBoxType, } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';

interface ModalDeleteCatalogoProps {
    compact?: boolean;
}

function ModalDeleteCatalogo({ compact = false }: ModalDeleteCatalogoProps){
    
    return <>
        <Button 
        design="Negative"
        icon="delete"
        accessibleName="Eliminar Catalogo"
        onClick={() => {
        Modals.showMessageBox({
          type: MessageBoxType.Confirm,
          children: '¿Seguro que quieres eliminar el Catalogo?'
        });
      }}>
          {!compact && 'Eliminar Catalogo'}
        </Button>
      </>;
        
}

export default ModalDeleteCatalogo;
