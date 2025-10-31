
import { Button, FlexBox, FlexBoxJustifyContent } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
function ModalNewCatalogo(){
    

    return <>

        <Button
        design="Positive"
        icon = "add"
        onClick={() => {
        const {
          close
        } = Modals.showDialog({
          headerText: 'Agrega una Catalogo',
          children: "I'm a Dialog!",
          footer: <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{
            paddingBlock: '0.25rem'
          }}>
                  <Button onClick={() => close()}>Close</Button>{' '}
                </FlexBox>
        });
      }}>
          Crear Nuevo Catalogo
        </Button>
      </>
        
}

export default ModalNewCatalogo;
