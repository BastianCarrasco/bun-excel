// src/config.ts

// Asegúrate de que SPREADSHEET_URL tenga un valor, si no, lanzamos un error.
const SPREADSHEET_URL = process.env.URL_SPREADSHEET;
const URL_FONDOS = process.env.URL_FONDOS; // Ya está aquí

if (!SPREADSHEET_URL) {
  console.error(
    "Error: La variable de entorno URL_SPREADSHEET no está definida."
  );
  process.exit(1); // Sale de la aplicación si no se encuentra la URL
}

// Agregamos la validación para URL_FONDOS
if (!URL_FONDOS) {
  console.error("Error: La variable de entorno URL_FONDOS no está definida.");
  process.exit(1); // Sale de la aplicación si no se encuentra la URL
}

export { SPREADSHEET_URL, URL_FONDOS }; // Exportamos también URL_FONDOS
