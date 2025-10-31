
import { Button, FlexBox, FlexBoxJustifyContent, Form, FormGroup, FormItem, Input, Label, Modals } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';
import { addOperation } from '../store/labelStore'; // This should be updateOperation later
import { TableParentRow } from '../services/labelService';

interface ModalUpdateCatalogoProps {
    label: TableParentRow | null; // Keep this for now, but it won't be used directly in the UI
}

function ModalUpdateCatalogo({ label }: ModalUpdateCatalogoProps) {
    const [formData, setFormData] = useState<TableParentRow>({
        idetiqueta: '',
        idsociedad: 0,
        idcedi: 0,
        etiqueta: '',
        indice: '',
        coleccion: '',
        seccion: '',
        secuencia: 0,
        imagen: '',
        ruta: '',
        descripcion: '',
        idvalor: '',
        idvalorpa: '',
        isSelected: false,
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (label) {
            setFormData(label);
        }
    }, [label]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.etiqueta) newErrors.etiqueta = 'ETIQUETA es requerido.';
        if (!formData.indice) newErrors.indice = 'INDICE es requerido.';
        if (!formData.coleccion) newErrors.coleccion = 'COLECCION es requerido.';
        if (!formData.seccion) newErrors.seccion = 'SECCION es requerido.';

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        return isValid;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (close: () => void) => {
        if (validate()) {
            try {
                // Placeholder for update operation
                await addOperation({ // This should be updateOperation later
                    collection: 'labels',
                    action: 'UPDATE',
                    payload: formData
                });
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
