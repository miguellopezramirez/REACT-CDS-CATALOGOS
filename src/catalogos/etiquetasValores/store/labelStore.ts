
// src/catalogos/etiquetasValores/store/labelStore.ts
import { TableParentRow } from "../services/labelService";

export type Action = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Operation {
  collection: 'labels' | 'values';
  action: Action;
  payload: any;
}

let operations: Operation[] = [];
let labels: TableParentRow[] = [];
let listeners: (() => void)[] = [];

export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const getLabels = () => labels;

export const setLabels = (newLabels: TableParentRow[]) => {
  labels = newLabels;
  notifyListeners();
};

export const addOperation = (operation: Operation) => {
  operations.push(operation); // Agregar la operación al historial

  // Actualizar el estado local según la operación
      if (operation.collection === 'labels' && operation.action === 'CREATE') {
      // Agregar la nueva etiqueta al arreglo de etiquetas
      const newLabel: TableParentRow = {
        parent: true,
        idsociedad: operation.payload.IDSOCIEDAD.toString(),
        idcedi: operation.payload.IDCEDI.toString(),
        idetiqueta: operation.payload.IDETIQUETA,
        etiqueta: operation.payload.ETIQUETA,
        indice: operation.payload.INDICE,
        coleccion: operation.payload.COLECCION,
        seccion: operation.payload.SECCION,
        secuencia: operation.payload.SECUENCIA,
        imagen: operation.payload.IMAGEN,
        ruta: operation.payload.ROUTE,
        descripcion: operation.payload.DESCRIPCION,
        status: 'Positive', // Indicar que es una nueva etiqueta
        subRows: [],
      };
      labels = [...labels, newLabel];
    } else if (operation.collection === 'labels' && operation.action === 'UPDATE') {
  console.log('Iniciando operación UPDATE');
      console.log('Iniciando operación UPDATE');
      // CAMBIO: El payload ahora es { id, updates }
      const targetId = operation.payload.id; 
      const updates = operation.payload.updates; // Objeto con mayúsculas
  console.log('Buscando etiqueta con ID:', targetId);
      
      labels = labels.map(label => {
        if (label.idetiqueta === targetId) {
          console.log('Encontrada etiqueta para actualizar:', JSON.stringify(label));
          console.log('Payload de actualización (anidado):', JSON.stringify(operation.payload));
          
          // CAMBIO: Mapear desde 'updates' (MAYUSCULAS) al estado local (minúsculas)
          const updatedLabel: TableParentRow = {
            ...label, // Mantener otros valores (como subRows)
            parent: true,
            idsociedad: updates.IDSOCIEDAD.toString(),
            idcedi: updates.IDCEDI.toString(),
            idetiqueta: targetId, // Usar el ID del payload
            etiqueta: updates.ETIQUETA,
            indice: updates.INDICE,
            coleccion: updates.COLECCION,
            seccion: updates.SECCION,
            secuencia: updates.SECUENCIA,
            imagen: updates.IMAGEN,
            ruta: updates.ROUTE, // 'ruta' en el estado local, 'ROUTE' en el payload
            descripcion: updates.DESCRIPCION,
            status: 'Warning',
            subRows: label.subRows
          };
          console.log('Etiqueta actualizada (estado local):', JSON.stringify(updatedLabel));
          return updatedLabel;
        }
        return label;
      });
      
    }
    
    notifyListeners();
};

export const getOperations = () => operations;

export const clearOperations = () => {
  operations = [];
};

export const clearStatuses = () => {
  labels = labels.map(label => {
    const newLabel = { ...label };
    delete newLabel.status;
    newLabel.subRows = newLabel.subRows.map(subRow => {
      const newSubRow = { ...subRow };
      delete newSubRow.status;
      return newSubRow;
    });
    return newLabel;
  });
  notifyListeners();
};
