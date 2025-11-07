import { useState, useEffect } from "react";
import { Input } from "@ui5/webcomponents-react";
import { addOperation } from "../store/labelStore";

interface EditableCellProps {
  value: any;
  row: { original: any; index: number };
  column: { id: string };
}

const COLUMN_TO_PAYLOAD_MAP: { [key: string]: string } = {
  etiqueta: "ETIQUETA",
  indice: "INDICE",
  coleccion: "COLECCION",
  seccion: "SECCION",
  secuencia: "SECUENCIA",
  ruta: "ROUTE",
};

export const EditableCell = ({
  value: initialValue,
  row: { original: rowData },
  column: { id: columnId },
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: any) => {
    const newValue =
      e.detail?.value !== undefined ? e.detail.value : e.target.value;
    setValue(newValue);
  };

  const handleSave = () => {
    setIsEditing(false);

    if (value === initialValue) {
      return;
    }

    console.log(
      `Guardando... Fila ID: ${rowData.idetiqueta}, Col: ${columnId}, Nuevo Valor: ${value}`
    );

    const id = rowData.idetiqueta;

    const updates = {
      IDSOCIEDAD: Number(rowData.idsociedad) || 0,
      IDCEDI: Number(rowData.idcedi) || 0,
      ETIQUETA: rowData.etiqueta,
      INDICE: rowData.indice,
      COLECCION: rowData.coleccion,
      SECCION: rowData.seccion,
      SECUENCIA: Number(rowData.secuencia) || 0,
      IMAGEN: rowData.imagen,
      ROUTE: rowData.ruta,
      DESCRIPCION: rowData.descripcion,
    };

    const updateKey = COLUMN_TO_PAYLOAD_MAP[columnId];

    if (updateKey) {
      const finalValue = columnId === "secuencia" ? Number(value) || 0 : value;

      // @ts-ignore - Asignación dinámica
      updates[updateKey] = finalValue;
    } else {
      console.error(`Error de mapeo: No se encontró la llave para ${columnId}`);
      return;
    }

    const updatePayload = {
      id: id,
      updates: updates,
    };

    addOperation({
      collection: "labels",
      action: "UPDATE",
      payload: updatePayload,
    });
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        onDoubleClick={() => setIsEditing(true)}
        // onClick={() => setIsEditing(true)}

        style={{
          width: "100%",
          height: "100%",
          padding: "0.25rem 0.5rem",
          boxSizing: "border-box",
          cursor: "cell",
        }}
        title={`Doble clic para editar ${columnId}`} 
      >
        {value}
      </div>
    );
  }

  return (
    <Input
      value={value}
      onInput={handleChange} 
      onBlur={handleSave}
      autoFocus
      style={{
        width: "100%",
        margin: "-0.25rem -0.5rem",
        boxSizing: "border-box",
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSave();
        }
        if (e.key === "Escape") {
          handleCancel();
        }
      }}
    />
  );
};
