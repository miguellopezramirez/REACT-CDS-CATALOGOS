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
    Select,
    Option
} from "@ui5/webcomponents-react";
import { useState, useRef, useEffect } from "react";
import { addOperation } from "../store/labelStore";
import { TableParentRow, TableSubRow } from "../services/labelService";

const initialFormState = {
    IDVALOR: "",
    VALOR: "",
    IDVALORPA: "",
    ALIAS: "",
    SECUENCIA: "0",
    IDVALORSAP: "",
    DESCRIPCION: "",
    IMAGEN: "",
    ROUTE: "",
};

interface ModalUpdateValorProps {
    compact?: boolean;
    valorToEdit: TableSubRow | null;
    parentLabel: TableParentRow | null;
}

function ModalUpdateValor({ compact = false, valorToEdit, parentLabel }: ModalUpdateValorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<any>({});
    const latestFormRef = useRef(initialFormState);
    const [valorPadreOptions, setValorPadreOptions] = useState<TableSubRow[]>([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        if (!valorToEdit || !parentLabel) {
            setIsButtonDisabled(true);
            return;
        }

        const isValorValid = formData.VALOR.trim() !== '';
        const isSecuenciaValid = !formData.SECUENCIA || (formData.SECUENCIA && !isNaN(Number(formData.SECUENCIA)));

        if (isValorValid && isSecuenciaValid) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }

    }, [formData, valorToEdit, parentLabel]);

    const validate = (data: typeof initialFormState) => {
        const newErrors: any = {};
        if (!data.VALOR) newErrors.VALOR = "VALOR es requerido.";
        if (data.SECUENCIA && isNaN(Number(data.SECUENCIA))) {
            newErrors.SECUENCIA = "El valor debe ser numérico.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: any) => {
        const name = e.target.name;
        const value = e.target.value;
        if (!name) { return; }
        setFormData((prevState) => {
            const updatedState = { ...prevState, [name]: value };
            latestFormRef.current = updatedState; // Actualiza la ref
            return updatedState;
        });
    };

    const handleValorPadreChange = (event: any) => {
        const selectedValorId = event.target.value as string;
        setFormData(prev => ({ ...prev, IDVALORPA: selectedValorId }));
        latestFormRef.current = { ...latestFormRef.current, IDVALORPA: selectedValorId };
    };

    const handleSubmit = async () => {
        const snapshot = { ...(latestFormRef.current || formData) };

        if (validate(snapshot) && parentLabel) {
            try {
                const updatePayload = {
                    id: snapshot.IDVALOR,
                    IDETIQUETA: parentLabel.idetiqueta, 
                    updates: {
                        VALOR: snapshot.VALOR,
                        IDVALORPA: snapshot.IDVALORPA || null, 
                        ALIAS: snapshot.ALIAS,
                        SECUENCIA: Number(snapshot.SECUENCIA) || 0,
                        IDVALORSAP: snapshot.IDVALORSAP,
                        DESCRIPCION: snapshot.DESCRIPCION,
                        IMAGEN: snapshot.IMAGEN,
                        ROUTE: snapshot.ROUTE,
                    }
                };

                addOperation({
                    collection: "values",
                    action: "UPDATE",
                    payload: updatePayload
                });

                setIsModalOpen(false);
            } catch (error) {
                console.error("Error calling update operation:", error);
            }
        }
    };

    const openModal = () => {
        if (!valorToEdit || !parentLabel) {
            console.error("ModalUpdateValor: Faltan 'valorToEdit' o 'parentLabel' props.");
            return;
        }

        const formDataFromProp = {
            IDVALOR: valorToEdit.idvalor,
            VALOR: valorToEdit.valor,
            IDVALORPA: valorToEdit.idvalorpa || "",
            ALIAS: valorToEdit.alias || "",
            SECUENCIA: valorToEdit.secuencia.toString() || "0",
            IDVALORSAP: (valorToEdit as any).idvalorsap || "",
            DESCRIPCION: valorToEdit.descripcion || "",
            IMAGEN: valorToEdit.imagen || "",
            ROUTE: valorToEdit.ruta || "",
        };
        setFormData(formDataFromProp);
        latestFormRef.current = formDataFromProp;

        const options = parentLabel.subRows.filter(sub => sub.idvalor !== valorToEdit.idvalor);
        setValorPadreOptions(options);

        setErrors({});
        setIsButtonDisabled(false);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                design="Emphasized"
                icon="edit"
                onClick={openModal}
                disabled={!valorToEdit || !parentLabel} // Deshabilitado si no hay valor seleccionado
                accessibleName="Actualizar Valor"
            >
                {!compact && 'Actualizar Valor'}
            </Button>

            <Dialog
                open={isModalOpen}
                headerText="Actualizar Valor"
                style={{ width: "700px" }}
                footer={
                    <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{ paddingBlock: "0.25rem" }}>
                        <Button onClick={handleSubmit} disabled={isButtonDisabled}>Actualizar</Button>
                        <Button onClick={handleClose}>Cerrar</Button>
                    </FlexBox>
                }
            >
                <Form>
                    <FormGroup headerText="Información del Catálogo (Padre)">
                        <FormItem labelContent={<Label>Etiqueta Padre</Label>}>
                            <Input value={parentLabel?.etiqueta || ""} disabled />
                        </FormItem>
                        <FormItem labelContent={<Label>ID Sociedad (Padre)</Label>}>
                            <Input value={parentLabel?.idsociedad || ""} disabled />
                        </FormItem>
                        <FormItem labelContent={<Label>ID Cedi (Padre)</Label>}>
                            <Input value={parentLabel?.idcedi || ""} disabled />
                        </FormItem>
                        <FormItem labelContent={<Label>ID Etiqueta (Padre)</Label>}>
                            <Input value={parentLabel?.idetiqueta || ""} disabled />
                        </FormItem>
                    </FormGroup>

                    <FormGroup headerText="Información del Valor">
                        <FormItem labelContent={<Label required>ID del Valor</Label>}>
                            <Input
                                name="IDVALOR"
                                value={formData.IDVALOR}
                                disabled // El ID (clave primaria) no se debe editar
                            />
                        </FormItem>
                        <FormItem labelContent={<Label required>Valor</Label>}>
                            <Input
                                name="VALOR"
                                value={formData.VALOR}
                                onInput={handleChange}
                                valueState={errors.VALOR ? "Negative" : "None"}
                                valueStateMessage={<div slot="valueStateMessage">{errors.VALOR}</div>}
                            />
                        </FormItem>
                        <FormItem labelContent={<Label>ID Valor Padre (IDVALORPA)</Label>}>
                            <Select
                                value={formData.IDVALORPA}
                                onChange={handleValorPadreChange}
                                style={{ width: "100%" }}
                            >
                                <Option key="none" value="">Ninguno</Option>
                                {valorPadreOptions.map((valor) => (
                                    <Option key={valor.idvalor} value={valor.idvalor}>
                                        {valor.valor || ''}
                                    </Option>
                                ))}
                            </Select>
                        </FormItem>
                        <FormItem labelContent={<Label>Alias</Label>}>
                            <Input name="ALIAS" value={formData.ALIAS} onInput={handleChange} />
                        </FormItem>
                        <FormItem labelContent={<Label>ID Valor SAP</Label>}>
                            <Input name="IDVALORSAP" value={formData.IDVALORSAP} onInput={handleChange} />
                        </FormItem>
                        <FormItem labelContent={<Label>Secuencia</Label>}>
                            <Input
                                name="SECUENCIA"
                                type="Number"
                                value={formData.SECUENCIA}
                                onInput={handleChange}
                                valueState={errors.SECUENCIA ? "Negative" : "None"}
                                valueStateMessage={<div slot="valueStateMessage">{errors.SECUENCIA}</div>}
                            />
                        </FormItem>
                        <FormItem labelContent={<Label>Imagen</Label>}>
                            <Input name="IMAGEN" value={formData.IMAGEN} onInput={handleChange} />
                        </FormItem>
                        <FormItem labelContent={<Label>Ruta</Label>}>
                            <Input name="ROUTE" value={formData.ROUTE} onInput={handleChange} />
                        </FormItem>
                        <FormItem labelContent={<Label>Descripción</Label>}>
                            <Input name="DESCRIPCION" value={formData.DESCRIPCION} onInput={handleChange} />
                        </FormItem>
                    </FormGroup>
                </Form>
            </Dialog>
        </>
    );
}

export default ModalUpdateValor;