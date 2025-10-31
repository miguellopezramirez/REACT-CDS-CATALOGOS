
import { Button, MessageBoxType, } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
function ModalUpdateCatalogo(){
    
    return <>
        <Button 
        design="Negative"
        icon="delete"
        onClick={() => {
        Modals.showMessageBox({
          type: MessageBoxType.Confirm,
          children: '¿Seguro que quieres eliminar el Catalogo?'
        });
      }}>
          Eliminar Catalogo
        </Button>
      </>;
        
}

export default ModalUpdateCatalogo;
