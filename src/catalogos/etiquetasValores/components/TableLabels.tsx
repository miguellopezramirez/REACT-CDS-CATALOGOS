import { useEffect, useState } from 'react';
import { AnalyticalTable, AnalyticalTableHooks, AnalyticalTableSelectionMode, Button } from '@ui5/webcomponents-react';
import { fetchLabels, TableParentRow } from '../services/labelService';
import ModalUpdateCatalogo from './ModalUpdateCatalogo';
import { subscribe, getLabels, setLabels } from '../store/labelStore';


const tableHooks = [AnalyticalTableHooks.useManualRowSelect('isSelected')]; // should be memoized
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
    const [selectedLabel, setSelectedLabel] = useState<TableParentRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleStoreChange = () => {
            setData(getLabels());
        };

        const unsubscribe = subscribe(handleStoreChange);

        fetchLabels().then((transformedData) => {
            setLabels(transformedData.map(item => ({ ...item, isSelected: false })));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleUpdate = (updatedLabel: TableParentRow) => {
        const currentData = getLabels();
        const updatedData = currentData.map(row => {
            if (row.idetiqueta === updatedLabel.idetiqueta) {
                return { ...row, ...updatedLabel };
            }
            return row;
        });
        setLabels(updatedData);
    };

    const handleSelectionChange = (e: any) => {
        const selectedFlatRows = e.detail.selectedFlatRows;
        if (selectedFlatRows && selectedFlatRows.length > 0) {
            const selectedRow = selectedFlatRows[0].original;
            const updatedData = data.map(row => ({
                ...row,
                isSelected: row.idetiqueta === selectedRow.idetiqueta
            }));
            setLabels(updatedData);
            setSelectedLabel(selectedRow);
        } else {
            const updatedData = data.map(row => ({
                ...row,
                isSelected: false
            }));
            setLabels(updatedData);
            setSelectedLabel(null);
        }
    };

    return <>
        <AnalyticalTable
        selectionMode={AnalyticalTableSelectionMode.Multiple}
        data={data}
        columns={columns}
        isTreeTable
        onRowSelect={handleSelectionChange}
        reactTableOptions={{ selectSubRows: true }}
        withRowHighlight
        highlightField="status"
        tableHooks={tableHooks}
        />
    </>
}

export default TableLabels;
