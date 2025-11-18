
// src/catalogos/etiquetasValores/services/labelService.ts
import { getLabels, setLabels, getOperations, clearOperations } from '../store/labelStore';
import { getDbServer } from '../../../share/services/settingsService';
// Interfaces para la respuesta de la API
export interface ApiDetailRowReg {
    CURRENT: boolean;
    REGDATE: string;
    REGTIME: string;
    REGUSER: string;
}
export interface ApiDetailRow {
    ACTIVED: boolean;
    DELETED: boolean;
    DETAIL_ROW_REG: ApiDetailRowReg[];
}
export interface ApiValor {
    _id: string;
    IDSOCIEDAD: number;
    IDCEDI: number;
    IDETIQUETA: string;
    IDVALOR: string;
    IDVALORPA: string | null;
    VALOR: string;
    ALIAS: string;
    SECUENCIA: number;
    DESCRIPCION: string;
    IMAGEN: string | null;
    ROUTE: string | null;
    DETAIL_ROW: ApiDetailRow;
    createdAt: string;
    updatedAt: string;
}
export interface ApiLabel {
    _id: string;
    IDSOCIEDAD: number;
    IDCEDI: number;
    IDETIQUETA: string;
    ETIQUETA: string;
    INDICE: string;
    COLECCION: string;
    SECCION: string;
    SECUENCIA: number;
    IMAGEN: string;
    ROUTE: string;
    DETAIL_ROW: ApiDetailRow;
    createdAt: string;
    updatedAt: string;
    DESCRIPCION: string;
    valores: ApiValor[];
}
// Interfaces para el formato de la tabla
export interface TableSubRow {
    idsociedad: string;
    idcedi: string;
    idetiqueta: string;
    idvalor: string;
    idvalorpa: string | null;
    valor: string;
    alias: string;
    secuencia: number;
    imagen: string | null;
    ruta: string | null;
    descripcion: string;
    status?: string;
    isSelected?: boolean
    // Propiedades heredadas del padre
    indice: string;
    coleccion: string;
    seccion: string;
}
export interface TableParentRow {
    parent: true;
    idsociedad: string;
    idcedi: string;
    idetiqueta: string;
    etiqueta: string;
    indice: string;
    coleccion: string;
    seccion: string;
    secuencia: number;
    imagen: string;
    ruta: string;
    descripcion: string;
    status?: string;
    isSelected?: boolean
    subRows: TableSubRow[];
}
const transformData = (labels: ApiLabel[]): TableParentRow[] => {
    return labels.map((label) => {
        const subRows: TableSubRow[] = (label.valores || []).map((valor) => ({
            idsociedad: valor.IDSOCIEDAD?.toString() || '',
            idcedi: valor.IDCEDI?.toString() || '',
            idetiqueta: valor.IDETIQUETA || '',
            idvalor: valor.IDVALOR || '',
            idvalorpa: valor.IDVALORPA || null,
            valor: valor.VALOR || '',
            alias: valor.ALIAS || '',
            secuencia: valor.SECUENCIA || 0,
            imagen: valor.IMAGEN || null,
            ruta: valor.ROUTE || null,
            descripcion: valor.DESCRIPCION || '',
            // Heredar de la etiqueta padre
            indice: label.INDICE || '',
            coleccion: label.COLECCION || '',
            seccion: label.SECCION || '',
        }));
        return {
            parent: true,
            idsociedad: label.IDSOCIEDAD?.toString() || '',
            idcedi: label.IDCEDI?.toString() || '',
            idetiqueta: label.IDETIQUETA,
            etiqueta: label.ETIQUETA,
            indice: label.INDICE || '',
            coleccion: label.COLECCION || '',
            seccion: label.SECCION || '',
            secuencia: label.SECUENCIA,
            imagen: label.IMAGEN,
            ruta: label.ROUTE,
            descripcion: label.DESCRIPCION,
            subRows: subRows,
        };
    });
};
export const fetchLabels = async (): Promise<TableParentRow[]> => {
    const storedLabels = getLabels();
    if (storedLabels.length > 0) {
        return storedLabels;
    }
    try {
        const dbServer = getDbServer(); // Obtiene la DB seleccionada
        // Construye la URL dinámicamente
        const apiUrl = `http://localhost:3034/api/cat/crudLabelsValues?ProcessType=GetAll&LoggedUser=MIGUELLOPEZ&DBServer=${dbServer}`;
        
        console.log(`Fetching labels from: ${apiUrl}`); // Para depuración

        const response = await fetch(apiUrl, { // Usa la URL dinámica
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Response:", response)
        const result = await response.json();
        // The initial JSON is an object with a 'data' property containing the array.
        console.log("result:", result.data[0]);
        const apiData: ApiLabel[] = result.data[0].dataRes || [];
        const transformedData = transformData(apiData);
        setLabels(transformedData);
        console.log("apiData:", apiData)
        return transformedData;
    } catch (error) {
        console.error("Error fetching labels:", error);
        return []; // Return an empty array in case of an error
    }
};
export const saveChanges = async () => {
    const operations = getOperations();
    if (operations.length === 0) {
        return { success: true, message: 'No hay cambios que guardar.' };
    }

    try {
        console.log("operations:", JSON.stringify(operations , null ,2))
        const dbServer = getDbServer(); // Obtiene la DB seleccionada
        // Construye la URL dinámicamente
        const apiUrl = `http://localhost:3034/api/cat/crudLabelsValues?ProcessType=CRUD&LoggedUser=MIGUELLOPEZ&DBServer=${dbServer}`;

        console.log(`Saving changes to: ${apiUrl}`); // Para depuración

        const response = await fetch(apiUrl, { // Usa la URL dinámica
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({operations:operations}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Limpiar las operaciones pendientes después de guardarlas
        clearOperations();
        
        // Forzar la recarga de los datos desde el servidor
         console.error("Cambios guardados exitosamente.");
        return { success: true, message: 'Cambios guardados exitosamente.', data: result };
    } catch (error) {
        console.error("Error saving changes:", error);
        return { success: false, message: 'Error al guardar los cambios.' };
    }
};
