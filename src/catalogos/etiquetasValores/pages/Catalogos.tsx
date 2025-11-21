// src/catalogos/etiquetasValores/pages/Catalogos.tsx

import { useState, useEffect, useMemo } from "react";
import {
  Title,
  Toolbar,
  Input,
  InputDomRef,
  ToolbarSpacer,
  MessageStrip
} from "@ui5/webcomponents-react";
import ModalNewCatalogo from "../components/ModalNewCatalogo";
import ModalNewValor from "../components/ModalNewValor";
import ModalDeleteCatalogo from "../components/ModalDeleteCatalogo";
import ModalDeleteValor from "../components/ModalDeleteValor";
import ModalSaveChanges from "../components/ModalSaveChanges";
import ModalUpdateCatalogo from "../components/ModalUpdateCatalogo";
import ModalUpdateValor from "../components/ModalUpdateValor";
import { fetchLabels, TableParentRow, TableSubRow } from "../services/labelService";
import { getLabels, subscribe, addOperation } from "../store/labelStore";
import TableLabels from "../components/TableLabels";

export default function Catalogos() {
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<TableParentRow[]>([]);
  const [labels, setLocalLabels] = useState<TableParentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSmall, setIsSmall] = useState(false);
  const [selectedValores, setSelectedValores] = useState<TableSubRow[]>([]);
  const [selectedValorParent, setSelectedValorParent] = useState<TableParentRow | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // --- 1. ESTADO NUEVO PARA CONTROLAR LA VERSIÓN DE LA TABLA ---
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    setLocalLabels(getLabels());
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


  // --- 2. HANDLE SAVE SIMPLIFICADO Y POTENTE ---
  const handleSave = async () => {
    setSaveMessage("Datos guardados correctamente.");

    // 1. Cargar los datos nuevos
    await fetchLabels();

    // 2. Limpiar selecciones
    setSelectedLabels([]);
    setSelectedValores([]);
    setSelectedValorParent(null);

    // 3. LA SOLUCIÓN NUCLEAR:
    // Al cambiar este número, React destruye la tabla actual y crea una nueva.
    // Esto fuerza a que la tabla recalcule alturas desde CERO, sin heredar errores visuales.
    // Es el equivalente programático a "apagar y volver a encender" el componente.
    setTableRefreshKey(prev => prev + 1);

    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };
  // ------------------------------------------------

  const handleDeleteConfirmLabel = () => {
    selectedLabels.forEach(label => {
      addOperation({
        collection: 'labels',
        action: 'DELETE',
        payload: {
          id: label.idetiqueta,
        }
      });
    });
    setSelectedLabels([]);
  };

  const handleDeleteConfirmValor = () => {
    if (!selectedValorParent) return;

    selectedValores.forEach(valor => {
      addOperation({
        collection: 'values',
        action: 'DELETE',
        payload: {
          id: valor.idvalor,
          IDETIQUETA: selectedValorParent.idetiqueta,
        }
      });
    });
    setSelectedValores([]);
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
  const preparedData = useMemo(() => {
    return filteredLabels.map(row => {
      // Construimos el ID tal como lo usa la tabla internamente
      const rowId = `parent-${row.idetiqueta}`;

      // Verificamos si este ID está marcado como verdadero en expandedRows
      const isRowExpanded = !!expandedRows[rowId];

      return {
        ...row,
        // Forzamos la propiedad isExpanded en el dato mismo.
        // React Table leerá esto al inicializarse.
        isExpanded: isRowExpanded
      };
    });
  }, [filteredLabels, expandedRows]);

  const handleExpandChange = (changedExpanded: Record<string, boolean>) => {
    setExpandedRows(prev => ({ ...prev, ...changedExpanded }));
  };

  return (
    <div>
      <Title level="H1" size="H2" style={{ marginBottom: "1rem" }}>
        Catálogos y Valores
      </Title>
      <Toolbar
        style={{
          padding: "0.5rem",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <ModalNewCatalogo compact={isSmall} />
        <ModalNewValor
          compact={isSmall}
          preSelectedParent={selectedLabels.length === 1 ? selectedLabels[0] : null}
        />

        <ModalDeleteCatalogo
          label={selectedLabels.length > 0 ? selectedLabels[0] : null}
          compact={isSmall}
          onDeleteConfirm={handleDeleteConfirmLabel}
        />
        <ModalDeleteValor
          compact={isSmall}
          valor={selectedValores.length > 0 ? selectedValores[0] : null}
          parentLabel={selectedValorParent}
          onDeleteConfirm={handleDeleteConfirmValor}
        />

        <ModalUpdateCatalogo
          label={selectedLabels.length === 1 ? selectedLabels[0] : null}
          compact={isSmall}
        />
        <ModalUpdateValor
          compact={isSmall}
          valorToEdit={selectedValores.length === 1 ? selectedValores[0] : null}
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

      {/* --- 3. AQUÍ USAMOS LA KEY MÁGICA --- */}
      <TableLabels
        key={tableRefreshKey} // Tu solución del remount (NO LA QUITES)
        data={preparedData}   // <--- CAMBIO AQUÍ: Usamos los datos preparados
        initialExpanded={expandedRows}
        onExpandChange={handleExpandChange}
        onSelectionChange={setSelectedLabels}
        onValorSelectionChange={(valores, parent) => {
          setSelectedValores(valores || []);
          setSelectedValorParent(parent);
        }}
      />
    </div>
  );
}