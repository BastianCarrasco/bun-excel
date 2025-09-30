// src/config.ts

// Asegúrate de que SPREADSHEET_URL tenga un valor, si no, lanzamos un error.
const SPREADSHEET_URL = process.env.URL_SPREADSHEET;

if (!SPREADSHEET_URL) {
  console.error(
    "Error: La variable de entorno URL_SPREADSHEET no está definida."
  );
  process.exit(1); // Sale de la aplicación si no se encuentra la URL
}

export { SPREADSHEET_URL };
