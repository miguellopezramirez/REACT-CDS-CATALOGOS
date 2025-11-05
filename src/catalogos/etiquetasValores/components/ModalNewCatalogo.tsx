import { Button, FlexBox, FlexBoxJustifyContent, Form, FormGroup, FormItem, Input, Label, Modals } from '@ui5/webcomponents-react';
// <-- CAMBIO: Importa useRef
import { useState, useRef } from 'react';
import { addOperation } from '../store/labelStore';

const initialFormState = {
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
};

function ModalNewCatalogo() {
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<any>({});
    
    // <-- CAMBIO: Crea una ref para guardar el estado síncronamente
    const latestFormRef = useRef(initialFormState);

    // <-- CAMBIO: 'validate' ahora acepta los datos como parámetro
    // Ya no depende del estado 'formData'
    const validate = (data: typeof initialFormState) => {
        const newErrors: any = {};
        // <-- CAMBIO: Lee de 'data', no de 'formData'
        if (!data.IDETIQUETA) newErrors.IDETIQUETA = 'IDETIQUETA es requerido.';
        if (!data.ETIQUETA) newErrors.ETIQUETA = 'ETIQUETA es requerido.';
        if (!data.INDICE) newErrors.INDICE = 'INDICE es requerido.';
        if (!data.COLECCION) newErrors.COLECCION = 'COLECCION es requerido.';
        if (!data.SECCION) newErrors.SECCION = 'SECCION es requerido.';

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        console.log("Validation result:", isValid, "Errors:", newErrors);
        return isValid;
    };

    const handleChange = (e: any) => {
        const current = e.currentTarget;
        const target = e.target;

        const name = (current && (current.name || (current.getAttribute && current.getAttribute('name'))))
            || (target && (target.name || (target.getAttribute && target.getAttribute('name')))) || '';

        const value = (e && e.detail && e.detail.value !== undefined) ? e.detail.value
            : (target && (target.value !== undefined ? target.value : (target.getAttribute && target.getAttribute('value')))) || '';

        if (!name) {
             console.warn('handleChange no pudo determinar el "name" del campo.');
             return;
        }

        setFormData(prevState => {
            const converted = (name === 'SECUENCIA' || name === 'IDSOCIEDAD' || name === 'IDCEDI') 
                ? (Number(value) || 0) 
                : value;
                
            const updatedState = {
                ...prevState,
                [name]: converted
            };

            // <-- CAMBIO: Actualiza la ref síncronamente
            latestFormRef.current = updatedState;
            
            return updatedState;
        });
    };

    const handleSubmit = async (close: () => void) => {
        console.log("handleSubmit called");
        
        // <-- CAMBIO: Lee los datos más actuales desde la ref
        const snapshot = { ...(latestFormRef.current || formData) };

        // <-- CAMBIO: Pasa el snapshot a la validación
        if (validate(snapshot)) {
            try {
                console.log("Validation passed. Calling addOperation with:", snapshot);
                await addOperation({
                    collection: 'labels',
                    action: 'CREATE',
                    payload: { // Usa el snapshot para el payload
                        ...snapshot,
                        IDSOCIEDAD: Number(snapshot.IDSOCIEDAD) || 0,
                        IDCEDI: Number(snapshot.IDCEDI) || 0,
                        SECUENCIA: Number(snapshot.SECUENCIA) || 0,
                    }
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
                // Resetea el estado Y la ref
                setFormData(initialFormState);
                latestFormRef.current = initialFormState; // <-- CAMBIO
                setErrors({});

                const { close } = Modals.showDialog({
                    headerText: 'Agrega un Catalogo',
                    // El resto del JSX del formulario no cambia...
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