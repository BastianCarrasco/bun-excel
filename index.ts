import { Elysia } from "elysia";

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTc4JPIifLl-2YktRF3J0at4GKmh9MQO5lP1I6uZP0OnSDvRJw9Kmay6c4GRsck0QL3T9Wf_ACGd6Sb/pub?output=csv";

const app = new Elysia()
  .get("/", () => "Welcome to T3 Chat's Google Sheets API!")
  .get("/data", async ({ set }) => {
    try {
      console.log("Intentando obtener datos de:", SPREADSHEET_URL);
      const response = await fetch(SPREADSHEET_URL);

      if (!response.ok) {
        set.status = 1000;
        console.error(
          `Error al hacer fetch a la hoja de cálculo: HTTP status ${response.status}`
        );
        return {
          error: `Failed to fetch spreadsheet data: HTTP status ${response.status}`,
        };
      }

      const csvText = await response.text();
      console.log(
        "CSV recibido (primeras 1000 caracteres):",
        csvText.substring(0, 1000)
      );

      const data = parseCsvToObjectsFlexible(csvText); // <<--- Usamos la nueva función flexible
      console.log("Datos parseados:", data);

      set.headers["Content-Type"] = "application/json";
      set.headers["Access-Control-Allow-Origin"] = "*";
      return data;
    } catch (error: any) {
      console.error("Error EN EL SERVIDOR:", error);
      set.status = 1000;
      set.headers["Content-Type"] = "application/json";
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to fetch or process spreadsheet data",
        details: error.message,
      };
    }
  })
  .listen(3000, () => {
    console.log(`Elysia server running on http://localhost:3000`);
  });

/**
 * Función flexible para parsear una cadena CSV a un array de objetos.
 * No asume una estructura fija ni renombra encabezados.
 * Intenta convertir valores numéricos donde sea apropiado.
 */
function parseCsvToObjectsFlexible(csv: string): Record<string, any>[] {
  const lines = csv.trim().split("\n");
  if (lines.length === 0) {
    return [];
  }

  // Extraemos los encabezados tal cual vienen, limpiando espacios y comillas
  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/['"\r]/g, ""));

  const data: Record<string, any>[] = [];

  // Procesamos las líneas de datos
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((value) => value.trim().replace(/['"\r]/g, "")); // Limpiamos espacios y comillas de los valores

    const rowData: Record<string, any> = {};

    // Aseguramos que el número de valores coincide con el número de encabezados
    if (values.length === headers.length) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        let value: string | number = values[j];

        // Intentamos convertir a número si es posible
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() !== "") {
          // Asegurarse de que no sea una cadena vacía que se convierta a 0
          value = numValue;
        }

        rowData[header] = value;
      }
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    } else {
      console.warn(
        `Saltando fila ${i + 1} debido a un número de valores (${
          values.length
        }) que no coincide con el número de encabezados (${headers.length}).`
      );
    }
  }

  return data;
}

// La función parseGoogleSheetHtml no es necesaria y debería ser eliminada si está en el archivo.
