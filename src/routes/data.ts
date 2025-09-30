// src/routes/base.ts
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../config";
import { parseCsvToObjectsFlexible } from "../services/csv-parser";

const baseRoutes = new Elysia();

baseRoutes
  .get("/", () => "Welcome to T3 Chat's Google Sheets API!") // Ruta raíz
  .get(
    "/data", // Ruta original para obtener datos con límites
    async ({ set, query }) => {
      try {
        console.log("Intentando obtener datos de:", SPREADSHEET_URL);
        const response = await fetch(SPREADSHEET_URL as string);

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

        const limitRows = query.limitRows ?? null;
        const limitCols = query.limitCols ?? null;

        const data = await parseCsvToObjectsFlexible(
          csvText,
          limitRows,
          limitCols
        );
        console.log("Datos parseados y limitados:", data);

        set.headers["Access-Control-Allow-Origin"] = "*"; // CORS
        return data;
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
      query: t.Object({
        limitRows: t.Optional(
          t.Numeric({
            minimum: 1,
            description:
              "Número máximo de filas a devolver. Por defecto, todas las filas.",
          })
        ),
        limitCols: t.Optional(
          t.Numeric({
            minimum: 1,
            description:
              "Número máximo de columnas a devolver. Por defecto, todas las columnas.",
          })
        ),
      }),
      detail: {
        summary: "Obtener datos de la hoja de cálculo con límites",
        description: `
          Recupera datos de la hoja de cálculo de Google publicada en formato CSV,
          convirtiéndolos a JSON. Permite limitar el número de filas y columnas devueltas.
          La estructura de los datos es flexible y depende de los encabezados de la hoja.

          **Ejemplo:**
          - \`/data?limitRows=200\` para las primeras 200 filas.
          - \`/data?limitCols=20\` para las primeras 20 columnas.
          - \`/data?limitRows=200&limitCols=20\` para las primeras 200 filas y 20 columnas.
        `,
        tags: ["Google Sheets"],
        parameters: [
          {
            name: "limitRows",
            in: "query",
            description:
              "Número máximo de filas a devolver. Por defecto, todas las filas.",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
            },
          },
          {
            name: "limitCols",
            in: "query",
            description:
              "Número máximo de columnas a devolver. Por defecto, todas las columnas.",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
            },
          },
        ],
      },
    }
  );

export { baseRoutes };
