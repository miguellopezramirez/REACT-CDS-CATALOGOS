import { useState, useEffect } from "react";
import TableLabels from "../components/TableLabels";
import {
  Title,
  Toolbar,
  Input,
  InputDomRef,
  ToolbarSpacer,
} from "@ui5/webcomponents-react";
import ModalNewCatalogo from "../components/ModalNewCatalogo";
import ModalNewValor from "../components/ModalNewValor";
import ModalDeleteCatalogo from "../components/ModalDeleteCatalogo";
import ModalSaveChanges from "../components/ModalSaveChanges";
// import ModalUpdateCatalogo from "../components/ModalUpdateCatalogo";
import { fetchLabels, TableParentRow } from "../services/labelService";
import { setLabels } from "../store/labelStore";
import { MessageStrip } from "@ui5/webcomponents-react";

export default function Catalogos() {
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<TableParentRow | null>(
    null
  );
  const [labels, setLocalLabels] = useState<TableParentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLabels().then((transformedData) => {
      setLabels(transformedData);
      setLocalLabels(transformedData);
    });
  }, []);

  const handleSave = () => {
    setSaveMessage("Datos guardados correctamente.");
    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  const filteredLabels = labels.filter((label) => {
    const term = searchTerm.toLowerCase();
    return (
      label.etiqueta.toLowerCase().includes(term) ||
      label.descripcion.toLowerCase().includes(term) ||
      label.coleccion.toLowerCase().includes(term) ||
      label.seccion.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Title level="H1" size="H2" style={{ marginBottom: "1rem" }}>
        Catalagos y Valores
      </Title>
      <Toolbar
        style={{
          padding: "0.5rem",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <ModalNewCatalogo />
        <ModalNewValor />
        <ModalDeleteCatalogo />
        {/* <ModalUpdateCatalogo label={selectedLabel} /> */}
        <ToolbarSpacer />
        <ModalSaveChanges onSave={handleSave} />
      </Toolbar>
      <Input
        placeholder="Buscar etiqueta, colección o descripción..."
        showClearIcon
        onInput={(e) =>
          setSearchTerm((e.target as unknown as InputDomRef).value)
        }
        style={{
          marginBottom: "1rem",
          width: "100%",
          maxWidth: "500px",
        }}
      />
      {saveMessage && (
        <MessageStrip design="Positive" style={{ marginBottom: "1rem" }}>
          {saveMessage}
        </MessageStrip>
      )}
      <TableLabels onSelectionChange={setSelectedLabel} data={filteredLabels} />
    </div>
  );
}
