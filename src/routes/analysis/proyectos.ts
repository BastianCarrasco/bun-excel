// src/routes/analysis/proyectos.ts
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";

const proyectosRoutes = new Elysia({ prefix: "/proyectos" });

// ... (todas tus rutas existentes: /distinct-projects-count y /distinct-by-name-and-date-count) ...

// ========================================================================
// NUEVA RUTA para contar el número total de filas/registros
// ========================================================================
proyectosRoutes.get(
  "/total-rows-count", // <--- NUEVA RUTA
  async ({ set }) => {
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

      const totalRows = allData.length; // <-- SIMPLEMENTE OBTENER LA LONGITUD DEL ARRAY

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        total_rows: totalRows,
      };
    } catch (error: any) {
      console.error("Error al obtener el número total de filas:", error);
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to retrieve total row count",
        details: error.message,
      };
    }
  },
  {
    detail: {
      summary: "Contar el número total de proyectos en la hoja de cálculo",
      description: `
        Obtiene el número total de filas (registros) presentes en la hoja de cálculo.
        Esto representa el número bruto de entradas en el CSV después de ser parseado.`,
      tags: ["Análisis de Datos"],
      responses: {
        200: {
          description: "Conteo de filas exitoso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_rows: {
                    type: "integer",
                    description:
                      "Número total de filas/registros en la hoja de cálculo.",
                  },
                },
                required: ["total_rows"],
              },
            },
          },
        },
        500: {
          description: "Error al obtener el conteo de filas",
        },
      },
    },
  }
);

export { proyectosRoutes };
