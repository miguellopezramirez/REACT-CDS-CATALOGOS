
import { Button, FlexBox, FlexBoxJustifyContent } from '@ui5/webcomponents-react';
import { Modals } from '@ui5/webcomponents-react/Modals';
function ModalUpdateCatalogo(){
    

    return <>

        <Button
        design="Attention"
        icon = "update"
        onClick={() => {
        const {
          close
        } = Modals.showDialog({
          headerText: 'Actualiza el Catalogo',
          children: "I'm a Dialog!",
          footer: <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{
            paddingBlock: '0.25rem'
          }}>
                  <Button onClick={() => close()}>Close</Button>{' '}
                </FlexBox>
        });
      }}>
          Actualizar Catalogo
        </Button>
      </>
        
}

export default ModalUpdateCatalogo;
