// src/catalogos/etiquetasValores/pages/Catalogos.tsx
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
import ModalDeleteValor from "../components/ModalDeleteValor";
import ModalSaveChanges from "../components/ModalSaveChanges";
import ModalUpdateCatalogo from "../components/ModalUpdateCatalogo";
import ModalUpdateValor from "../components/ModalUpdateValor";
import { fetchLabels, TableParentRow, TableSubRow } from "../services/labelService";
import { setLabels, getLabels, subscribe, addOperation } from "../store/labelStore";
import { MessageStrip } from "@ui5/webcomponents-react";

export default function Catalogos() {
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<TableParentRow[]>([]);
  const [labels, setLocalLabels] = useState<TableParentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSmall, setIsSmall] = useState(false);
  const [selectedValor, setSelectedValor] = useState<TableSubRow | null>(null);
  const [selectedValorParent, setSelectedValorParent] = useState<TableParentRow | null>(null);


  useEffect(() => {
    fetchLabels().then((transformedData) => {
      setLabels(transformedData);
      setLocalLabels(transformedData);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLocalLabels(getLabels());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 970px)');
    const onChange = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    setIsSmall(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const handleSave = () => {
    setSaveMessage("Datos guardados correctamente.");
    fetchLabels().then((transformedData) => {
      setLabels(transformedData.map(item => ({ ...item, isSelected: false })));
      setLocalLabels(transformedData.map(item => ({ ...item, isSelected: false })));
    });
    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  // Handler para marcar la etiqueta como eliminada
  const handleDeleteLabel = (label: TableParentRow) => {
    // Agregar la operación DELETE al store para el guardado por lotes
    addOperation({
      collection: 'labels',
      action: 'DELETE',
      payload: {
        id: label.idetiqueta,
      }
    });
    // Limpiar la selección actual para deshabilitar el botón y no afectar otras operaciones
    setSelectedLabels([]);
  };

  const handleDeleteValor = (valor: TableSubRow, parent: TableParentRow) => {
    addOperation({
      collection: 'values',
      action: 'DELETE',
      payload: {
        id: valor.idvalor,
        IDETIQUETA: parent.idetiqueta,
      }
    });
    setSelectedValor(null);
    setSelectedValorParent(null);
  };

  const filteredLabels = labels.filter((label) => {
    const term = searchTerm.toLowerCase();
    return (
      label.etiqueta?.toLowerCase().includes(term) ||
      label.descripcion?.toLowerCase().includes(term) ||
      label.coleccion?.toLowerCase().includes(term) ||
      label.seccion?.toLowerCase().includes(term)
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
        <ModalNewCatalogo compact={isSmall} />
        <ModalNewValor compact={isSmall} />
        <ModalDeleteCatalogo label={selectedLabels[0]} compact={isSmall} onDeleteConfirm={handleDeleteLabel} />
        <ModalDeleteValor compact={isSmall} valor={selectedValor} parentLabel={selectedValorParent} onDeleteConfirm={handleDeleteValor} />
        <ModalUpdateCatalogo label={selectedLabels.length === 1 ? selectedLabels[0] : null} compact={isSmall} />
        <ModalUpdateValor
          compact={isSmall}
          valorToEdit={selectedValor}
          parentLabel={selectedValorParent}
        />
        <ToolbarSpacer />
        <ModalSaveChanges onSave={handleSave} compact={isSmall} />
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
      <TableLabels
        onSelectionChange={setSelectedLabels}
        onValorSelectionChange={(valor, parent) => {
          setSelectedValor(valor);
          setSelectedValorParent(parent);
        }}
        data={filteredLabels} />
    </div>
  );
}