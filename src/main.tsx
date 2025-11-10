// src/main.tsx
import '@ui5/webcomponents-react/dist/Assets.js';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './share/css/allPages.css';
import AppAllModules from './AppAllModules';
import { Modals } from '@ui5/webcomponents-react/Modals';
import './index.css';
import { getTheme, ThemeType } from './share/services/settingsService';
import { themeChangeEvent } from './catalogos/settings/pages/Settings'; 
// FIC: Importar el set de tema directamente de UI5 Web Components
import { setTheme as setUi5Theme } from "@ui5/webcomponents-base/dist/config/Theme";

// Componente Wrapper para el tema
const ThemedApp = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getTheme());

  // FIC: Efecto para inicializar y aplicar el tema guardado
  useEffect(() => {
    // 1. Aplicar el tema actual (leído del localStorage) en el inicio
    setUi5Theme(currentTheme); 
    
    // 2. Configurar listener para el evento de cambio de tema
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeType>;
      const newTheme = customEvent.detail;
      
      console.log("Evento de cambio de tema recibido:", newTheme);

      // 3. Usar la función oficial de UI5 para cambiar el tema
      setUi5Theme(newTheme);
      
      // 4. Actualizar el estado local (para forzar re-render si fuera necesario, 
      // aunque setTheme de UI5 ya maneja la mayor parte)
      setCurrentTheme(newTheme);
    };

    // Escuchar el evento personalizado disparado por Settings.tsx
    document.addEventListener(themeChangeEvent, handleThemeChange as EventListener);

    // Limpiar el listener al desmontar
    return () => {
      document.removeEventListener(themeChangeEvent, handleThemeChange as EventListener);
    };
    
    // NOTA: El tema se aplica con setUi5Theme(currentTheme) al montar y ThemeProvider
    // utiliza la configuración global de UI5, por lo que no necesita props.
  }, []); 

  return (
    <ThemeProvider> 
      <Modals />
      <AppAllModules />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemedApp /> 
  </StrictMode>,
);