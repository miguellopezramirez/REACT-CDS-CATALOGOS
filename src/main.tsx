import '@ui5/webcomponents-react/dist/Assets.js';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './share/css/allPages.css';
import AppAllModules from './AppAllModules';
import TableLabels from './catalogos/etiquetasValores/pages/TableLabels';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <AppAllModules />
      {/* <TableLabels /> */}
    </ThemeProvider>
  </StrictMode>,
);
