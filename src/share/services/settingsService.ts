// Define los tipos de base de datos permitidos
export type DbServerType = 'MongoDB' | 'CosmosDB';

// Esta es la clave que usaremos en el localStorage del navegador
const DB_KEY = 'app-db-server';

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