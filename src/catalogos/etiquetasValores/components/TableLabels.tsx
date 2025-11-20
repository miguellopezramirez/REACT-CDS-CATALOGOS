// src/catalogos/etiquetasValores/components/TableLabels.tsx

import { AnalyticalTable, AnalyticalTableSelectionMode, Tokenizer, Token, AnalyticalTableHooks } from '@ui5/webcomponents-react';
import { TableParentRow, TableSubRow } from '../services/labelService';
import { useMemo } from 'react';
import { Title } from '@ui5/webcomponents-react';
import { setLabels } from '../store/labelStore';

interface TableLabelsProps {
  data: TableParentRow[];
  onSelectionChange?: (labels: TableParentRow[]) => void;
  onValorSelectionChange?: (valores: TableSubRow[], parent: TableParentRow | null) => void;
}

// Columnas para la tabla principal (Catálogos)
const parentColumns = [
  { Header: "Etiqueta", accessor: "etiqueta" },
  { Header: "IDETIQUETA", accessor: "idetiqueta" },
  { Header: "IDSOCIEDAD", accessor: "idsociedad" },
  { Header: "COLECCION", accessor: "coleccion" },
  { Header: "SECCION", accessor: "seccion" },
  { Header: "DESCRIPCION", accessor: "descripcion" },
];

// Columnas para la sub-tabla (Valores)
const childColumns = [
  { Header: "ID VALOR", accessor: "idvalor" },
  { Header: "VALOR", accessor: "valor" },
  { Header: "ID VALOR PADRE", accessor: "idvalorpa" },
  { Header: "ALIAS", accessor: "alias" },
  { Header: "SECUENCIA", accessor: "secuencia" },
  {
    Header: "ÍNDICE",
    accessor: "indice",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => {
      const valueStr = (typeof value === 'string' && value) ? value : '';
      if (!valueStr) return null;
      const indices = valueStr.split(',').filter(v => v.trim() !== '');

      return (
        <Tokenizer title={valueStr} style={{ width: '100%', padding: '0.25rem 0' }}>
          {indices.map((indice, index) => (
            <Token key={index} text={indice.trim()} />
          ))}
        </Tokenizer>
      );
    }
  },
  { Header: "DESCRIPCION", accessor: "descripcion" },
];

const TableLabels = ({ data, onSelectionChange, onValorSelectionChange }: TableLabelsProps) => {

  // Transformar data para evitar que AnalyticalTable use 'subRows' automáticamente (evita ghost rows)
  const tableData = useMemo(() => {
    return data.map(row => ({
      ...row,
      // Renombramos subRows a values para uso interno, y dejamos subRows undefined o vacío para la tabla
      values: row.subRows,
      subRows: undefined
    }));
  }, [data]);

  // Configuración para mantener el estado de expansión y selección
  const reactTableOptions = useMemo(() => ({
    autoResetExpanded: false,
    getRowId: (row: any) => {
      if (row.idetiqueta) {
        return `parent-${row.idetiqueta}`;
      }
      return `child-${row.idvalor}`;
    }
  }), []);

  const handleChildSelect = (selectedValores: TableSubRow[], parentData: TableParentRow) => {
    // 1. Actualizar datos globales (Store)
    // NOTA: Ahora permitimos selección múltiple real, incluso a través de catálogos si se desea,
    // pero para mantener consistencia con la UI (que muestra valores de un padre), 
    // actualizamos el estado global de selección.

    const updatedData = data.map(row => {
      let newSubRows = row.subRows;

      if (row.idetiqueta === parentData.idetiqueta) {
        // Es el padre de los hijos seleccionados
        const selectedIds = new Set(selectedValores.map(v => v.idvalor));
        newSubRows = row.subRows.map(sub => ({
          ...sub,
          isSelected: selectedIds.has(sub.idvalor)
        }));
      }
      // YA NO limpiamos la selección de otros padres para permitir multi-selección global si fuera necesario,
      // o simplemente para no borrar el estado visual si el usuario colapsa/expande.
      // Si el usuario quiere borrar, tendrá que deseleccionar.

      return { ...row, subRows: newSubRows };
    });

    // Actualizar Store
    setLabels(updatedData);

    // Calcular TODOS los valores seleccionados en TODA la tabla para pasarlos al padre
    const allSelectedValores: TableSubRow[] = [];
    updatedData.forEach(row => {
      row.subRows.forEach(sub => {
        if (sub.isSelected) {
          allSelectedValores.push(sub);
        }
      });
    });

    // Notificar al componente padre con TODOS los seleccionados
    onValorSelectionChange?.(allSelectedValores, parentData);

    // Opcional: Si seleccionamos hijos, ¿limpiamos padres? 
    // El usuario dijo "si selecciono valor se cierra tabla" -> NO.
    // Dijo "checklist solo deberia marcarlo como seleccionado".
    // Mantengamos la exclusividad de acciones: si hay valores seleccionados, no hay padres seleccionados para acciones.
    onSelectionChange?.([]);
  };

  const handleParentSelect = (selectedParents: TableParentRow[]) => {
    const selectedIds = new Set(selectedParents.map(p => p.idetiqueta));

    const updatedData = data.map(row => {
      const isSelected = selectedIds.has(row.idetiqueta);

      // Si seleccionamos un padre, deseleccionamos sus hijos?
      // El usuario quiere poder borrar varios. Si selecciono padre, ¿borro hijos?
      // Generalmente son acciones separadas.
      // Vamos a deseleccionar hijos para evitar confusión en los botones de acción.
      const newSubRows = row.subRows.map(sub => ({ ...sub, isSelected: false }));

      return { ...row, isSelected, subRows: newSubRows };
    });

    setLabels(updatedData);

    onSelectionChange?.(selectedParents);
    if (selectedParents.length > 0) {
      onValorSelectionChange?.([], null);
    }
  };

  const renderRowSubComponent = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => {
        if (!row || !row.original) {
          return null;
        }

        // Usamos 'values' que es donde movimos la data, o 'subRows' si viniera del original (pero lo renombramos)
        const parentData: TableParentRow = row.original;
        // @ts-ignore
        const values = parentData.values || parentData.subRows || [];

        if (values.length === 0) {
          return (
            <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--sapContent_Background)' }}>
              No hay Valores asociados a esta Etiqueta.
            </div>
          );
        }

        return (
          // stopPropagation para evitar que clics en la subtabla cierren el padre
          <div style={{ padding: '0 1rem 1rem 1rem' }} onClick={(e) => e.stopPropagation()}>
            <Title level='H4' style={{ marginBottom: '0.5rem' }}>Valores para: {parentData.etiqueta}</Title>
            <AnalyticalTable
              data={values as TableSubRow[]}
              columns={childColumns}
              selectionMode={AnalyticalTableSelectionMode.Multiple}
              isTreeTable={false}
              visibleRows={values.length}
              headerRowHeight={44}
              reactTableOptions={{
                getRowId: (row: any) => `child-${row.idvalor}`
              }}
              tableHooks={tableHooks}
              onRowSelect={(e) => {
                if (!e || !e.detail) return;
                const { selectedRowIds, rowsById } = e.detail;
                const selectedRows = Object.keys(selectedRowIds).map(id => rowsById[id]);

                // Siempre pasamos todos los seleccionados DE ESTA SUBTABLA
                const selectedValores = selectedRows.map(r => r.original as TableSubRow);

                // Llamamos al handler que actualizará el store y notificará al padre
                // Nota: handleChildSelect ahora se encarga de mezclar con otras selecciones si las hubiera
                handleChildSelect(selectedValores, parentData);
              }}
            />
          </div>
        );
      },
    [data, onSelectionChange, onValorSelectionChange]
  );

  const tableHooks = [AnalyticalTableHooks.useManualRowSelect('isSelected')];

  return (
    <AnalyticalTable
      data={tableData} // Usamos la data transformada
      columns={parentColumns}
      isTreeTable={false}
      selectionMode={AnalyticalTableSelectionMode.Multiple}
      renderRowSubComponent={renderRowSubComponent}
      tableHooks={tableHooks}
      reactTableOptions={reactTableOptions}

      /* onRowClick eliminado para que la expansión solo ocurra al dar clic en la flecha (caret) */

      onRowSelect={(e) => {
        if (!e || !e.detail) return;
        const { selectedRowIds, rowsById } = e.detail;
        const selectedParents = Object.keys(selectedRowIds).map(id => rowsById[id].original as TableParentRow);

        handleParentSelect(selectedParents);
      }}
    />
  );
};

export default TableLabels;