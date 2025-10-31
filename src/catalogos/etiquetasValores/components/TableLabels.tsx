// TableLables.tsx
import { useEffect, useState } from 'react';
import { useIndeterminateRowSelection } from '@ui5/webcomponents-react/AnalyticalTableHooks';

import { AnalyticalTable, AnalyticalTableSelectionMode } from '@ui5/webcomponents-react';
import { fetchLabels, TableParentRow } from '../services/labelService';

const tableHooks = [useIndeterminateRowSelection()]; // should be memoized

const columns = [
  {
    Header: "Etiqueta/Valor",
    accessor: "etiqueta",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ row, cell: { value } }: any) => {
      return row.original.valor || value;
    }
  },
    {

    Header: "IDETIQUETA/IDEVALOR",
    accessor: "idetiqueta",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ row, cell: { value } }: any) => {
      return row.original.idvalor || value;
    }
  },
  {
    Header: "IDSOCIEDAD",
    accessor: "idsociedad",
  },
  {
    Header: "VALOR PADRE",
    accessor: "idvalorpa",
  },
  {
    Header: "IDCEDI",
    accessor: "idcedi",
  },
  
  {
    Header: "INDICE",
    accessor: "indice",
  },
  {
    Header: "COLECCION",
    accessor: "coleccion",
  },{
    Header: "SECCION",
    accessor: "seccion",
  },{
    Header: "SECUENCIA",
    accessor: "secuencia",
  },{
    Header: "IMAGEN",
    accessor: "imagen",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => (value ? <img src={value} style={{ height: "40px" }} /> : null)
  },{
    Header: "ROUTE",
    accessor: "ruta",
  },{
    Header: "DESCRIPCION",
    accessor: "descripcion"
  }
];

function TableLabels(){
    const [data, setData] = useState<TableParentRow[]>([]);

    useEffect(() => {
        fetchLabels().then((transformedData) => {
            setData(transformedData);
        });
    }, []);

    return <>
         
        <AnalyticalTable
        selectionMode={AnalyticalTableSelectionMode.Multiple}
        data={data}
        columns={columns}
        isTreeTable
        tableHooks={tableHooks}
        reactTableOptions={{ selectSubRows: true }}
        />
    </>
}

export default TableLabels;
