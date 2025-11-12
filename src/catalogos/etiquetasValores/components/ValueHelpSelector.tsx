import React, { useState, useMemo, useEffect, FC } from 'react';
import {
    Input,
    Dialog,
    List,
    ListItemStandard,
    ListItemGroup,
    Button,
    Bar,
    Title,
    Label,
    Icon,
    Search
} from '@ui5/webcomponents-react';
import type { SearchDomRef, ListDomRef } from '@ui5/webcomponents-react';
import type { Ui5CustomEvent } from '@ui5/webcomponents-react-base';
import type { ListSelectionChangeEventDetail } from '@ui5/webcomponents/dist/List.js';

// (Tus interfaces TableSubRow y LabelData van aquí... están perfectas)
// ...

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
    indice: string;
    coleccion: string;
    seccion: string;
}

export interface LabelData {
    parent?: boolean;
    idsociedad: string;
    idcedi: string;
    idetiqueta: string;
    etiqueta: string; // Nombre de la etiqueta
    indice: string;
    coleccion: string;
    seccion: string;
    secuencia: number;
    imagen: string | null;
    ruta: string | null;
    descripcion: string;
    subRows: TableSubRow[]; // Array de valores
}

// Props para el componente ValueHelpSelector
export interface ValueHelpSelectorProps {
    data: LabelData[];
    value: string | null;
    // --- AJUSTE (1) ---
    // Habilitamos que 'onSelect' pueda recibir 'null'
    onSelect: (selectedValue: string | null) => void; 
    label?: string;
    placeholder?: string;
    required?: boolean;
}

/**
 * Busca un objeto 'valor' (TableSubRow) dentro de la estructura de datos
 * basándose en su idvalor.
 */
function findValueById(data: LabelData[], id: string | null): TableSubRow | null {
    if (!id || !data) return null;
    for (const label of data) {
        const foundValue = (label.subRows || []).find(v => v.idvalor === id);
        if (foundValue) {
            return foundValue;
        }
    }
    return null;
}

/**
 * Componente reutilizable de Ayuda de Valor (Value Help)
 * para seleccionar un valor de una estructura anidada de Etiquetas -> Valores.
 */
export const ValueHelpSelector: FC<ValueHelpSelectorProps> = ({
    data,
    value,
    onSelect,
    label,
    placeholder,
    required = false
}) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [displayedValue, setDisplayedValue] = useState<string>('');

    // (Tu useEffect y useMemo están perfectos)
    useEffect(() => {
        if (value) {
            const selectedItem = findValueById(data, value);
            setDisplayedValue(selectedItem ? selectedItem.valor : '');
        } else {
            setDisplayedValue('');
        }
    }, [value, data]);

    const filteredData = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!lowerSearchTerm) return data; 

        return data
            .map(label => ({
                ...label,
                subRows: (label.subRows || []).filter(valor =>
                    valor.valor.toLowerCase().includes(lowerSearchTerm)
                ),
            }))
            .filter(label => label.subRows.length > 0);
    }, [data, searchTerm]);

    // --- Manejadores de Eventos ---

    const handleOpenDialog = () => {
        setSearchTerm('');
        setDialogOpen(true);
    };
    
    const handleCloseDialog = () => setDialogOpen(false);

    const handleSearchChange = (event: Ui5CustomEvent<SearchDomRef>) => {
        setSearchTerm(event.target.value ?? '');
    };

    const handleValueSelect = (event: Ui5CustomEvent<ListDomRef, ListSelectionChangeEventDetail>) => {
        const selectedItem = event.detail.selectedItems[0] as HTMLElement;
        const id = selectedItem.dataset.idvalor;

        if (id) {
            onSelect(id);
            handleCloseDialog();
        }
    };

    // --- NUEVO MANEJADOR ---
    // Para el botón "Ninguno"
    const handleClearSelect = () => {
        onSelect(null); // Envía 'null' para limpiar el valor
        handleCloseDialog();
    };

    // --- Renderizado ---

    return (
        <>
            {label && <Label required={required}>{label}</Label>}
            <Input
                value={displayedValue}
                readonly
                placeholder={placeholder || 'Seleccionar...'}
                icon={<Icon
                    name="value-help"
                    onClick={handleOpenDialog}
                    style={{ cursor: 'pointer' }}
                />}
            /> 

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog} // Buena práctica
                
                // --- AJUSTE (2): TAMAÑO DE LA MODAL ---
                // Le damos un ancho máximo o fijo. 
                // '500px' es un buen punto de partida.
                style={{ width: '500px' }} 

                header={
                    <Bar
                        startContent={<Title>Seleccionar Valor</Title>}
                        endContent={
                            <Search
                                placeholder="Buscar valor..."
                                onInput={handleSearchChange}
                            />
                        }
                    />
                }
                footer={
                    <Bar
                        // --- AJUSTE (3): BOTÓN "NINGUNO" ---
                        // 'startContent' pone el botón a la izquierda
                        startContent={
                            <Button
                                design="Transparent"
                                onClick={handleClearSelect}
                            >
                                Ninguno
                            </Button>
                        }
                        endContent={
                            <Button onClick={handleCloseDialog}>Cerrar</Button>
                        }
                    />
                }
            >
                <List
                    selectionMode="Single"
                    onSelectionChange={handleValueSelect}
                >
                    {filteredData.length === 0 && (
                        <ListItemStandard>No se encontraron resultados.</ListItemStandard>
                    )}
                    {filteredData.map(label => (
                        <React.Fragment key={label.idetiqueta}>
                            <ListItemGroup>
                                {label.etiqueta}
                            </ListItemGroup>
                            {label.subRows.map(valor => (
                                <ListItemStandard
                                    key={valor.idvalor}
                                    data-idvalor={valor.idvalor}
                                    selected={value === valor.idvalor}
                                >
                                    {valor.valor}
                                </ListItemStandard>
                            ))}
                        </React.Fragment>
                    ))}
                </List>
            </Dialog>
        </>
    );
};