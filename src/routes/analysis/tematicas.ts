// src/routes/analysis/tematicas.ts
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";
import {
  countColumnOccurrences,
  countUniqueColumnValues,
} from "../../services/analysis";

const tematicasRoutes = new Elysia({ prefix: "/tematics" }); // Prefix para este grupo de rutas

tematicasRoutes.get(
  "/", // Ahora esta ruta será '/data/tematics'
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

      const tematicaColumn = query.columnName ?? "Temática";

      const occurrences = countColumnOccurrences(allData, tematicaColumn);
      const uniqueCount = countUniqueColumnValues(allData, tematicaColumn);

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_unique_tematicas: uniqueCount,
        tematica_occurrences: occurrences,
      };
    } catch (error: any) {
      console.error("Error en el análisis de temáticas:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze thematic data",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna para contar temáticas. Por defecto: 'Temática'",
          default: "Temática",
        })
      ),
    }),
    detail: {
      summary: "Contar tipos de temáticas y repeticiones",
      description: `
        Analiza la hoja de cálculo para contar cuántos tipos de temáticas diferentes hay
        y la frecuencia de aparición de cada una en la columna "Temática" (o la especificada).
      `,
      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna a analizar para las temáticas. Por defecto es 'Temática'.",
          required: false,
          schema: {
            type: "string",
            default: "Temática",
          },
        },
      ],
      responses: {
        200: {
          description: "Análisis de temáticas exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unique_tematicas: {
                    type: "integer",
                    description:
                      "Número total de temáticas únicas encontradas.",
                  },
                  tematica_occurrences: {
                    type: "object",
                    description: "Frecuencia de cada temática.",
                    additionalProperties: {
                      type: "integer",
                    },
                  },
                },
                required: ["total_unique_tematicas", "tematica_occurrences"],
              },
            },
          },
        },
      },
    },
  }
);

export { tematicasRoutes };
