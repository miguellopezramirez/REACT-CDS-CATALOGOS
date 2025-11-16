// src/catalogos/etiquetasValores/components/TableLabels.tsx

import { useEffect, useState, useRef } from 'react';
// Importación necesaria para mover el popover fuera de la jerarquía de la tabla
import { createPortal } from 'react-dom';
import { AnalyticalTable, AnalyticalTableHooks, AnalyticalTableSelectionMode, Token, Tokenizer } from '@ui5/webcomponents-react';
import { fetchLabels, TableParentRow, TableSubRow } from '../services/labelService';
import { subscribe, getLabels, setLabels } from '../store/labelStore';


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
  onSelectionChange?: (labels: TableParentRow[]) => void;
  onValorSelectionChange?: (valor: TableSubRow | null, parent: TableParentRow | null) => void;
}

function TableLabels({ data: externalData, onSelectionChange, onValorSelectionChange }: TableLabelsProps) {
  // Component state managed by parent
  const [data, setData] = useState<TableParentRow[]>([]);

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
    } else {
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

  const handleSelectionChange = (e: any) => {
    if (e?.detail?.row?.original) {
      const clickedRow = e.detail.row.original;
      const isParentClick = clickedRow.parent === true;

      let updatedData;
      let selectedParents: TableParentRow[] = [];
      let selectedValor: TableSubRow | null = null;
      let selectedValorParent: TableParentRow | null = null;

      if (isParentClick) {
        // --- LÓGICA SI SE HACE CLIC EN UN PADRE (Etiqueta) ---
        // Permite multiselección de padres
        console.log('Toggle en Padre:', clickedRow.idetiqueta);
        const isAlreadySelected = clickedRow.isSelected;

        updatedData = data.map(row => {
          let isSelected = row.isSelected;
          if (row.idetiqueta === clickedRow.idetiqueta) {
            isSelected = !isAlreadySelected; // Alterna el padre clicado
          }

          // Deselecciona todos los hijos si se selecciona un padre
          const newSubRows = row.subRows.map(sub => ({ ...sub, isSelected: false }));

          if (isSelected) {
            selectedParents.push({ ...row, isSelected: true, subRows: newSubRows });
          }

          return { ...row, isSelected,  subRows: newSubRows as TableSubRow[] };
        });

        // Si se seleccionó un padre, nos aseguramos de que no haya un hijo seleccionado
        onValorSelectionChange?.(null, null);

      } else {
        // --- LÓGICA SI SE HACE CLIC EN UN HIJO (Valor) ---
        // Solo permite seleccionar un hijo a la vez
        const childRow = clickedRow as TableSubRow;
        const parent = data.find(p => p.idetiqueta === childRow.idetiqueta);
        console.log('Toggle en Hijo:', childRow.idvalor);

        const isAlreadySelected = childRow.isSelected;

        updatedData = data.map(parentRow => {
          // Deselecciona todos los padres
          let parentIsSelected = false;

          let newSubRows;
          if (parentRow.idetiqueta === childRow.idetiqueta) {
            // Es el padre del hijo clicado
            newSubRows = parentRow.subRows.map(sub => {
              let childIsSelected = false;
              if (sub.idvalor === childRow.idvalor) {
                childIsSelected = !isAlreadySelected; // Alterna solo el hijo clicado
                if (childIsSelected && parent) {
                  // Prepara los datos para el modal de actualizar
                  selectedValor = { ...sub, isSelected: true };
                  selectedValorParent = parent;
                }
              }
              // El resto de hijos se deseleccionan
              return { ...sub, isSelected: childIsSelected };
            });
          } else {
            // No es el padre del hijo clicado, deselecciona todos sus hijos
            newSubRows = parentRow.subRows.map(sub => ({ ...sub, isSelected: false }));
          }

          return { ...parentRow, isSelected: parentIsSelected, subRows: newSubRows as TableSubRow[] };
        });

        // Si se seleccionó un hijo, nos aseguramos de que no haya padres seleccionados
        onSelectionChange?.([]);
      }

      // --- REPORTAR AL PADRE (Catalogos.tsx) ---
      onSelectionChange?.(selectedParents); // Reporta padres seleccionados
      onValorSelectionChange?.(selectedValor, selectedValorParent); // Reporta hijo seleccionado

      setLabels(updatedData); // Actualiza el store

    } else {
      // --- LÓGICA SI SE DESELECCIONA TODO (clic en header) ---
      console.log('Limpiando selección');
      onSelectionChange?.([]);
      onValorSelectionChange?.(null, null); // Limpia el hijo

      const updatedData = data.map(row => ({
        ...row,
        isSelected: false,
        subRows: row.subRows.map(sub => ({ ...sub, isSelected: false }))
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
      withRowHighlight
      highlightField="status"
      tableHooks={tableHooks}
    />
  </>
}

export default TableLabels;