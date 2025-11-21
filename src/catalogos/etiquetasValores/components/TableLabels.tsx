// src/catalogos/etiquetasValores/components/TableLabels.tsx

import { AnalyticalTable, AnalyticalTableSelectionMode, Tokenizer, Token, AnalyticalTableHooks } from '@ui5/webcomponents-react';
import { TableParentRow, TableSubRow } from '../services/labelService';
import { useMemo, useRef, useLayoutEffect } from 'react';
import { Title } from '@ui5/webcomponents-react';
import { setLabels } from '../store/labelStore';

interface TableLabelsProps {
  data: TableParentRow[];
  onSelectionChange?: (labels: TableParentRow[]) => void;
  onValorSelectionChange?: (valores: TableSubRow[], parent: TableParentRow | null) => void;
  initialExpanded?: Record<string, boolean>;
  onExpandChange?: (expanded: Record<string, boolean>) => void;
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

// --- WRAPPER CON ALTURA MATEMÁTICA EXACTA ---
const SubTableWrapper = ({ values, parentData, handleChildSelectInternal }: { values: TableSubRow[], parentData: TableParentRow, handleChildSelectInternal: (selectedValores: TableSubRow[], parentData: TableParentRow) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const ROW_HEIGHT = 44;
  const HEADER_HEIGHT = 44;
  const TITLE_SPACE = 40;

  const maxVisibleRows = 10;
  const rowsToShow = values.length > maxVisibleRows ? maxVisibleRows : values.length;
  const calculatedHeight = (rowsToShow * ROW_HEIGHT) + HEADER_HEIGHT + TITLE_SPACE + 10;

  useLayoutEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [values.length]);

  const tableHooks = [AnalyticalTableHooks.useManualRowSelect('isSelected')];

  return (
    <div
      ref={containerRef}
      style={{
        height: `${calculatedHeight}px`,
        padding: '0 1rem 1rem 1rem',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Title level='H5' style={{ marginBottom: '0.5rem', height: '26px' }}>
        Valores para: {parentData.etiqueta}
      </Title>

      <div style={{ height: `calc(100% - 30px)` }}>
        <AnalyticalTable
          data={values}
          columns={childColumns}
          selectionMode={AnalyticalTableSelectionMode.Multiple}
          isTreeTable={false}
          minRows={1}
          visibleRows={rowsToShow}
          headerRowHeight={HEADER_HEIGHT}
          rowHeight={ROW_HEIGHT}
          withRowHighlight={true}
          reactTableOptions={{
            // AQUÍ IMPORTANTE: Usar un ID único para las filas de la subtabla
            getRowId: (row: any) => `sub-child-${row.idvalor}`
          }}
          tableHooks={tableHooks}
          onRowSelect={(e) => {
            if (!e || !e.detail) return;
            const { selectedRowIds, rowsById } = e.detail;
            const selectedRows = Object.keys(selectedRowIds).map(id => rowsById[id]);
            const selectedValores = selectedRows.map(r => r.original as TableSubRow);
            handleChildSelectInternal(selectedValores, parentData);
          }}
        />
      </div>
    </div>
  );
};

const TableLabels = ({ data, onSelectionChange, onValorSelectionChange, initialExpanded, onExpandChange }: TableLabelsProps) => {

  const dataRef = useRef(data);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onValorSelectionChangeRef = useRef(onValorSelectionChange);

  dataRef.current = data;
  onSelectionChangeRef.current = onSelectionChange;
  onValorSelectionChangeRef.current = onValorSelectionChange;

  const tableData = useMemo(() => {
    return data.map(row => ({
      ...row,
      values: row.subRows,
      subRows: undefined
    }));
  }, [data]);

  const reactTableOptions = useMemo(() => ({
    autoResetExpanded: false,
    initialState: { expanded: initialExpanded || {} },

    getSubRows: (row: any) => row.values,

    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    getRowId: (row: any) => {
      // Primero verificamos si es un hijo (tiene idvalor)
      if (row.idvalor) {
        return `child-${row.idvalor}`;
      }
      // Si no, asumimos que es padre (tiene idetiqueta y es parent)
      return `parent-${row.idetiqueta}`;
    }
    // -------------------------------
  }), [initialExpanded]);

  const handleChildSelectInternal = (selectedValores: TableSubRow[], parentData: TableParentRow) => {
    const currentData = dataRef.current;
    const updatedData = currentData.map(row => {
      let newSubRows = row.subRows;
      if (row.idetiqueta === parentData.idetiqueta) {
        const selectedIds = new Set(selectedValores.map(v => v.idvalor));
        newSubRows = row.subRows.map(sub => ({
          ...sub,
          isSelected: selectedIds.has(sub.idvalor)
        }));
      }
      return { ...row, subRows: newSubRows };
    });

    setLabels(updatedData);

    const allSelectedValores: TableSubRow[] = [];
    updatedData.forEach(row => {
      row.subRows.forEach(sub => {
        if (sub.isSelected) {
          allSelectedValores.push(sub);
        }
      });
    });

    onValorSelectionChangeRef.current?.(allSelectedValores, parentData);
    onSelectionChangeRef.current?.([]);
  };

  const handleParentSelect = (selectedParents: TableParentRow[]) => {
    const selectedIds = new Set(selectedParents.map(p => p.idetiqueta));
    const updatedData = data.map(row => {
      const isSelected = selectedIds.has(row.idetiqueta);
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
        if (!row || !row.original) return null;
        const parentData: TableParentRow = row.original;
        // @ts-ignore
        const values = parentData.values || parentData.subRows || [];

        if (values.length === 0) {
          return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              No hay Valores asociados.
            </div>
          );
        }

        return (
          <SubTableWrapper
            key={`subwrapper-${parentData.idetiqueta}`}
            values={values as TableSubRow[]}
            parentData={parentData}
            handleChildSelectInternal={handleChildSelectInternal}
          />
        );
      },
    []
  );

  const tableHooks = [AnalyticalTableHooks.useManualRowSelect('isSelected')];

  return (
    <AnalyticalTable
      data={tableData}
      columns={parentColumns}
      isTreeTable={false}
      selectionMode={AnalyticalTableSelectionMode.Multiple}
      renderRowSubComponent={renderRowSubComponent}
      tableHooks={tableHooks}
      withRowHighlight={true}
      reactTableOptions={reactTableOptions}
      overscanCount={5}

      onRowExpandChange={(e: any) => {
        if (onExpandChange && e.detail) {
          const { row, isExpanded } = e.detail;
          if (row && row.id) {
            onExpandChange({ [row.id]: isExpanded });
          }
        }
      }}

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