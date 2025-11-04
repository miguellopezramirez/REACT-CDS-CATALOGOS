
import { Button, FlexBox, FlexBoxJustifyContent, Form, FormGroup, FormItem, Input, Label, Modals } from '@ui5/webcomponents-react';
import { useState, useEffect, useRef } from 'react';
import { addOperation } from '../store/labelStore'; // This should be updateOperation later
import { TableParentRow } from '../services/labelService';

interface ModalUpdateCatalogoProps {
    label: TableParentRow | null; // Keep this for now, but it won't be used directly in the UI
}

function ModalUpdateCatalogo({ label }: ModalUpdateCatalogoProps) {
    const initialFormState: TableParentRow = {
        parent: true,
        idetiqueta: '',
        idsociedad: '0',
        idcedi: '0',
        etiqueta: '',
        indice: '',
        coleccion: '',
        seccion: '',
        secuencia: 0,
        imagen: '',
        ruta: '',
        descripcion: '',
        subRows: [],
    };

    const [formData, setFormData] = useState<TableParentRow>(initialFormState);
    // ref to always hold the latest form data synchronously (avoids stale state on submit)
    const latestFormRef = useRef<TableParentRow>(initialFormState);

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (label) {
            console.log('Label recibido en ModalUpdate:', label);
            setFormData(label);
            latestFormRef.current = label;
        }
    }, [label]);

    // validate accepts an explicit data snapshot so validation doesn't depend on possibly-stale state
    const validate = (data: Partial<TableParentRow>) => {
        const newErrors: any = {};
        if (!data.etiqueta) newErrors.etiqueta = 'ETIQUETA es requerido.';
        if (!data.indice) newErrors.indice = 'INDICE es requerido.';
        if (!data.coleccion) newErrors.coleccion = 'COLECCION es requerido.';
        if (!data.seccion) newErrors.seccion = 'SECCION es requerido.';
        if (!data.idetiqueta) newErrors.idetiqueta = 'ID ETIQUETA es requerido.';
        if (data.idsociedad === undefined || data.idsociedad === null || data.idsociedad === '') newErrors.idsociedad = 'ID SOCIEDAD es requerido.';
        if (data.idcedi === undefined || data.idcedi === null || data.idcedi === '') newErrors.idcedi = 'ID CEDI es requerido.';

        // Validar que los campos numéricos sean válidos cuando no estén vacíos
        if (data.secuencia !== undefined && data.secuencia !== null && isNaN(Number(data.secuencia))) newErrors.secuencia = 'SECUENCIA debe ser un número.';
        if (data.idsociedad !== undefined && data.idsociedad !== null && data.idsociedad !== '' && isNaN(Number(data.idsociedad))) newErrors.idsociedad = 'ID SOCIEDAD debe ser un número.';
        if (data.idcedi !== undefined && data.idcedi !== null && data.idcedi !== '' && isNaN(Number(data.idcedi))) newErrors.idcedi = 'ID CEDI debe ser un número.';

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;

        if (!isValid) {
            console.error('Errores de validación:', JSON.stringify(newErrors));
        } else {
            console.log('Validación exitosa. Datos del formulario (snapshot):', JSON.stringify(data));
        }

        return isValid;
    };

    const handleChange = (e: any) => {
        // Preferir currentTarget (el componente al que se ligó el handler) para obtener el nombre
        // y preferir e.detail.value porque @ui5/webcomponents-react lo pone ahí.
        const current = e.currentTarget;
        const target = e.target;

        const name = (current && (current.name || (current.getAttribute && current.getAttribute('name'))))
            || (target && (target.name || (target.getAttribute && target.getAttribute('name')))) || '';

        const value = (e && e.detail && e.detail.value !== undefined) ? e.detail.value
            : (target && (target.value !== undefined ? target.value : (target.getAttribute && target.getAttribute('value')))) || '';

        // Debug: mostrar ambas fuentes posibles para name y value para entender por qué algunos campos no se capturan
        console.log('handleChange event sources ->', {
            currentName: current && (current.name || (current.getAttribute && current.getAttribute('name'))),
            targetName: target && (target.name || (target.getAttribute && target.getAttribute('name'))),
            detailValue: e && e.detail && e.detail.value,
            targetValue: target && target.value,
            computedName: name,
            computedValue: value
        });
        console.log(`Actualizando campo ${name} con valor:`, value);

        setFormData(prevState => {
            const converted = name === 'secuencia' ? (Number(value) || 0) : value;
            const updatedState = {
                ...prevState,
                [name]: converted
            } as TableParentRow;
            // keep ref in sync so submit can read latest values synchronously
            latestFormRef.current = updatedState;
            // console.log('Estado actualizado (calculado):', JSON.stringify(updatedState));
            return updatedState;
        });
    };

    const handleSubmit = async (close: () => void) => {
    // Use the latest synchronous snapshot from ref to avoid stale state when user clicks fast
    const snapshot: TableParentRow = { ...(latestFormRef.current || formData) };

    if (validate(snapshot)) {
            try {
        // console.log('FormData antes de enviar (snapshot):', JSON.stringify(snapshot));

                // CAMBIO: Estructurar el payload como { id, updates }
                const updatePayload = {
                    id: snapshot.idetiqueta, // ID va afuera
                    updates: { // updates es un objeto anidado
                        IDSOCIEDAD: Number(snapshot.idsociedad) || 0,
                        IDCEDI: Number(snapshot.idcedi) || 0,
                        ETIQUETA: snapshot.etiqueta,
                        INDICE: snapshot.indice,
                        COLECCION: snapshot.coleccion,
                        SECCION: snapshot.seccion,
                        SECUENCIA: Number(snapshot.secuencia) || 0,
                        IMAGEN: snapshot.imagen,
                        ROUTE: snapshot.ruta,
                        DESCRIPCION: snapshot.descripcion
                        // NOTA: No es necesario incluir IDETIQUETA dentro de 'updates'
                    }
                };

                // console.log('Payload a enviar (anidado):', JSON.stringify(updatePayload));

                await addOperation({
                    collection: 'labels',
                    action: 'UPDATE',
                    payload: updatePayload // Enviar el nuevo payload
                });
                console.log('Operación de actualización enviada');
                close();
            } catch (error) {
                console.error("Error calling update operation:", error);
            }
        }
    };

    return <>
        <Button
            design="Emphasized"
            icon="edit"
            onClick={() => {
                const { close } = Modals.showDialog({
                    headerText: 'Actualiza el Catalogo',
                    children: <Form>
                        <FormGroup headerText='Informacion del Catalogo'>
                            <FormItem labelContent={<Label required>ID de la etiqueta</Label>}>
                                <Input name="idetiqueta" value={formData.idetiqueta} onInput={handleChange} />
                                {errors.idetiqueta && <span style={{ color: 'red' }}>{errors.idetiqueta}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label >IDSOCIEDAD</Label>}>
                                <Input type="Number" name="idsociedad" value={formData.idsociedad.toString()} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>IDCEDI</Label>}>
                                <Input type="Number" name="idcedi" value={formData.idcedi.toString()} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label required>ETIQUETA</Label>}>
                                <Input name="etiqueta" value={formData.etiqueta} onInput={handleChange} />
                                {errors.etiqueta && <span style={{ color: 'red' }}>{errors.etiqueta}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>INDICE</Label>}>
                                <Input name="indice" value={formData.indice} onInput={handleChange} />
                                {errors.indice && <span style={{ color: 'red' }}>{errors.indice}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>COLECCION</Label>}>
                                <Input name="coleccion" value={formData.coleccion} onInput={handleChange} />
                                {errors.coleccion && <span style={{ color: 'red' }}>{errors.coleccion}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>SECCION</Label>}>
                                <Input name="seccion" value={formData.seccion} onInput={handleChange} />
                                {errors.seccion && <span style={{ color: 'red' }}>{errors.seccion}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label>SECUENCIA</Label>}>
                                <Input name="secuencia" type="Number" value={formData.secuencia.toString()} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Imagen</Label>}>
                                <Input name="imagen" value={formData.imagen} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Ruta</Label>}>
                                <Input name="ruta" value={formData.ruta} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Descripcion</Label>}>
                                <Input name="descripcion" value={formData.descripcion} onInput={handleChange} />
                            </FormItem>
                        </FormGroup>
                    </Form>,
                    footer: <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{
                        paddingBlock: '0.25rem'
                    }}>
                        <Button onClick={() => handleSubmit(close)}>Actualizar</Button>
                        <Button onClick={() => close()}>Cancelar</Button>{' '}
                    </FlexBox>
                });
            }}>
            Actualizar Catalogo
        </Button>
    </>
}

export default ModalUpdateCatalogo;
