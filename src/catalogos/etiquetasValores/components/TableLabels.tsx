import { useEffect, useState, useRef } from 'react';
// Importación necesaria para mover el popover fuera de la jerarquía de la tabla
import { createPortal } from 'react-dom';
import { AnalyticalTable, AnalyticalTableHooks, AnalyticalTableSelectionMode, Token, Tokenizer } from '@ui5/webcomponents-react';
import { fetchLabels, TableParentRow } from '../services/labelService';
import { subscribe, getLabels, setLabels, addOperation } from '../store/labelStore';


// Componente generalizado para la celda con Tooltip/Popover flotante
const CellTooltip = ({ value }: { value: string | number | null | undefined }) => {
  // Asegura que el valor sea una cadena, maneja null/undefined
  const valueStr = value !== null && value !== undefined ? String(value) : '';
  
  if (!valueStr) {
      return null;
  }

  const cellRef = useRef<HTMLDivElement>(null);
  // Modificar: Guardar la posición (x, y) y si debe anclarse a la derecha o izquierda
  const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number, flipX: boolean } | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Estilos base para la celda (trunca el texto)
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '0.25rem 0.5rem',
    boxSizing: 'border-box',
    // Si está truncado, el cursor es de ayuda
    cursor: isTruncated ? 'help' : 'default',
  };

  useEffect(() => {
    if (cellRef.current) {
        // Detectar truncamiento: si el contenido es más ancho que el contenedor visible.
        const { scrollWidth, clientWidth } = cellRef.current;
        const truncated = scrollWidth > clientWidth;
        setIsTruncated(truncated);
        
        // Si el valor cambia y ya no está truncado, asegura el cierre del popover
        if (!truncated && popoverPosition) {
             setPopoverPosition(null);
        }
    }
  }, [valueStr, popoverPosition]);

  const handleMouseEnter = () => {
    // *** SOLO MOSTRAR si está truncado ***
    if (!cellRef.current || !isTruncated) { 
        setPopoverPosition(null);
        return;
    }

    const rect = cellRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popoverMaxWidth = 400; // Define el ancho máximo del popover
    const margin = 10; // Margen de seguridad para bordes de pantalla
    const estimatedPopoverHeight = 200; // Estimación simple para la lógica vertical
    
    // Lógica de posicionamiento y "volteo"
    const availableSpaceRight = screenWidth - rect.right;
    const availableSpaceLeft = rect.left;
    
    let x = 0;
    let y = rect.top; // Anclaje inicial al top de la celda
    let flipX = false; // Indica si se despliega a la izquierda (true) o derecha (false)

    // 1. Posicionamiento Horizontal (Volteo X): Priorizar derecha
    if (availableSpaceRight >= popoverMaxWidth + margin) {
        x = rect.right + 5; // 5px offset a la derecha
        flipX = false;
    } else if (availableSpaceLeft >= popoverMaxWidth + margin) {
        x = rect.left - 5; // 5px offset a la izquierda
        flipX = true;
    } else if (availableSpaceLeft > availableSpaceRight) {
        // No hay suficiente espacio, pero el izquierdo tiene más
        x = rect.left - 5;
        flipX = true;
    } else {
        // La derecha es la mejor opción
        x = rect.right + 5;
        flipX = false;
    }

    // 2. Posicionamiento Vertical (Ajuste para visibilidad en el fondo):
    // Si la parte inferior del popover se saldría de la pantalla o está cerca del borde
    if ((rect.top + estimatedPopoverHeight) > (screenHeight - margin)) { 
        y = rect.bottom; // Anclaje al borde inferior de la celda
    } else {
        y = rect.top; // Anclaje al borde superior de la celda
    }
    
    setPopoverPosition({ x, y, flipX });
  };

  const handleMouseLeave = () => {
    setPopoverPosition(null);
  };
  
  // Calcular los estilos de posición y transformación para el popover
const popoverStyle: React.CSSProperties = popoverPosition ? (() => {
    const screenHeight = window.innerHeight;
    const margin = 10;
    const currentRect = cellRef.current?.getBoundingClientRect();

    const transformX = popoverPosition.flipX ? '-100%' : '0';
    let transformY = '-1px';

    if (currentRect && popoverPosition.y === currentRect.bottom) {
         transformY = '-100%';
    }
    
    const transform = `translate(${transformX}, ${transformY})`;
    
    return { 
      position: 'fixed',
      zIndex: 100000,
      whiteSpace: 'pre-wrap', 
      overflow: 'visible',
      width: 'max-content',
      // ** MODIFICACIÓN CLAVE: Permite romper palabras largas **
      wordBreak: 'break-word', 
      // Se eliminó minWidth, lo cual era la corrección para el popover grande
      // Si se necesita un mínimo, se puede establecer aquí (ej. '100px'), pero para auto-ajuste es mejor omitir.
      // minWidth: '100px',
      maxWidth: '400px', 
      height: 'auto',
      backgroundColor: 'var(--sapBackgroundColor, white)',
      border: '1px solid var(--sapField_BorderColor, #888)',
      boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
      padding: '0.5rem',
      borderRadius: '4px', 
      
      left: popoverPosition.x,
      top: popoverPosition.y,
      transform: transform,
      
      maxHeight: `calc(${screenHeight - margin * 2}px)`, 
      overflowY: 'auto', 
    };
  })() : {};
  // *** FIN DE LA CORRECCIÓN DE SINTAXIS ***
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
          style={popoverStyle}
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
      // Usa CellTooltip para mostrar etiqueta o valor con popover
      return <CellTooltip value={row.original.valor || value} />;
    }
  },
  {

    Header: "IDETIQUETA/IDEVALOR",
    accessor: "idetiqueta",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ row, cell: { value } }: any) => {
      // Usa CellTooltip para mostrar IDETIQUETA o IDVALOR con popover
      return <CellTooltip value={row.original.idvalor || value} />;
    }
  },
  {
    Header: "IDSOCIEDAD",
    accessor: "idsociedad",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  },
  {
    Header: "VALOR PADRE",
    accessor: "idvalorpa",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  },
  {
    Header: "IDCEDI",
    accessor: "idcedi",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  },
  {
    Header: "INDICE",
    accessor: "indice",
    Cell: ({ cell: { value } }: any) => {
      const valueStr = (typeof value === 'string' && value) ? value : ''; // Asegurarse de que es una cadena válida
      if (!valueStr) { // Manejar caso vacío
        return null;
      }
      const indices = valueStr.split(',').filter(v => v.trim() !== ''); // Dividir y limpiar

      // Se mantiene la lógica original de Tokenizer ya que ofrece una funcionalidad de tooltip propia
      return (
        <Tokenizer
          title={valueStr} // Muestra la lista
          style={{ width: '100%', padding: '0.25rem 0' }}
        >
          {indices.map((indice, index) => (
            <Token
              key={index}
              text={indice.trim()}
            />
          ))}
        </Tokenizer>
      );
    }
  },
  {
    Header: "COLECCION",
    accessor: "coleccion",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  }, {
    Header: "SECCION",
    accessor: "seccion",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  }, {
    Header: "SECUENCIA",
    accessor: "secuencia",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  }, {
    Header: "IMAGEN",
    accessor: "imagen",
    // Se mantiene la lógica para la imagen sin popover
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => (value ? <img src={value} style={{ height: "40px" }} /> : null)
  }, {
    Header: "ROUTE",
    accessor: "ruta",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  }, {
    Header: "DESCRIPCION",
    accessor: "descripcion",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ cell: { value } }: any) => <CellTooltip value={value} />
  }
];

interface TableLabelsProps {
  data?: TableParentRow[];
  onSelectionChange?: (label: TableParentRow | null) => void;
}

function TableLabels({ data: externalData, onSelectionChange }: TableLabelsProps) {
  const [data, setData] = useState<TableParentRow[]>([]);
  // Component state managed by parent

  useEffect(() => {
    const handleStoreChange = () => {

      if (externalData) {
      setData(externalData);
      return;
    } 
  }


    const unsubscribe = subscribe(handleStoreChange);

    if (getLabels().length === 0) {
      fetchLabels().then((transformedData) => {
        setLabels(transformedData.map(item => ({ ...item, isSelected: false })));
      });
    }else {
      setData(getLabels());
    }

    return () => {
      unsubscribe();
    };
  }, [externalData]);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
    }
  }, [externalData]);


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

       //Agregar la operación al store con payload limpio
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