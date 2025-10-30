// src/ecommerce/prices/components/PricesTable.jsx
import React, { useEffect, useState } from "react";
import { MaterialReactTable } from 'material-react-table';
import { Box, Stack, Tooltip, IconButton, darken } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddPriceModal from '../modals/AddPriceModal';
import { usePricesContext } from "../../pages/PricesProvider";
import UpdatePriceModal from "../modals/UpdatePriceModal"
import { showMensajeError, showMensajeConfirm } from "../elements/messages/mySwalAlers";
import { delPrice } from "../../services/remote/del/delPrice";
// Definir columnas de la tabla de precios
const PricesColumns = [
  { accessorKey: 'IdPresentaOK', header: 'ID Producto', size: 30 },
  { accessorKey: 'Precio', header: 'Precio', size: 100 },
  { accessorKey: 'CostoIni', header: 'Costo Inicial', size: 100 },
  { accessorKey: 'CostoFin', header: 'Costo Final', size: 100 },
  { accessorKey: 'IdTipoFormulaOK', header: 'Tipo de Fórmula', size: 150 },
];

const PricesTable = () => {
    const {
        prices,
        priceSel,
        loadingTable,
        idSelectedRowPrices,
        idSelectedRowPresentation,
        presentationSel,
        setPriceSel,
        fetchDataPrices,
        fetchDataPriceSelect,
        setIdSelectedRowPrices,
        setIdSelectedRowPresentation,
        setPresentationSel,
        showToastExito,
    } = usePricesContext();

    const [showAddPriceModal, setShowAddPriceModal] = useState(false); // Estado para el modal
    const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false); // Estado para el modal

   
    //Eliminar
    
    // Método handleReload para recargar manualmente los datos de la tabla
    const handleReload = async () => {
        await fetchDataPrices();
    };

    const handleDelete = async () => {
        const res = await showMensajeConfirm(
          `El producto con el ID ${priceSel.IdPresentaOK} será eliminado, ¿Desea continuar?`
        );
        if (res) {
          try {
            await delPrice(priceSel.IdPresentaOK);
            setPriceSel(null);
            fetchDataPrices();
            showToastExito("Se eliminó el Producto");
            handleReload();
          } catch (e) {
            
          }
        }else{
            showMensajeError(
                `No se pudo Eliminar el Pruducto ${priceSel.IdPresentaOK} `
              );    
        }
        handleReload();
      };

    return (
        <Box>
            <MaterialReactTable
                columns={PricesColumns}
                data={prices} // Datos de precios obtenidos de la API
                state={{ isLoading: loadingTable }}
                initialState={{ density: "compact", showGlobalFilter: true }}
                muiTableBodyRowProps={({ row }) => ({
                    onClick: () => {
                        console.log("ROW", row.original, "ID", row.id);
                        setPriceSel(row.original);
                        setIdSelectedRowPrices(row.id);
                        
                      },
                      sx: {
                        //FIC: si esta cargando no debes dar click aun
                        cursor: loadingTable ? "not-allowed" : "pointer", 
                        backgroundColor:
                          idSelectedRowPrices === row.id
                            ? darken("#EFF999", 0.01)
                            : "inherit",
                      },
                })}
                renderTopToolbarCustomActions={() => (
                    <Stack direction="row" sx={{ m: 1 }}>
                        <Tooltip title="Agregar">
                            <IconButton onClick={() => setShowAddPriceModal(true)}>
                                <AddCircleIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Recargar">
                            <IconButton onClick={handleReload}> {/* Usa handleReload para recargar */}
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Actualizar">
                            <IconButton onClick={() => setShowUpdatePriceModal(true)}> {/* Usa handleReload para recargar */}
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton onClick={handleDelete}> {/* Usa handleReload para recargar */}
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            />
            {/* Modal para agregar nuevo precio */}
            <AddPriceModal 
                showModal={showAddPriceModal} 
                setShowModal={(open) => {
                    setShowAddPriceModal(open);
                    if (!open) fetchDataPrices(); // Recargar precios si se cierra el modal
                }}
            />
            <UpdatePriceModal 
                showModal={showUpdatePriceModal}
                data = {priceSel}
                setShowModal={(open) => {
                    setShowUpdatePriceModal(open);
                    if (!open) fetchDataPrices(); // Recargar precios si se cierra el modal
                }
                }
                
            />
        </Box>
    );
};

export default PricesTable;
