
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
  operations.push(operation);
      if (operation.collection === 'labels' && operation.action === 'CREATE') {
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
    }  notifyListeners();
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
