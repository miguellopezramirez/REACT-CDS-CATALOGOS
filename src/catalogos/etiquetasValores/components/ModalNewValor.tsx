import {
  Button,
  FlexBox,
  FlexBoxJustifyContent,
  Form,
  FormGroup,
  FormItem,
  Input,
  Label,
  Dialog,
  ComboBox,
  ComboBoxItem,
} from "@ui5/webcomponents-react";
import { useState, useRef, useEffect } from "react";
import { addOperation, getLabels, subscribe } from "../store/labelStore";
import { TableParentRow } from "../services/labelService";

const initialFormState = {
  IDVALOR: "",
  VALOR: "",
  IDVALORPA: "",
  ALIAS: "",
  SECUENCIA: 0,
  IDVALORSAP: "",
  DESCRIPCION: "",
  IMAGEN: "",
  ROUTE: "",
};

function ModalNewValor() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<any>({});
  const latestFormRef = useRef(initialFormState);

  const [parentLabels, setParentLabels] = useState<TableParentRow[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    const allLabels = getLabels();
    const parents = allLabels.filter((label) => label.parent);
    setParentLabels(parents);

    const unsubscribe = subscribe(() => {
      const updatedLabels = getLabels();
      const updatedParents = updatedLabels.filter((label) => label.parent);
      setParentLabels(updatedParents);
    });

    return () => unsubscribe();
  }, []);

  const validate = (data: typeof initialFormState, parentId: string | null) => {
    const newErrors: any = {};

    if (!parentId) newErrors.parent = "Debe seleccionar una Etiqueta padre.";

    if (!data.IDVALOR) newErrors.IDVALOR = "IDVALOR es requerido.";
    if (!data.VALOR) newErrors.VALOR = "VALOR es requerido.";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("Validation result:", isValid, "Errors:", newErrors);
    return isValid;
  };

  const handleChange = (e: any) => {
    const current = e.currentTarget;
    const target = e.target;

    const name =
      (current &&
        (current.name ||
          (current.getAttribute && current.getAttribute("name")))) ||
      (target &&
        (target.name ||
          (target.getAttribute && target.getAttribute("name")))) ||
      "";

    const value =
      e && e.detail && e.detail.value !== undefined
        ? e.detail.value
        : (target &&
            (target.value !== undefined
              ? target.value
              : target.getAttribute && target.getAttribute("value"))) ||
          "";

    if (!name) {
      console.warn('handleChange no pudo determinar el "name" del campo.');
      return;
    }

    setFormData((prevState) => {
      const converted = name === "SECUENCIA" ? Number(value) || 0 : value;

      const updatedState = {
        ...prevState,
        [name]: converted,
      };

      latestFormRef.current = updatedState;
      return updatedState;
    });
  };

  const handleParentChange = (e: any) => {
    if (!e.detail.item) {
      setSelectedParentId(null);
      return; 
    }

    const selectedId = e.detail.item.dataset.id;
    setSelectedParentId(selectedId);
  };

  const handleSubmit = async () => {
    console.log("handleSubmit (Valor) called");
    const snapshot = { ...(latestFormRef.current || formData) };

    if (validate(snapshot, selectedParentId)) {
      try {
        const parentLabel = parentLabels.find(
          (l) => l.idetiqueta === selectedParentId
        );
        if (!parentLabel) {
          console.error("Error: No se encontró el padre seleccionado.");
          setErrors({
            ...errors,
            parent: "Error al encontrar el padre. Intente de nuevo.",
          });
          return;
        }

        console.log("Validation passed. Building local object...");

        const fullValorObject = {
          ...snapshot,
          IDSOCIEDAD: Number(parentLabel.idsociedad),
          IDCEDI: Number(parentLabel.idcedi),
          IDETIQUETA: parentLabel.idetiqueta,
          SECUENCIA: Number(snapshot.SECUENCIA) || 0,
        };

        addOperation({
          collection: "values",
          action: "CREATE",
          payload: fullValorObject,
        });

        console.log("Local object passed to store. Closing modal.");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error calling addOperation for Valor:", error);
      }
    } else {
      console.log("Validation failed. Errors:", errors);
    }
  };

  const selectedParentData = parentLabels.find(
    (l) => l.idetiqueta === selectedParentId
  );

  const openModal = () => {
    setFormData(initialFormState);
    latestFormRef.current = initialFormState;
    setSelectedParentId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button design="Emphasized" icon="add" onClick={openModal}>
        Crear Nuevo Valor
      </Button>
      <Dialog
        open={isModalOpen}
        headerText="Agrega un Valor"
        style={{ width: "700px" }}
        footer={
          <FlexBox
            justifyContent={FlexBoxJustifyContent.End}
            fitContainer
            style={{ paddingBlock: "0.25rem" }}
          >
            <Button onClick={handleSubmit}>Crear </Button>
            <Button onClick={handleClose}>Cerrar</Button>{" "}
          </FlexBox>
        }
      >
        <Form>
          <FormGroup headerText="Información del Catálogo">
            <FormItem labelContent={<Label required>Etiqueta Padre</Label>}>
              <ComboBox 
                onSelectionChange={handleParentChange}
                value={selectedParentData?.etiqueta || ""}
              >
                {parentLabels.map((label) => (
                  <ComboBoxItem
                    key={label.idetiqueta}
                    text={label.etiqueta}
                    data-id={label.idetiqueta}
                  />
                ))}
              </ComboBox>
              {errors.parent && (
                <span style={{ color: "red" }}>{errors.parent}</span>
              )}
            </FormItem>

            <FormItem labelContent={<Label>ID Sociedad (Padre)</Label>}>
              <Input value={selectedParentData?.idsociedad || ""} disabled />
            </FormItem>
            <FormItem labelContent={<Label>ID Cedi (Padre)</Label>}>
              <Input value={selectedParentData?.idcedi || ""} disabled />
            </FormItem>
            <FormItem labelContent={<Label>ID Etiqueta (Padre)</Label>}>
              <Input value={selectedParentData?.idetiqueta || ""} disabled />
            </FormItem>
          </FormGroup>

          <FormGroup headerText="Información del Valor">
            <FormItem labelContent={<Label required>ID del Valor</Label>}>
              <Input
                name="IDVALOR"
                value={formData.IDVALOR}
                onInput={handleChange}
              />
              {errors.IDVALOR && (
                <span style={{ color: "red" }}>{errors.IDVALOR}</span>
              )}
            </FormItem>

            <FormItem labelContent={<Label required>Valor</Label>}>
              <Input
                name="VALOR"
                value={formData.VALOR}
                onInput={handleChange}
              />
              {errors.VALOR && (
                <span style={{ color: "red" }}>{errors.VALOR}</span>
              )}
            </FormItem>

            <FormItem labelContent={<Label>ID Valor Padre (IDVALORPA)</Label>}>
              <Input
                name="IDVALORPA"
                value={formData.IDVALORPA}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>Alias</Label>}>
              <Input
                name="ALIAS"
                value={formData.ALIAS}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>ID Valor SAP</Label>}>
              <Input
                name="IDVALORSAP"
                value={formData.IDVALORSAP}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>Secuencia</Label>}>
              <Input
                name="SECUENCIA"
                type="Number"
                value={formData.SECUENCIA.toString()}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>Imagen</Label>}>
              <Input
                name="IMAGEN"
                value={formData.IMAGEN}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>Ruta</Label>}>
              <Input
                name="ROUTE"
                value={formData.ROUTE}
                onInput={handleChange}
              />
            </FormItem>

            <FormItem labelContent={<Label>Descripción</Label>}>
              <Input
                name="DESCRIPCION"
                value={formData.DESCRIPCION}
                onInput={handleChange}
              />
            </FormItem>
          </FormGroup>
        </Form>
      </Dialog>
    </>
  );
}

export default ModalNewValor;
