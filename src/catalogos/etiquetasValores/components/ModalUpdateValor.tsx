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
} from "@ui5/webcomponents-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { addOperation, getLabels, subscribe } from "../store/labelStore";
import { TableParentRow, TableSubRow } from "../services/labelService";
import { ValueHelpSelector, LabelData } from "./ValueHelpSelector";

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
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    
    // Estado para todas las etiquetas (necesario para el ValueHelpSelector)
    const [allLabels, setAllLabels] = useState<TableParentRow[]>([]);
    
    // Nuevo estado para el IDVALORPA (valor padre dentro de los valores)
    const [selectedIdValorPa, setSelectedIdValorPa] = useState<string | null>(null);

    // Cargar todas las etiquetas para el ValueHelpSelector
    useEffect(() => {
        const labels = getLabels();
        const parents = labels.filter((label) => label.parent);
        setAllLabels(parents);

        const unsubscribe = subscribe(() => {
            const updatedLabels = getLabels();
            const updatedParents = updatedLabels.filter((label) => label.parent);
            setAllLabels(updatedParents);
        });

        return () => unsubscribe();
    }, []);

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
            latestFormRef.current = updatedState;
            return updatedState;
        });
    };

    // Transformar allLabels a formato LabelData para el ValueHelpSelector
    const valueHelpData = useMemo<LabelData[]>(() => {
        return allLabels.map((label) => ({
            parent: label.parent,
            idsociedad: label.idsociedad,
            idcedi: label.idcedi,
            idetiqueta: label.idetiqueta,
            etiqueta: label.etiqueta,
            indice: label.indice,
            coleccion: label.coleccion,
            seccion: label.seccion,
            secuencia: label.secuencia,
            imagen: label.imagen,
            ruta: label.ruta,
            descripcion: label.descripcion,
            // Mapear los subRows (valores) de cada etiqueta
            subRows: (label.subRows || []).map((subRow) => ({
                idsociedad: subRow.idsociedad,
                idcedi: subRow.idcedi,
                idetiqueta: subRow.idetiqueta,
                idvalor: subRow.idvalor,
                idvalorpa: subRow.idvalorpa,
                valor: subRow.valor,
                alias: subRow.alias,
                secuencia: subRow.secuencia,
                imagen: subRow.imagen,
                ruta: subRow.ruta,
                descripcion: subRow.descripcion,
                indice: subRow.indice,
                coleccion: subRow.coleccion,
                seccion: subRow.seccion,
            })),
        }));
    }, [allLabels]);

    // Manejador para cuando se selecciona un valor padre (IDVALORPA)
    const handleIdValorPaSelect = (idvalor: string | null) => {
        setSelectedIdValorPa(idvalor);
        
        // Actualizar el formData con el IDVALORPA seleccionado
        setFormData((prevState) => {
            const updatedState = {
                ...prevState,
                IDVALORPA: idvalor || "",
            };
            latestFormRef.current = updatedState;
            return updatedState;
        });
    };

    const handleSubmit = async () => {
        const snapshot = { ...(latestFormRef.current || formData) };

        if (validate(snapshot) && parentLabel) {
            try {
                const valorPaFinal = !snapshot.IDVALORPA ? null : snapshot.IDVALORPA;
                const updatePayload = {
                    id: snapshot.IDVALOR,
                    IDETIQUETA: parentLabel.idetiqueta, 
                    updates: {
                        VALOR: snapshot.VALOR,
                        IDVALORPA: valorPaFinal, 
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

        const idValorPaInicial = valorToEdit.idvalorpa || null;

        const formDataFromProp = {
            IDVALOR: valorToEdit.idvalor,
            VALOR: valorToEdit.valor,
            IDVALORPA: idValorPaInicial || "",
            ALIAS: valorToEdit.alias || "",
            SECUENCIA: valorToEdit.secuencia.toString() || "0",
            IDVALORSAP: (valorToEdit as any).idvalorsap || "",
            DESCRIPCION: valorToEdit.descripcion || "",
            IMAGEN: valorToEdit.imagen || "",
            ROUTE: valorToEdit.ruta || "",
        };
        
        setFormData(formDataFromProp);
        latestFormRef.current = formDataFromProp;
        
        // Establecer el valor inicial del ValueHelpSelector
        setSelectedIdValorPa(idValorPaInicial);

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
                disabled={!valorToEdit || !parentLabel}
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
                                disabled
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
                        <FormItem>
                            <ValueHelpSelector
                                label="ID Valor Padre (IDVALORPA)"
                                placeholder="Buscar o seleccionar valor padre..."
                                data={valueHelpData}
                                value={selectedIdValorPa}
                                onSelect={handleIdValorPaSelect}
                            />
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