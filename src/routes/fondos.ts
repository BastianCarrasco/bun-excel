// src/routes/base.ts
import { Elysia, t } from "elysia";
import { URL_FONDOS } from "../config"; // Solo importamos URL_FONDOS
import { parseCsvToObjectsFlexible } from "../services/csv-parser";

const fondosRoutes = new Elysia();

fondosRoutes
  .get("/", () => "Welcome to T3 Chat's Google Funds API!") // Ruta raíz actualizada
  .get(
    "/fondos", // Ruta para obtener datos de fondos
    async ({ set, query }) => {
      try {
        console.log("Intentando obtener datos de fondos de:", URL_FONDOS);
        const response = await fetch(URL_FONDOS as string);

        if (!response.ok) {
          set.status = 500;
          console.error(
            `Error al hacer fetch a la hoja de cálculo de fondos: HTTP status ${response.status}`
          );
          return {
            error: `Failed to fetch funds spreadsheet data: HTTP status ${response.status}`,
          };
        }

        const csvText = await response.text();
        console.log(
          "CSV de fondos recibido (primeras 1000 caracteres):",
          csvText.substring(0, 1000)
        );

        const limitRows = query.limitRows ?? null;
        const limitCols = query.limitCols ?? null;

        const rawData = await parseCsvToObjectsFlexible(
          csvText,
          limitRows,
          limitCols
        );
        console.log(
          "Datos de fondos parseados y limitados (formato original):",
          rawData
        );

        let finalData: any[];

        // --- INICIO DEL ARREGLO ---
        // Verificar si 'rawData' es un objeto con claves numéricas
        if (
          typeof rawData === "object" &&
          rawData !== null &&
          !Array.isArray(rawData) &&
          Object.keys(rawData).every((key) => !isNaN(Number(key)))
        ) {
          // Si es un objeto como { "0": {...}, "1": {...} }, convertirlo a un array
          finalData = Object.values(rawData);
          console.log("Datos de fondos transformados a array:", finalData);
        } else if (Array.isArray(rawData)) {
          // Si ya es un array, usarlo directamente
          finalData = rawData;
        } else {
          // Si no es ni array ni objeto con claves numéricas, algo inesperado.
          console.warn(
            "La data de fondos parseada no es un array ni un objeto con claves numéricas esperado:",
            rawData
          );
          finalData = [rawData]; // Ejemplo: si es un objeto simple, lo convertimos en un array de un solo elemento
        }
        // --- FIN DEL ARREGLO ---

        set.headers["Access-Control-Allow-Origin"] = "*"; // CORS
        return finalData; // Devolvemos el array transformado
      } catch (error: any) {
        console.error("Error EN EL SERVIDOR (/fondos):", error); // Mensaje de error específico
        set.status = 500;
        set.headers["Access-Control-Allow-Origin"] = "*"; // CORS
        return {
          error: "Failed to fetch or process funds spreadsheet data",
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
        summary: "Obtener datos de la hoja de cálculo de fondos con límites", // Título específico
        description: `
          Recupera datos de la hoja de cálculo de Google para fondos publicada en formato CSV,
          convirtiéndolos a JSON. Permite limitar el número de filas y columnas devueltas.
          La estructura de los datos es flexible y depende de los encabezados de la hoja.

          **Devuelve un array de objetos JSON.**

          **Ejemplo:**
          - \`/fondos?limitRows=200\` para las primeras 200 filas.
          - \`/fondos?limitCols=20\` para las primeras 20 columnas.
          - \`/fondos?limitRows=200&limitCols=20\` para las primeras 200 filas y 20 columnas.
        `,
        tags: ["Fondos"], // Etiqueta específica
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

export { fondosRoutes };
