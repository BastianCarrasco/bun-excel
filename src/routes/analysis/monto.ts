// src/routes/analysis/monto.ts
import { Elysia, t } from "elysia";
import { SPREADSHEET_URL } from "../../config";
import { parseCsvToObjectsFlexible } from "../../services/csv-parser";
import { sumColumnValues } from "../../services/analysis"; // <-- Importa desde el análisis principal

const montoRoutes = new Elysia({ prefix: "/monto" }); // Prefijo para este grupo de rutas

// ========================================================================
// RUTA: Monto Total de Proyectos
// ========================================================================
montoRoutes.get(
  "/total-project-amount",
  async ({ set, query }) => {
    try {
      const response = await fetch(SPREADSHEET_URL as string);

      if (!response.ok) {
        set.status = 500;
        return {
          error: `Failed to fetch spreadsheet data for amount analysis: HTTP status ${response.status}`,
        };
      }

      const csvText = await response.text();
      const allData = await parseCsvToObjectsFlexible(csvText);

      const amountColumn = query.columnName ?? "Monto Proyecto MM$"; // Nombre de la columna por defecto

      const totalAmount = sumColumnValues(allData, amountColumn);

      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        column_analyzed: amountColumn,
        total_project_amount_MM: totalAmount, // Retorna la suma total
      };
    } catch (error: any) {
      console.error(
        "Error en el análisis del monto total de proyectos:",
        error
      );
      set.status = 500;
      set.headers["Access-Control-Allow-Origin"] = "*";
      return {
        error: "Failed to analyze total project amount",
        details: error.message,
      };
    }
  },
  {
    query: t.Object({
      columnName: t.Optional(
        t.String({
          description:
            "Nombre de la columna que contiene el monto del proyecto. Por defecto: 'Monto Proyecto MM$'",
          default: "Monto Proyecto MM$",
        })
      ),
    }),
    detail: {
      summary: "Obtener el monto total de los proyectos",
      description: `
        Calcula la suma total de los valores en la columna 'Monto Proyecto MM$'
        (o la columna especificada) en la hoja de cálculo.
        Intenta convertir los valores de la celda a números y suma solo los valores válidos.
      `,
      tags: ["Análisis de Datos"],
      parameters: [
        {
          name: "columnName",
          in: "query",
          description:
            "Nombre de la columna numérica a sumar. Por defecto es 'Monto Proyecto MM$'.",
          required: false,
          schema: {
            type: "string",
            default: "Monto Proyecto MM$",
          },
        },
      ],
      responses: {
        200: {
          description: "Monto total de proyectos calculado exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  column_analyzed: {
                    type: "string",
                    description: "Nombre de la columna que fue analizada.",
                  },
                  total_project_amount_MM: {
                    type: "number",
                    description:
                      "La suma total de los montos de los proyectos en la unidad 'MM$'.",
                  },
                },
                required: ["column_analyzed", "total_project_amount_MM"],
              },
            },
          },
        },
      },
    },
  }
);

export { montoRoutes };
