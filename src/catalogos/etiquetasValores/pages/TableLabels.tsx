// TableLables.tsx
import { useIndeterminateRowSelection } from '@ui5/webcomponents-react/AnalyticalTableHooks';
import { Title } from '@ui5/webcomponents-react/Title';
import { AnalyticalTable, AnalyticalTableSelectionMode } from '@ui5/webcomponents-react';

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
    Cell: ({ cell: { value } }: any) => <img src={value} style={{height: "40px"}} />
  },{
    Header: "ROUTE",
    accessor: "ruta",
  },{
    Header: "DESCRIPCION",
    accessor: "descripcion"
  }
];
const data = [{
    parent: true,
    idsociedad: "1",
    idcedi: "2",
    idetiqueta: "Aplicacion",
    etiqueta: "Aplicaciones",
    indice: "App",
    coleccion: "app",
    seccion: "apps",
    secuencia: 10,
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/App_Store_%28iOS%29.svg/2048px-App_Store_%28iOS%29.svg.png",
    ruta: "/app",
    descripcion: "Aplicaciones del uso de la empresa",
    subRows: [
        {
            idsociedad: "1",
            idcedi: "2",
            idetiqueta: "Aplicacion",
            idvalor: "AppSeguridad",
            idvalorpa: "",
            valor: "Seguridad",
            alias: "seg",
            indice: "seg",
            coleccion: "app",
            seccion: "apps",
            secuencia: 11,
            imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/App_Store_%28iOS%29.svg/2048px-App_Store_%28iOS%29.svg.png",
            ruta: "/Seguridad",
            descripcion: "Aplicación de seguridad de acceso de usuarios",
            
        },
    ],
}];


function TableLabels(){
    return <>
         <Title level="H1">
            Etiquetas
        </Title>
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
