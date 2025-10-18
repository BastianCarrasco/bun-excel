// src/services/csv-parser.ts
import { parse, CsvError } from "csv-parse";

/**
 * Convierte texto CSV en un array de objetos, interpretando las columnas automáticamente.
 * Limpia valores vacíos y convierte números si es posible.
 *
 * @param csv String con el contenido CSV.
 * @param maxRows Máximo de filas a devolver.
 * @param maxCols Máximo de columnas a devolver.
 */
export async function parseCsvToObjectsFlexible(
  csv: string,
  maxRows: number | null = null,
  maxCols: number | null = null
): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    type CsvRecord = Record<string, string>;

    parse(
      csv,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        on_record: (record: CsvRecord, { lines }) => {
          if (maxRows !== null && lines > maxRows + 1) {
            return null;
          }
          return record;
        },
      },
      (err: CsvError | undefined, records?: CsvRecord[]) => {
        if (err) {
          console.error("Error parseando CSV:", err);
          console.error(
            "CSV problemático (primeros 500 chars):\n",
            csv.substring(0, 500)
          );
          return reject(err);
        }

        // ✅ Si no hay registros, resolvemos vacío
        if (!records || records.length === 0) {
          resolve([]);
          return;
        }

        let processedRecords: CsvRecord[] = records;

        // ✅ Solo leer headers si existe al menos un registro
        if (maxCols !== null) {
          const firstRecord = records[0];
          if (firstRecord) {
            const originalHeaders = Object.keys(firstRecord);
            if (maxCols < originalHeaders.length) {
              const desiredHeaders = originalHeaders.slice(0, maxCols);
              console.log(
                `Limitando a ${maxCols} columnas. Nuevos encabezados:`,
                desiredHeaders
              );

              processedRecords = records.map((record) => {
                const newRecord: Record<string, any> = {};
                for (const header of desiredHeaders) {
                  if (Object.prototype.hasOwnProperty.call(record, header)) {
                    newRecord[header] = record[header];
                  }
                }
                return newRecord;
              });
            }
          }
        }

        const finalData = processedRecords.map((row) => {
          const newRow: Record<string, any> = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              let value: string | number | null | undefined = row[key];

              if (typeof value === "string") {
                value = value.trim();
                if (value === "") value = null;
              }

              // Intentar conversión a número si aplica
              if (
                typeof value === "string" &&
                /^-?\d+([.,]\d+)?$/.test(value)
              ) {
                const parsed = parseFloat(value.replace(",", "."));
                if (!isNaN(parsed)) value = parsed;
              }

              newRow[key] = value ?? null;
            }
          }
          return newRow;
        });

        resolve(finalData);
      }
    );
  });
}
