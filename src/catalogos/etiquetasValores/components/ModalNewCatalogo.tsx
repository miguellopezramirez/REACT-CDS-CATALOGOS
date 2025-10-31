import { Button, FlexBox, FlexBoxJustifyContent, Form, FormGroup, FormItem, Input, Label, Modals } from '@ui5/webcomponents-react';
import { useState } from 'react';
import { addOperation } from '../store/labelStore';

function ModalNewCatalogo() {
    const [formData, setFormData] = useState({
        IDETIQUETA: '',
        IDSOCIEDAD: 0,
        IDCEDI: 0,
        ETIQUETA: '',
        INDICE: '',
        COLECCION: '',
        SECCION: '',
        SECUENCIA: 0,
        IMAGEN: '',
        ROUTE: '',
        DESCRIPCION: '',
    });

    const [errors, setErrors] = useState<any>({});

    const validate = () => {
        const newErrors: any = {};
        if (!formData.IDETIQUETA) newErrors.IDETIQUETA = 'IDETIQUETA es requerido.';
        if (!formData.ETIQUETA) newErrors.ETIQUETA = 'ETIQUETA es requerido.';
        if (!formData.INDICE) newErrors.INDICE = 'INDICE es requerido.';
        if (!formData.COLECCION) newErrors.COLECCION = 'COLECCION es requerido.';
        if (!formData.SECCION) newErrors.SECCION = 'SECCION es requerido.';

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        console.log("Validation result:", isValid, "Errors:", newErrors);
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
        console.log("handleSubmit called");
        if (validate()) {
            try {
                console.log("Validation passed. Calling addOperation with:", formData);
                await addOperation({
                    collection: 'labels',
                    action: 'CREATE',
                    payload: formData
                });
                console.log("addOperation completed. Closing modal.");
                close();
            } catch (error) {
                console.error("Error calling addOperation:", error);
            }
        } else {
            console.log("Validation failed. Errors:", errors);
        }
    };

    return <>
        <Button
            design="Positive"
            icon="add"
            onClick={() => {
                const { close } = Modals.showDialog({
                    headerText: 'Agrega un Catalogo',
                    children: <Form>
                        <FormGroup headerText='Informacion del Catalogo'>
                            <FormItem labelContent={<Label required>ID de la etiqueta</Label>}>
                                <Input name="IDETIQUETA" value={formData.IDETIQUETA} onInput={handleChange} />
                                {errors.IDETIQUETA && <span style={{ color: 'red' }}>{errors.IDETIQUETA}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label >IDSOCIEDAD</Label>}>
                                <Input type="Number" name="IDSOCIEDAD" value={formData.IDSOCIEDAD.toString()} onInput={handleChange} />
                                
                            </FormItem>
                            <FormItem labelContent={<Label>IDCEDI</Label>}>
                                <Input type="Number" name="IDCEDI" value={formData.IDCEDI.toString()} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label required>ETIQUETA</Label>}>
                                <Input name="ETIQUETA" value={formData.ETIQUETA} onInput={handleChange} />
                                {errors.ETIQUETA && <span style={{ color: 'red' }}>{errors.ETIQUETA}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>INDICE</Label>}>
                                <Input name="INDICE" value={formData.INDICE} onInput={handleChange} />
                                {errors.INDICE && <span style={{ color: 'red' }}>{errors.INDICE}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>COLECCION</Label>}>
                                <Input name="COLECCION" value={formData.COLECCION} onInput={handleChange} />
                                {errors.COLECCION && <span style={{ color: 'red' }}>{errors.COLECCION}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label required>SECCION</Label>}>
                                <Input name="SECCION" value={formData.SECCION} onInput={handleChange} />
                                {errors.SECCION && <span style={{ color: 'red' }}>{errors.SECCION}</span>}
                            </FormItem>
                            <FormItem labelContent={<Label>SECUENCIA</Label>}>
                                <Input name="SECUENCIA" type="Number" value={formData.SECUENCIA.toString()} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Imagen</Label>}>
                                <Input name="IMAGEN" value={formData.IMAGEN} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Ruta</Label>}>
                                <Input name="ROUTE" value={formData.ROUTE} onInput={handleChange} />
                            </FormItem>
                            <FormItem labelContent={<Label>Descripcion</Label>}>
                                <Input name="DESCRIPCION" value={formData.DESCRIPCION} onInput={handleChange} />
                            </FormItem>
                        </FormGroup>
                    </Form>,
                    footer: <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{
                        paddingBlock: '0.25rem'
                    }}>
                        <Button onClick={() => handleSubmit(close)}>Crear</Button>
                        <Button onClick={() => close()}>Close</Button>{' '}
                    </FlexBox>
                });
            }}>
            Crear Nuevo Catalogo
        </Button>
    </>
}

export default ModalNewCatalogo;