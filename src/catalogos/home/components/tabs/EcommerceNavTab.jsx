import { Box, Tabs, Tab } from "@mui/material";
import React, { useState } from "react";

// Define los tabs que tendrá tu aplicación
const ecommerceTabs = ["Productos", "Precios", "Órdenes", "Pagos", "Envíos", "Inventarios"];

const EcommerceNavTab = ({ setCurrentTabName }) => {
    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    const handleChange = (event, newValue) => {
        setCurrentTabIndex(newValue);
        // Actualiza el nombre del tab actual seleccionado
        setCurrentTabName(ecommerceTabs[newValue]);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                value={currentTabIndex}
                onChange={handleChange}
                variant="fullWidth"
                aria-label="ecommerce navigation tabs"
                textColor="primary"
            >
                {ecommerceTabs.map((tab, index) => (
                    <Tab key={index} label={tab} />
                ))}
            </Tabs>
        </Box>
    );
};

export default EcommerceNavTab;
