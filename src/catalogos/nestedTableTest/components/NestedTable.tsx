// src/catalogos/nestedTableTest/components/NestedTable.tsx

// FIC: Se utiliza solo el import principal, eliminando la dependencia de useManualExpandedState.
import { AnalyticalTable, AnalyticalTableSelectionMode, Tokenizer, Token } from '@ui5/webcomponents-react';
import { TableParentRow, TableSubRow } from '../../etiquetasValores/services/labelService';
import { useMemo } from 'react';
import { Title } from '@ui5/webcomponents-react';

// FIC: ELIMINADA: import { useManualExpandedState } from '...';

interface NestedTableProps {
  data: TableParentRow[];
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

const NestedTable = ({ data }: NestedTableProps) => {

    const renderRowSubComponent = useMemo(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row: any) => {
            if (!row || !row.original) {
                return null;
            }
            
            const parentData: TableParentRow = row.original;
            const values = parentData.subRows || [];

            if (values.length === 0) {
                return (
                    <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--sapContent_Background)' }}>
                        No hay Valores asociados a esta Etiqueta.
                    </div>
                );
            }

            return (
                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                    <Title level='H4' style={{ marginBottom: '0.5rem' }}>Valores para: {parentData.etiqueta}</Title>
                    <AnalyticalTable
                        data={values as TableSubRow[]}
                        columns={childColumns}
                        selectionMode={AnalyticalTableSelectionMode.None}
                        isTreeTable={false}
                        visibleRows={values.length}
                        headerRowHeight={44}
                        tableHooks={[]}
                    />
                </div>
            );
          },
        []
    );

  return (
    <AnalyticalTable
      data={data}
      columns={parentColumns}
      isTreeTable={false}
      selectionMode={AnalyticalTableSelectionMode.None}
      renderRowSubComponent={renderRowSubComponent}
      
      // FIC: Se elimina el array tableHooks. La funcionalidad de expansión funciona sin él en este setup.
      tableHooks={[]} 
      
      onRowClick={(e) => {
        // La lógica de expansión se maneja directamente aquí.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e.detail.row as any).toggleRowExpanded();
      }}
    />
  );
};

export default NestedTable;