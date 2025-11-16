// src/catalogos/etiquetasValores/store/labelStore.ts
import { TableParentRow, TableSubRow } from "../services/labelService";

export type Action = 'CREATE' | 'UPDATE' | 'DELETE' | 'NONE';

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
  let merged = false;

  // Solo nos interesa combinar si es una ACTUALIZACIÓN
  if (operation.action === 'UPDATE') {
    const itemId = operation.payload.id;
    const collection = operation.collection;

    const existingUpdateOp = operations.find(op =>
      op.action === 'UPDATE' &&
      op.collection === collection &&
      op.payload.id === itemId
    );

    if (existingUpdateOp) {
      // SÍ: Encontramos un 'UPDATE' previo.
      console.log('Combinando operación UPDATE para el item:', itemId);
      // Simplemente reemplazamos los 'updates' viejos con los nuevos.
      existingUpdateOp.payload.updates = operation.payload.updates;
      // Y actualizamos el IDETIQUETA (para el store) por si acaso
      existingUpdateOp.payload.IDETIQUETA = operation.payload.IDETIQUETA;

      merged = true;

    } else {
      const existingCreateOp = operations.find(op =>
        op.action === 'CREATE' &&
        op.collection === collection &&
        // El ID de un 'CREATE' está dentro del payload
        (collection === 'labels' ? op.payload.IDETIQUETA : op.payload.IDVALOR) === itemId
      );

      if (existingCreateOp) {
        // SÍ: Encontramos un 'CREATE' previo.
        console.log('Combinando UPDATE en operación CREATE para el item:', itemId);
        // Combinamos los 'updates' (del UPDATE) en el payload (del CREATE)
        existingCreateOp.payload = { ...existingCreateOp.payload, ...operation.payload.updates };

        merged = true;
      }
    }
  }

  if (!merged) {
    operations.push(operation);
  }

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
    const targetId = operation.payload.id;
    const updates = operation.payload.updates;
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
          status: 'Critical',
          subRows: label.subRows
        };
        console.log('Etiqueta actualizada (estado local):', JSON.stringify(updatedLabel));
        return updatedLabel;
      }
      return label;
    });

  } else if (operation.collection === 'labels' && operation.action === 'DELETE') { // <-- LÓGICA DE ELIMINACIÓN
    console.log('Iniciando operación DELETE para una Etiqueta');
    const targetId = operation.payload.id;

    labels = labels.map(label => {
      if (label.idetiqueta === targetId) {
        console.log('Marcada etiqueta para eliminación:', targetId);
        // Marcar con status 'Negative' (rojo) para indicar eliminación pendiente
        return {
          ...label,
          status: 'Negative', // Usamos 'Negative' para el resaltado visual de eliminación
        };
      }
      return label;
    });

  } else if (operation.collection === 'values' && operation.action === 'CREATE') {
    console.log('Iniciando operación CREATE para un Valor');
    const parentId = operation.payload.IDETIQUETA;

    labels = labels.map(label => {
      if (label.idetiqueta === parentId && label.parent) {
        console.log('Encontrado padre:', label.idetiqueta);

        const newSubRow = {
          parent: false,
          idsociedad: operation.payload.IDSOCIEDAD.toString(),
          idcedi: operation.payload.IDCEDI.toString(),
          idetiqueta: operation.payload.IDETIQUETA,
          indice: label.indice,
          coleccion: label.coleccion,
          seccion: label.seccion,

          idvalor: operation.payload.IDVALOR,
          valor: operation.payload.VALOR,
          idvalorpa: operation.payload.IDVALORPA,
          alias: operation.payload.ALIAS,
          idvalorsap: operation.payload.IDVALORSAP,

          secuencia: operation.payload.SECUENCIA,
          imagen: operation.payload.IMAGEN,
          ruta: operation.payload.ROUTE,
          descripcion: operation.payload.DESCRIPCION,

          status: 'Positive',
        };

        return {
          ...label,
          subRows: [...label.subRows, newSubRow] as TableSubRow[]
        };
      }
      return label;
    });
  } else if (operation.collection === 'values' && operation.action === 'UPDATE') {

    const valorId = operation.payload.id;
    const parentId = operation.payload.IDETIQUETA;
    const updates = operation.payload.updates;

    if (!parentId || !valorId) {
      notifyListeners();
      return;
    }

    labels = labels.map(label => {
      // Encontrar la etiqueta padre correcta
      if (label.idetiqueta === parentId && label.parent) {

        // Mapea las sub-filas (valores) de ese padre
        const updatedSubRows = label.subRows.map(subRow => {
          // Encuentra el valor específico que se está actualizando
          if (subRow.idvalor === valorId) {

            return {
              ...subRow,

              valor: updates.VALOR,
              idvalorpa: updates.IDVALORPA,
              alias: updates.ALIAS,
              secuencia: updates.SECUENCIA,
              idvalorsap: (updates as any).IDVALORSAP,
              descripcion: updates.DESCRIPCION,
              imagen: updates.IMAGEN,
              ruta: updates.ROUTE,

              status: 'Critical',
            } as TableSubRow;
          }
          return subRow;
        });

        return {
          ...label,
          subRows: updatedSubRows
        };
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

export const clearLabelsCache = () => {
  labels = [];
  notifyListeners();
};