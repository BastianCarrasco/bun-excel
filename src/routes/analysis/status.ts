// src/routes/analysis/status.ts
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";
import {
  countColumnOccurrences,
  countUniqueColumnValues,
} from "../../services/analysis";

const statusRoutes = new Elysia({ prefix: "/status" }); // Prefix para este grupo de rutas

statusRoutes.get(
  "/", // Ahora esta ruta será '/data/status'
  async ({ set, query }) => {
    try {
      const response = await fetch(SPREADSHEET_URL as string);

      if (!response.ok) {
        set.status = 500;
        return {
          error: `Failed to fetch spreadsheet data for analysis: HTTP status ${response.status}`,
        };
      }

      const csvText = await response.text();
      const allData = await parseCsvToObjectsFlexible(csvText);

      const statusColumn = query.columnName ?? "Estatus";

      const occurrences = countColumnOccurrences(allData, statusColumn);
      const uniqueCount = countUniqueColumnValues(allData, statusColumn);

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_unique_status: uniqueCount,
        status_occurrences: occurrences,
      };
    } catch (error: any) {
      console.error("Error en el análisis de estatus:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze status data",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna para contar estatus. Por defecto: 'Estatus'",
          default: "Estatus",
        })
      ),
    }),
    detail: {
      summary: "Contar tipos de estatus y repeticiones",
      description: `
        Analiza la hoja de cálculo para contar cuántos tipos de estatus diferentes hay
        y la frecuencia de aparición de cada uno en la columna "Estatus" (o la especificada).
      `,
      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna a analizar para los estatus. Por defecto es 'Estatus'.",
          required: false,
          schema: {
            type: "string",
            default: "Estatus",
          },
        },
      ],
      responses: {
        200: {
          description: "Análisis de estatus exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unique_status: {
                    type: "integer",
                    description: "Número total de estatus únicos encontrados.",
                  },
                  status_occurrences: {
                    type: "object",
                    description: "Frecuencia de cada estatus.",
                    additionalProperties: {
                      type: "integer",
                    },
                  },
                },
                required: ["total_unique_status", "status_occurrences"],
              },
            },
          },
        },
      },
    },
  }
);

export { statusRoutes };
