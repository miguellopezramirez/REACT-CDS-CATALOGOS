// src/ecommerce/prices/components/modals/AddPriceModal.jsx
import React, {useState} from "react";
import { Dialog, DialogContent, DialogTitle, Typography, TextField, DialogActions } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addPrice } from '../../services/remote/post/AddPrice';
import MyAddLabels from "../elements/MyAddLabels"; 

const AddPriceModal = ({ showModal, setShowModal }) => {
    const [Loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            IdProdServOK: "",
            IdPresentaOK: "",
            IdTipoFormulaOK: "",
            Formula: "", 
            CostoIni: "",
            CostoFin: "",
            Precio: "",
            detail_row: {
                Activo: "S",
                Borrado: "N",
                detail_row_reg: [
                {
                    FechaReg: "2024-10-05T00:00:00.628Z",
                    UsuarioReg: "Carlos"
                }
                ]
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
            console.log("Valores enviados:", values);
            try {
                await addPrice(values); // Llama a la API para agregar el precio
                setShowModal(false); 
                console.log("Precio agregado con éxito:", values);
            } catch (error) {
                console.error("Error al agregar el precio:", error);
            }
            setLoading(false);
        },
    });    

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth>
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>
                    <Typography > {/* Cambiado de h6 a h5 */}
                        <strong>Agregar Nuevo Precio</strong>
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column' }} dividers>
                    <TextField
                        id="IdProdServOK"
                        label="ID Producto*"
                        required
                        value={formik.values.IdProdServOK}
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
                    disabled={Loading}
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
                        loading={Loading}
                    >
                        GUARDAR
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddPriceModal;
