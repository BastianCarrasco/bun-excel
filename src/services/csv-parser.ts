// src/services/csv-parser.ts
import { parse, CsvError } from "csv-parse";

/**
 * Función flexible para parsear una cadena CSV a un array de objetos,
 * utilizando 'csv-parse' para un manejo robusto de comas y otros caracteres especiales,
 * asumiendo que el delimitador es la coma (comportamiento por defecto de csv-parse).
 *
 * @param csv La cadena CSV a parsear.
 * @param maxRows El número máximo de filas a devolver (excluyendo el encabezado).
 * @param maxCols El número máximo de columnas a devolver.
 * @returns Una promesa que resuelve en un array de objetos, donde cada objeto representa una fila.
 */
async function parseCsvToObjectsFlexible(
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
        // *** ELIMINAR ESTA LÍNEA: delimiter: '\t', ***
        on_record: (record: CsvRecord, { lines }) => {
          if (maxRows !== null && lines > maxRows + 1) {
            return null;
          }
          return record;
        },
      },
      (err: CsvError | undefined, records: CsvRecord[]) => {
        if (err) {
          // Mejorar el mensaje de error para incluir la entrada
          console.error("Error parseando CSV:", err);
          console.error(
            "CSV problemático (primeras 500 chars):\n",
            csv.substring(0, 500)
          );
          return reject(err);
        }

        let processedRecords: CsvRecord[] = records;

        if (maxCols !== null && records.length > 0) {
          const originalHeaders = Object.keys(records[0]);
          if (maxCols < originalHeaders.length) {
            const desiredHeaders = originalHeaders.slice(0, maxCols);
            console.log(
              `Limitando a ${maxCols} columnas. Nuevos encabezados:`,
              desiredHeaders
            );

            processedRecords = records.map((record) => {
              const newRecord: Record<string, any> = {};
              for (const header of desiredHeaders) {
                if (record.hasOwnProperty(header)) {
                  newRecord[header] = record[header];
                }
              }
              return newRecord;
            });
          }
        }

        const finalData = processedRecords.map((row) => {
          const newRow: Record<string, any> = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              let value: string | number | null = row[key];

              // Convertir valores de cadena vacía o solo espacios a null
              if (typeof value === "string" && value.trim() === "") {
                value = null;
              }

              // Intentar convertir a número solo si el valor no es null y es un string
              if (typeof value === "string") {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  value = numValue;
                }
              }
              newRow[key] = value;
            }
          }
          return newRow;
        });

        resolve(finalData);
      }
    );
  });
}

export { parseCsvToObjectsFlexible };
