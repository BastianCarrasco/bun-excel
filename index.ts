import { Elysia, t } from "elysia"; // t se usa solo para el ESQUEMA de ERRORES
import { swagger } from "@elysiajs/swagger";

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTc4JPIifLl-2YktRF3J0at4GKmh9MQO5lP1I6uZP0OnSDvRJw9Kmay6c4GRsck0QL3T9Wf_ACGd6Sb/pub?output=csv";

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger", // La ruta donde se servirá la interfaz de Swagger UI
      documentation: {
        info: {
          title: "API de Google Sheets by T3 Chat",
          version: "1.0.0",
          description:
            "API para obtener datos de una hoja de cálculo de Google publicada en formato CSV.",
        },
        tags: [
          {
            name: "Google Sheets",
            description: "Operaciones relacionadas con Google Sheets",
          },
        ],
      },
      // Esto puede ayudar a debuggear si el problema es la generación del OpenAPI.json
      // exclude: ['/data'], // Si el problema persiste solo en /data, puedes excluirlo temporalmente para ver si swagger funciona para '/'
    })
  )
  .get("/", () => "Welcome to T3 Chat's Google Sheets API!")
  .get(
    "/data",
    async ({ set }) => {
      try {
        console.log("Intentando obtener datos de:", SPREADSHEET_URL);
        const response = await fetch(SPREADSHEET_URL);

        if (!response.ok) {
          set.status = 500;
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

        const data = parseCsvToObjectsFlexible(csvText);
        console.log("Datos parseados:", data);

        set.headers["Access-Control-Allow-Origin"] = "*"; // CORS
        return data; // Devolverá Record<string, any>[]
      } catch (error: any) {
        console.error("Error EN EL SERVIDOR:", error);
        set.status = 500;
        set.headers["Access-Control-Allow-Origin"] = "*"; // CORS
        return {
          error: "Failed to fetch or process spreadsheet data",
          details: error.message,
        };
      }
    },
    {
      detail: {
        summary: "Obtener todos los datos de la hoja de cálculo",
        description:
          "Recupera todos los datos de la hoja de cálculo de Google publicada en formato CSV, convirtiéndolos a JSON. La estructura de los datos es flexible y depende de los encabezados de la hoja.",
        tags: ["Google Sheets"],
      },
    }
  )
  .listen(3000, () => {
    console.log(`Elysia server running on http://localhost:3000`);
    console.log(`Swagger UI disponible en http://localhost:3000/swagger`);
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

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/['"\r]/g, ""));

  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((value) => value.trim().replace(/['"\r]/g, ""));

    const rowData: Record<string, any> = {};

    if (values.length === headers.length) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        let value: string | number = values[j];

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() !== "") {
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
