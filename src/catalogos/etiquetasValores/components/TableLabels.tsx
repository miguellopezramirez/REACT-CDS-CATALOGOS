// src/catalogos/etiquetasValores/components/TableLabels.tsx

import { useEffect, useState, useRef } from 'react';
// Importación necesaria para mover el popover fuera de la jerarquía de la tabla
import { createPortal } from 'react-dom'; 
import { AnalyticalTable, AnalyticalTableHooks, AnalyticalTableSelectionMode, Button } from '@ui5/webcomponents-react';
import { fetchLabels, TableParentRow } from '../services/labelService';
import { subscribe, getLabels, setLabels, addOperation } from '../store/labelStore';


// Componente para la celda de descripción que usa un Portal para el popover flotante
const DescriptionCellPortal = ({ value }: { value: string }) => {
    const valueStr = value || '';
    const cellRef = useRef<HTMLDivElement>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);

    // Estilos base para la celda (trunca el texto)
    const baseStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'default',
        padding: '0.25rem 0.5rem',
        boxSizing: 'border-box',
    };

    const handleMouseEnter = () => {
        if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            // Captura la posición de la esquina superior derecha de la celda
            setPopoverPosition({
                x: rect.right, 
                y: rect.top,
            });
        }
    };

    const handleMouseLeave = () => {
        setPopoverPosition(null);
    };

    return (
        <div
            ref={cellRef}
            style={baseStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {valueStr}
            
            {/* El Portal: renderiza el popover en el document.body, asegurando que flote libremente */}
            {popoverPosition && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        zIndex: 100000, // Z-index extremadamente alto para superponerse a todo
                        whiteSpace: 'pre-wrap', // Permite que el texto se envuelva y expanda verticalmente
                        overflow: 'visible',
                        width: 'max-content', // El ancho se ajusta al contenido
                        minWidth: '300px', 
                        maxWidth: '400px', // Límite para que no se extienda demasiado
                        height: 'auto',
                        backgroundColor: 'var(--sapBackgroundColor, white)', 
                        border: '1px solid var(--sapField_BorderColor, #888)',
                        boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
                        padding: '0.5rem',
                        
                        // Posiciona el popover con base en la esquina superior derecha de la celda de la tabla
                        left: popoverPosition.x, 
                        top: popoverPosition.y,
                        
                        // Desplazamiento clave: mueve el popover a la izquierda por su propio ancho (100%) y 
                        // un ajuste vertical de -1px para alinearse perfectamente con el borde superior de la celda.
                        // Esto logra la expansión hacia la izquierda, tal como lo solicitaste.
                        transform: 'translate(calc(-100% + 2px), -1px)',
                    }}
                >
                    {valueStr}
                </div>,
                document.body
            )}
        </div>
    );
};


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
    accessor: "descripcion",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // AHORA USA EL COMPONENTE CON PORTAL: DescriptionCellPortal
    Cell: ({ cell: { value } }: any) => <DescriptionCellPortal value={value} /> 
  }
];

interface TableLabelsProps {
    onSelectionChange?: (label: TableParentRow | null) => void;
}

function TableLabels({ onSelectionChange }: TableLabelsProps){
    const [data, setData] = useState<TableParentRow[]>([]);
    // Component state managed by parent

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

    // Component updates are managed by store

    const handleSelectionChange = (e?: CustomEvent<any>) => {
        console.log('handleSelectionChange called with:', e?.detail);
        
        if (e?.detail?.row?.original && onSelectionChange) {
            const selectedRow = e.detail.row.original;
            console.log('Seleccionando etiqueta:', selectedRow);
            onSelectionChange(selectedRow);
            
            // Marcar la fila como seleccionada y con status de modificación pendiente
            const updatedData = data.map(row => ({
                ...row,
                isSelected: row.idetiqueta === selectedRow.idetiqueta,
                status: row.idetiqueta === selectedRow.idetiqueta ? 'Warning' : row.status
            }));
            
            // Sanitize: quitar campos cliente que el backend no espera
            const sanitizePayload = (obj: any) => {
                if (!obj) return obj;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { parent, isSelected, status, subRows, ...rest } = obj;
                
                // CAMBIO: Mapear a la estructura { id, updates }
                return {
                    id: rest.idetiqueta, // El ID va afuera
                    updates: { // El objeto de actualizaciones
                        IDSOCIEDAD: Number(rest.idsociedad) || 0,
                        IDCEDI: Number(rest.idcedi) || 0,
                        ETIQUETA: rest.etiqueta,
                        INDICE: rest.indice,
                        COLECCION: rest.coleccion,
                        SECCION: rest.seccion,
                        SECUENCIA: Number(rest.secuencia) || 0,
                        IMAGEN: rest.imagen,
                        ROUTE: rest.ruta,
                        DESCRIPCION: rest.descripcion
                    }
                };
            };
            
            const cleanPayload = sanitizePayload(selectedRow);
            
            // Agregar la operación al store con payload limpio
            addOperation({
                collection: 'labels',
                action: 'UPDATE',
                payload: cleanPayload
            });
            
            setLabels(updatedData);
        } else {
            console.log('Limpiando selección');
            onSelectionChange?.(null);
            
            // Limpiar la selección
            const updatedData = data.map(row => ({
                ...row,
                isSelected: false
            }));
            setLabels(updatedData);
        }
    };

    return <>
        <AnalyticalTable
        selectionMode={AnalyticalTableSelectionMode.Multiple}
        data={data}
        columns={columns}
        isTreeTable
        onRowSelect={(e) => {
            console.log('Selección cambiada:', e?.detail);
            handleSelectionChange(e);
        }}
        reactTableOptions={{ selectSubRows: false }}
        withRowHighlight
        highlightField="status"
        tableHooks={tableHooks}
        />
    </>
}

export default TableLabels;