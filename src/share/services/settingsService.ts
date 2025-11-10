// src/share/services/settingsService.ts

// Define los tipos de base de datos permitidos
export type DbServerType = 'MongoDB' | 'CosmosDB';
// FIC: Define los tipos de tema permitidos
export type ThemeType = 'sap_horizon' | 'sap_horizon_dark'; // Añadir nuevo tipo para el tema

// Esta es la clave que usaremos en el localStorage del navegador
const DB_KEY = 'app-db-server';
// FIC: Clave para el tema en localStorage
const THEME_KEY = 'app-theme';


/**
 * Obtiene la configuración de la base de datos guardada.
 * Por defecto, devuelve 'MongoDB' si no hay nada guardado.
 */
export const getDbServer = (): DbServerType => {
  const storedValue = localStorage.getItem(DB_KEY); // Lee del localStorage
  
  if (storedValue === 'CosmosDB') {
    return 'CosmosDB';
  }
  
  // Devuelve 'MongoDB' por defecto o si está explícitamente guardado
  return 'MongoDB';
};

/**
 * Guarda la selección de la base de datos en el localStorage.
 */
export const setDbServer = (server: DbServerType) => {
  localStorage.setItem(DB_KEY, server);
};

// FIC: Nuevas funciones para gestionar el tema

/**
 * Obtiene la configuración del tema guardada.
 * Por defecto, devuelve 'sap_horizon' (claro).
 */
export const getTheme = (): ThemeType => {
  const storedValue = localStorage.getItem(THEME_KEY);
  // FIC: Si es modo oscuro, devolver 'sap_horizon_dark'
  if (storedValue === 'sap_horizon_dark') {
    return 'sap_horizon_dark';
  }
  // FIC: Por defecto o si está guardado explícitamente como claro, devolver 'sap_horizon'
  return 'sap_horizon';
};

/**
 * Guarda la selección del tema en el localStorage.
 */
export const setTheme = (theme: ThemeType) => {
  localStorage.setItem(THEME_KEY, theme);
};