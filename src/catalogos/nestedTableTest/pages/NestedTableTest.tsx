// src/catalogos/nestedTableTest/pages/NestedTableTest.tsx

import { useState, useEffect } from "react";
import { Title, Toolbar, ToolbarSpacer, Input, InputDomRef } from "@ui5/webcomponents-react";
// Importar servicios y store del módulo de Catálogos
import { fetchLabels, TableParentRow } from "../../etiquetasValores/services/labelService";
import { setLabels, getLabels, subscribe } from "../../etiquetasValores/store/labelStore";
// Importar el nuevo componente de tabla
import NestedTable from "../components/NestedTable";

export default function NestedTableTest() {
  const [labels, setLocalLabels] = useState<TableParentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Reutilizar la lógica de carga y suscripción del store de Catálogos/Valores
    // Esto asegura que los datos sean consistentes con la otra página de Catálogos
    fetchLabels().then((transformedData) => {
      setLabels(transformedData);
      setLocalLabels(transformedData);
    });
    
    const unsubscribe = subscribe(() => {
      setLocalLabels(getLabels());
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
        Catálogos y Valores - Prueba de Tablas Anidadas (Subtablas)
      </Title>
      <Toolbar
        style={{
          padding: "0.5rem",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <ToolbarSpacer/>
      </Toolbar>
      
      <Input
        placeholder="Buscar etiqueta, colección o descripción..."
        showClearIcon
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onInput={(e) =>
          setSearchTerm((e.target as unknown as InputDomRef).value)
        }
        style={{
          marginBottom: "1rem",
          width: "100%",
          maxWidth: "500px",
        }}
      />
      <NestedTable data={filteredLabels} />
    </div>
  );
}