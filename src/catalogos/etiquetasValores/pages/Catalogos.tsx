// Catalogos.tsx
import TableLabels from "../components/TableLabels";
import { Title } from '@ui5/webcomponents-react/Title';
import ModalNewCatalogo from "../components/ModalNewCatalogo";
import ModalNewValor from "../components/ModalNewValor";
import ModalUpdateCatalogo from "../components/ModalUpdateCatalogo";
import ModalDeleteCatalogo from "../components/ModalDeleteCatalogo";
import ModalSaveChanges from "../components/ModalSaveChanges";




export default function Catalogos() {
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
        <ModalUpdateCatalogo/>
        <ModalDeleteCatalogo/>
        <ModalSaveChanges/>
        <TableLabels/>
      </div>
    );
  }