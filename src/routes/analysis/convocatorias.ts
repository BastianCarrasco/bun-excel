// src/routes/analysis/convocatorias.ts (MODIFICADO para NO convertir a minúsculas)
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";
import {
  countColumnOccurrences,
  countUniqueColumnValues,
} from "../../services/analysis";

const convocatoriasRoutes = new Elysia({ prefix: "/convocatorias" });

// ========================================================================
// Conteo de Tipo Convocatoria
// ========================================================================
convocatoriasRoutes.get(
  "/type-counts",
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

      const typeColumn = query.columnName ?? "Tipo Convocatoria";

      // *** CAMBIO CLAVE AQUÍ: Asegúrate de que el cuarto parámetro es 'false' ***
      const occurrences = countColumnOccurrences(
        allData,
        typeColumn,
        null, // rawDelimiter
        false // <-- ¡Pásale 'false' para toLowercase!
      );
      const uniqueCount = countUniqueColumnValues(
        allData,
        typeColumn,
        null, // rawDelimiter
        false // <-- ¡Pásale 'false' para toLowercase!
      );

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_unique_types: uniqueCount,
        type_occurrences: occurrences,
      };
    } catch (error: any) {
      console.error("Error en el análisis de Tipo Convocatoria:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze 'Tipo Convocatoria' data",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna para contar tipos de convocatoria. Por defecto: 'Tipo Convocatoria'",
          default: "Tipo Convocatoria",
        })
      ),
    }),
    detail: {
      summary:
        "Contar tipos de convocatoria y repeticiones (manteniendo capitalización)",
      description: `
        Analiza la hoja de cálculo para contar cuántos tipos de convocatoria diferentes hay
        y la frecuencia de aparición de cada uno en la columna especificada.
        **Los nombres de los tipos se devolverán con su capitalización original.**
      `,
      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna a analizar para los tipos de convocatoria. Por defecto es 'Tipo Convocatoria'.",
          required: false,
          schema: {
            type: "string",
            default: "Tipo Convocatoria",
          },
        },
      ],
      responses: {
        200: {
          description: "Análisis de tipos de convocatoria exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unique_types: {
                    type: "integer",
                    description:
                      "Número total de tipos de convocatoria únicos.",
                  },
                  type_occurrences: {
                    type: "object",
                    description: "Frecuencia de cada tipo de convocatoria.",
                    additionalProperties: { type: "integer" },
                  },
                },
                required: ["total_unique_types", "type_occurrences"],
              },
            },
          },
        },
      },
    },
  }
);

// ========================================================================
// Conteo de Institucion Convocatoria
// ========================================================================
convocatoriasRoutes.get(
  "/institution-counts",
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

      const institutionColumn = query.columnName ?? "Institucion Convocatoria";
      const rawDelimiter = query.delimiter;
      const delimiter = rawDelimiter === "" ? null : rawDelimiter ?? ",-";

      // *** CAMBIO CLAVE AQUÍ: Asegúrate de que el cuarto parámetro es 'false' ***
      const occurrences = countColumnOccurrences(
        allData,
        institutionColumn,
        delimiter,
        false // <-- ¡Pásale 'false' para toLowercase!
      );
      const uniqueCount = countUniqueColumnValues(
        allData,
        institutionColumn,
        delimiter,
        false // <-- ¡Pásale 'false' para toLowercase!
      );

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_unique_institutions: uniqueCount,
        institution_occurrences: occurrences,
      };
    } catch (error: any) {
      console.error("Error en el análisis de Institucion Convocatoria:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze 'Institucion Convocatoria' data",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna para contar instituciones de convocatoria. Por defecto: 'Institucion Convocatoria'",
          default: "Institucion Convocatoria",
        })
      ),
      delimiter: t.Optional(
        t.String({
          description:
            "Cadena de caracteres que actúan como delimitadores para separar múltiples valores dentro de una celda (ej. ', -'). Cada caracter en la cadena se usa como un posible delimitador. Por defecto: ', -'. Si se envía una cadena vacía, la celda se trata como una única entrada (no se divide).",
          default: ",-",
        })
      ),
    }),
    detail: {
      summary:
        "Contar instituciones de convocatoria y repeticiones (manteniendo capitalización)",
      description: `
        Analiza la hoja de cálculo para contar cuántas instituciones de convocatoria diferentes hay
        y la frecuencia de aparición de cada una en la columna especificada.
        Aplica normalización a los nombres (eliminando acentos y recortando espacios),
        pero **mantiene la capitalización original**.
      `,
      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna a analizar para las instituciones de convocatoria. Por defecto es 'Institucion Convocatoria'.",
          required: false,
          schema: {
            type: "string",
            default: "Institucion Convocatoria",
          },
        },
        {
          name: "delimiter",
          in: "query",
          description:
            "Delimitador usado para separar múltiples valores dentro de una misma celda (ej. ', -'). Por defecto: ', -'. Si se envía una cadena vacía, la celda se trata como una única entrada.",
          required: false,
          schema: {
            type: "string",
            default: ",-",
          },
        },
      ],
      responses: {
        200: {
          description: "Análisis de instituciones de convocatoria exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unique_institutions: {
                    type: "integer",
                    description:
                      "Número total de instituciones de convocatoria únicas.",
                  },
                  institution_occurrences: {
                    type: "object",
                    description:
                      "Frecuencia de cada institución de convocatoria.",
                    additionalProperties: { type: "integer" },
                  },
                },
                required: [
                  "total_unique_institutions",
                  "institution_occurrences",
                ],
              },
            },
          },
        },
      },
    },
  }
);

export { convocatoriasRoutes };
