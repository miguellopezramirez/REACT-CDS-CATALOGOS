
import { Button, Dialog, FlexBox, FlexBoxJustifyContent, Form, FormGroup, FormItem, Input, Label } from '@ui5/webcomponents-react';
import { useState, useEffect } from 'react';
import { addOperation } from '../store/labelStore';
import { TableParentRow } from '../services/labelService';

interface ModalUpdateCatalogoProps {
    label: TableParentRow | null;
    onUpdate: (label: TableParentRow) => void;
    open: boolean;
    onClose: () => void;
}

function ModalUpdateCatalogo({ label, onUpdate, open, onClose }: ModalUpdateCatalogoProps) {
    const [formData, setFormData] = useState<TableParentRow | null>(label);

    useEffect(() => {
        setFormData(label);
    }, [label]);

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        if (formData) {
            setFormData(prev => ({ ...prev!, [name]: value }));
        }
    };

    const handleUpdate = () => {
        if (formData) {
            addOperation({
                collection: 'labels',
                action: 'UPDATE',
                payload: formData
            });
            if (onUpdate) {
                onUpdate(formData);
            }
            onClose();
        }
    };

    if (!open || !formData) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onAfterClose={onClose}
            headerText='Actualiza el Catalogo'
            footer={
                <FlexBox justifyContent={FlexBoxJustifyContent.End} fitContainer style={{ paddingBlock: '0.25rem' }}>
                    <Button onClick={handleUpdate} design="Emphasized">Guardar</Button>
                    <Button onClick={onClose}>Cancelar</Button>
                </FlexBox>
            }
        >
            <Form>
                <FormGroup titleText='Informacion del Catalogo'>
                    <FormItem titleText='Etiqueta' label={<Label>Etiqueta</Label>}>
                        <Input name="etiqueta" value={formData.etiqueta} onInput={handleChange} />
                    </FormItem>
                    <FormItem titleText='Indice' label={<Label>Índice</Label>}>
                        <Input name="indice" value={formData.indice} onInput={handleChange} />
                    </FormItem>
                    <FormItem titleText='Coleccion' label={<Label>Colección</Label>}>
                        <Input name="coleccion" value={formData.coleccion} onInput={handleChange} />
                    </FormItem>
                    <FormItem titleText='Seccion' label={<Label>Sección</Label>}>
                        <Input name="seccion" value={formData.seccion} onInput={handleChange} />
                    </FormItem>
                    <FormItem titleText='Secuencia' label={<Label>Secuencia</Label>}>
                        <Input name="secuencia" value={formData.secuencia} type="Number" onInput={handleChange} />
                    </FormItem>
                    <FormItem titleText='Descripcion' label={<Label>Descripción</Label>}>
                        <Input name="descripcion" value={formData.descripcion} onInput={handleChange} />
                    </FormItem>
                </FormGroup>
            </Form>
        </Dialog>
    );
}

export default ModalUpdateCatalogo;
