// src/ecommerce/prices/components/modals/UpdatePriceModal.jsx
import React, {useState, useEffect} from "react";
import { Dialog, DialogContent, DialogTitle, Typography, TextField, DialogActions } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useFormik } from "formik";
import * as Yup from "yup";
import { putPrice } from '../../services/remote/put/putPrice';
import { addPrice } from '../../services/remote/post/AddPrice';
import MyAddLabels from "../elements/MyAddLabels"; 
import axios from 'axios';


const UpdatePriceModal = ({ showModal, setShowModal, data }) => {
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,  // Permite que los valores iniciales cambien cuando se recibe nueva data
        initialValues: {
            IdProdServOK: data?.IdProdServOK || "",
            IdPresentaOK: data?.IdPresentaOK || "",
            IdTipoFormulaOK: data?.IdTipoFormulaOK || "",
            Formula: data?.Formula || "",
            CostoIni: data?.CostoIni || "",
            CostoFin: data?.CostoFin || "",
            Precio: data?.Precio || "",
            detail_row: data?.detail_row || {
                Activo: "S",
                Borrado: "N",
                detail_row_reg: [{
                    FechaReg: new Date().toISOString(),
                    UsuarioReg: "defaultUser"
                }]
            }
        },
        validationSchema: Yup.object({
            IdProdServOK: Yup.string().required("Campo requerido"),
            IdPresentaOK: Yup.string().required("Campo requerido"),
            Precio: Yup.number().required("Campo requerido").positive("El precio debe ser positivo"),
            CostoIni: Yup.number().required("Campo requerido").positive("El costo inicial debe ser positivo"),
            CostoFin: Yup.number().required("Campo requerido").positive("El costo final debe ser positivo"),
            IdTipoFormulaOK: Yup.string().required("Campo requerido"),
            Formula: Yup.string().required("Campo requerido")
        }),
        onSubmit: async (values) => {
            setLoading(true);
            console.log("Datos actualizados:", values);
            
            try {
                // Aquí se llamará a la API PUT
                await putPrice(values.IdPresentaOK,values); // Llama a la API para agregar el precio
                console.log("Precio actulizado con éxito:", values);

                setShowModal(false); // Cierra el modal al completar la solicitud
                
            } catch (error) {
                console.error("Error al actualizar:", error);
            }
            setLoading(false);
        },
    });

    useEffect(() => {
        console.log('Datos recibidos para edición:', data);
    }, [data]);

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth>
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>
                    <Typography > {/* Cambiado de h6 a h5 */}
                        <strong>Actualizar Precio</strong>
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column' }} dividers>
                    <TextField
                        id="IdProdServOK"
                        label="ID Producto*"
                        required
                        value={formik.values.IdProdServOK}
                        disabled={true}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.IdProdServOK && Boolean(formik.errors.IdProdServOK)}
                        helperText={formik.touched.IdProdServOK && formik.errors.IdProdServOK}
                    />
                    <TextField
                        id="IdPresentaOK"
                        label="ID Presentación*"
                        required
                        value={formik.values.IdPresentaOK}
                        disabled={true}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.IdPresentaOK && Boolean(formik.errors.IdPresentaOK)}
                        helperText={formik.touched.IdPresentaOK && formik.errors.IdPresentaOK}
                    />
                    <TextField
                        id="Precio"
                        label="Precio*"
                        type="number"
                        required
                        value={formik.values.Precio}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.Precio && Boolean(formik.errors.Precio)}
                        helperText={formik.touched.Precio && formik.errors.Precio}
                    />
                    <TextField
                        id="CostoIni"
                        label="Costo Inicial*"
                        type="number"
                        required
                        value={formik.values.CostoIni}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.CostoIni && Boolean(formik.errors.CostoIni)}
                        helperText={formik.touched.CostoIni && formik.errors.CostoIni}
                    />
                    <TextField
                        id="CostoFin"
                        label="Costo Final*"
                        type="number"
                        required
                        value={formik.values.CostoFin}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.CostoFin && Boolean(formik.errors.CostoFin)}
                        helperText={formik.touched.CostoFin && formik.errors.CostoFin}
                    />
                    <TextField
                        id="IdTipoFormulaOK"
                        label="Tipo de Fórmula*"
                        required
                        value={formik.values.IdTipoFormulaOK}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.IdTipoFormulaOK && Boolean(formik.errors.IdTipoFormulaOK)}
                        helperText={formik.touched.IdTipoFormulaOK && formik.errors.IdTipoFormulaOK}
                    />
                    <TextField
                        id="Formula"
                        label="Fórmula*"
                        required
                        value={formik.values.Formula}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.Formula && Boolean(formik.errors.Formula)}
                        helperText={formik.touched.Formula && formik.errors.Formula}
                    />
                    <MyAddLabels
                    label="Agrega Índices de Búsqueda"
                    onChangeLabels={(labels) => (formik.values.Indice = labels.join("-"))}
                    disabled={loading}
                />
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        color="secondary"
                        loadingPosition="start"
                        startIcon={<CloseIcon />}
                        variant="outlined"
                        onClick={() => setShowModal(false)}
                    >
                        CERRAR
                    </LoadingButton>
                    <LoadingButton
                        color="primary"
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        type="submit" // Cambiar a tipo submit
                        loading={loading}
                    >
                        GUARDAR
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdatePriceModal;
