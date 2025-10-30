
// src/catalogos/etiquetasValores/services/labelService.ts

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
    IDVALORSAP: string;
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
    subRows: TableSubRow[];
}

const transformData = (labels: ApiLabel[]): TableParentRow[] => {
    return labels.map((label) => {
        const subRows: TableSubRow[] = (label.valores || []).map((valor) => ({
            idsociedad: valor.IDSOCIEDAD.toString(),
            idcedi: valor.IDCEDI.toString(),
            idetiqueta: valor.IDETIQUETA,
            idvalor: valor.IDVALOR,
            idvalorpa: valor.IDVALORPA,
            valor: valor.VALOR,
            alias: valor.ALIAS,
            secuencia: valor.SECUENCIA,
            imagen: valor.IMAGEN,
            ruta: valor.ROUTE,
            descripcion: valor.DESCRIPCION,
            // Heredar de la etiqueta padre
            indice: label.INDICE || '',
            coleccion: label.COLECCION || '',
            seccion: label.SECCION || '',
        }));

        return {
            parent: true,
            idsociedad: label.IDSOCIEDAD ,
            idcedi: label.IDCEDI,
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
    try {
        const response = await fetch('http://localhost:3034/api/cat/crudLabelsValues?ProcessType=GetAll&LoggedUser=MIGUELLOPEZ&DBServer=MongoDB', {
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
        console.log("apiData:", apiData)
        return transformData(apiData);
    } catch (error) {
        console.error("Error fetching labels:", error);
        return []; // Return an empty array in case of an error
    }
};
