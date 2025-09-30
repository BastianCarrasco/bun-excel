// src/routes/analysis/academicos.ts (ACTUALIZADO - Descripción del delimitador)
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";
import {
  countColumnOccurrences,
  countUniqueColumnValues,
} from "../../services/analysis";

const academicosRoutes = new Elysia({ prefix: "/academicos" });

academicosRoutes.get(
  "/projects-count",
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

      const academicoColumn = query.columnName ?? "Académic@/s-Líder";

      const rawDelimiter = query.delimiter;
      const delimiter = rawDelimiter === "" ? null : rawDelimiter ?? ",-"; // <-- CAMBIO AQUÍ: Delimitador por defecto ',-'

      const projectCounts = countColumnOccurrences(
        allData,
        academicoColumn,
        delimiter
      );
      const uniqueAcademics = countUniqueColumnValues(
        allData,
        academicoColumn,
        delimiter
      );

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_unique_academics: uniqueAcademics,
        projects_by_academico: projectCounts,
      };
    } catch (error: any) {
      console.error("Error en el análisis de proyectos por académico:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze projects by academic",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna que contiene el/los académico/s o líder/es del proyecto. Por defecto: 'Académic@/s-Líder'",
          default: "Académic@/s-Líder",
        })
      ),
      delimiter: t.Optional(
        t.String({
          description:
            "Cadena de caracteres que actúan como delimitadores para separar múltiples valores dentro de una celda (ej. ', -'). Cada caracter en la cadena se usa como un posible delimitador. Si no se especifica, el valor por defecto es ', -'. Si se envía una cadena vacía (`delimiter=`), la celda se trata como una única entrada (no se divide).",
          default: ",-", // <-- CAMBIO AQUÍ: Delimitador por defecto ',-'
        })
      ),
    }),
    detail: {
      summary:
        "Contar proyectos por Académico/a o Líder (con normalización de nombres)",
      description: `
        Analiza la hoja de cálculo para contar cuántos proyectos tiene cada académico/a o líder.
        El nombre de la columna por defecto es 'Académic@/s-Líder'.
        
        **Características:**
        - **Múltiples Delimitadores**: Permite especificar una cadena de caracteres (\`delimiter\`, ej. \`",-/\`)
          para dividir nombres en la misma celda. Cada caracter en la cadena es un posible delimitador.
        - **Normalización de Nombres**: Se limpian y estandarizan los nombres (se eliminan acentos,
          se convierten a minúsculas, se remueven textos entre paréntesis como '(Tesista: ...)')
          para un conteo más preciso de individuos.`,

      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna que contiene el/los académico/s o líder/es del proyecto. Por defecto es 'Académic@/s-Líder'.",
          required: false,
          schema: {
            type: "string",
            default: "Académic@/s-Líder",
          },
        },
        {
          name: "delimiter",
          in: "query",
          description:
            "Cadena de caracteres que actúan como delimitadores para separar múltiples valores dentro de una celda (ej. ', -'). Cada caracter en la cadena se usa como un posible delimitador. Por defecto: ', -'. Si se envía una cadena vacía, la celda se trata como una única entrada.",
          required: false,
          schema: {
            type: "string",
            default: ",-", // <-- CAMBIO AQUÍ: Delimitador por defecto ',-'
          },
        },
      ],
      responses: {
        200: {
          description: "Análisis de proyectos por académico exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_unique_academics: {
                    type: "integer",
                    description:
                      "Número total de académicos/líderes únicos encontrados después de la normalización.",
                  },
                  projects_by_academico: {
                    type: "object",
                    description:
                      "Conteo de proyectos por cada académico/líder normalizado.",
                    additionalProperties: {
                      type: "integer",
                    },
                  },
                },
                required: ["total_unique_academics", "projects_by_academico"],
              },
            },
          },
        },
      },
    },
  }
);

export { academicosRoutes };
