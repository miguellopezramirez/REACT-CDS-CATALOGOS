// src/ecommerce/prices/components/PricesTab.jsx
import React from 'react';
import PricesTable from '../tables/PricesTable';
import { PricesProvider } from '../../pages/PricesProvider'; // Importa el contexto

const PricesTab = () => {
    return (
        <PricesProvider> {/* Envuelve PricesTable con PricesProvider */}
            <div>
                <PricesTable />
            </div>
        </PricesProvider>
    );
};

export default PricesTab;
