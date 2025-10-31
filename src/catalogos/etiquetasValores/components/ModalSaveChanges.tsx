
import { Button, MessageBoxType, } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
function ModalUpdateCatalogo(){
    
    return <>
        <Button 
        design="Default"
        icon="save"
        onClick={() => {
        Modals.showMessageBox({
          type: MessageBoxType.Confirm,
          children: '¿Seguro que quieres guardar los cambios?'
        });
      }}>
          Guardar cambios
        </Button>
      </>;
        
}

export default ModalUpdateCatalogo;
