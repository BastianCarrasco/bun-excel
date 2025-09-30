// src/services/analysis.ts (SIMPLIFICADO - Sin categorización de roles, todo a 'academics')

/**
 * Normaliza un nombre o texto para estandarizarlo.
 * - Elimina acentos.
 * - Si `toLowercase` es true, convierte el texto a minúsculas.
 * - Recorta espacios extra.
 *
 * NOTA: La eliminación de contenido entre paréntesis debe hacerse ANTES de llamar a esta función,
 *       si se necesita para el valor final que se va a normalizar.
 *
 * @param text El texto original.
 * @param toLowercase Si es true, convierte el texto a minúsculas. Por defecto es true.
 * @returns El texto normalizado.
 */
function normalizeName(text: string, toLowercase: boolean = true): string {
  let cleanedText = text.trim();

  // 1. Eliminar acentos
  cleanedText = cleanedText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Convertir a minúsculas si se solicita
  if (toLowercase) {
    cleanedText = cleanedText.toLowerCase();
  }

  // 3. Normalizar espacios múltiples y recortar
  return cleanedText.replace(/\s+/g, " ").trim();
}

// Interfaz para la salida unificada (solo una categoría principal)
interface UnifiedPeopleCounts {
  people: Record<string, number>; // Cambiamos el nombre de la propiedad para ser más general
  total_unique_people: number;
}

// NO NECESITAMOS ACADEMIC_PATTERNS Y STUDENT_PATTERNS SI NO SE VA A CATEGORIZAR POR ROL
// const ACADEMIC_PATTERNS = [ ... ];
// const STUDENT_PATTERNS = [ ... ];

// ========================================================================
// countUnifiedPeople - Nueva función para el conteo unificado (sin roles)
// ========================================================================
export function countUnifiedPeople( // <-- NUEVA FUNCIÓN PARA CONTEO UNIFICADO
  data: Record<string, any>[],
  column: string,
  rawDelimiter: string | null = null,
  toLowercase: boolean = true // Mantener para flexibilidad
): UnifiedPeopleCounts {
  const peopleCounts: Record<string, number> = {};
  const uniquePeopleSet = new Set<string>();

  if (!data || data.length === 0) {
    return { people: {}, total_unique_people: 0 };
  }

  const splitPattern =
    rawDelimiter && rawDelimiter.trim() !== ""
      ? new RegExp(
          `[${rawDelimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}]`
        )
      : null;

  for (const row of data) {
    if (Object.prototype.hasOwnProperty.call(row, column)) {
      const cellValue = String(row[column]).trim();

      if (!cellValue) continue;

      let valuesToProcess: string[] = [];

      if (splitPattern) {
        valuesToProcess = cellValue
          .split(splitPattern)
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else {
        valuesToProcess = [cellValue];
      }

      for (let value of valuesToProcess) {
        // Limpiar contenido entre paréntesis antes de normalizar
        let cleanedValue = value.replace(/\([^)]*\)/g, "").trim();

        const normalizedPerson = normalizeName(cleanedValue, toLowercase);

        if (normalizedPerson) {
          peopleCounts[normalizedPerson] =
            ((peopleCounts[normalizedPerson] as number) || 0) + 1;
          uniquePeopleSet.add(normalizedPerson);
        }
      }
    }
  }
  return {
    people: peopleCounts,
    total_unique_people: uniquePeopleSet.size,
  };
}

// ========================================================================
// countColumnOccurrences - Mantiene su funcionalidad, usa toLowercase
// ========================================================================
export function countColumnOccurrences(
  data: Record<string, any>[],
  column: string,
  rawDelimiter: string | null = null,
  toLowercase: boolean = true // Por defecto true para personas, false para instituciones si se pasa
): Record<string, number> {
  const occurrences: Record<string, number> = {};
  if (!data || data.length === 0) return {};

  const splitPattern =
    rawDelimiter && rawDelimiter.trim() !== ""
      ? new RegExp(
          `[${rawDelimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}]`
        )
      : null;

  for (const row of data) {
    if (Object.prototype.hasOwnProperty.call(row, column)) {
      const cellValue = String(row[column]).trim();
      if (!cellValue) continue;

      let valuesToProcess: string[] = [];
      if (splitPattern) {
        valuesToProcess = cellValue
          .split(splitPattern)
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else {
        valuesToProcess = [cellValue];
      }

      for (const value of valuesToProcess) {
        // Para esta función, solo se aplica normalización de nombre y acentos,
        // pero la eliminación de paréntesis no se hace aquí automáticamente
        // porque esta función es genérica para *cualquier* columna, no solo personas.
        const normalizedValue = normalizeName(value, toLowercase);

        if (normalizedValue) {
          occurrences[normalizedValue] =
            ((occurrences[normalizedValue] as number) || 0) + 1;
        }
      }
    }
  }
  return occurrences;
}

// ========================================================================
// countUniqueColumnValues - Mantiene su funcionalidad, usa toLowercase
// ========================================================================
export function countUniqueColumnValues(
  data: Record<string, any>[],
  column: string,
  rawDelimiter: string | null = null,
  toLowercase: boolean = true // Por defecto true
): number {
  const uniqueValues = new Set<string>();
  if (!data || data.length === 0) return 0;

  const splitPattern =
    rawDelimiter && rawDelimiter.trim() !== ""
      ? new RegExp(
          `[${rawDelimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}]`
        )
      : null;

  for (const row of data) {
    if (Object.prototype.hasOwnProperty.call(row, column)) {
      const cellValue = String(row[column]).trim();
      if (!cellValue) continue;

      let valuesToProcess: string[] = [];
      if (splitPattern) {
        valuesToProcess = cellValue
          .split(splitPattern)
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else {
        valuesToProcess = [cellValue];
      }

      for (const value of valuesToProcess) {
        // Para esta función, solo se aplica normalización de nombre y acentos,
        // pero la eliminación de paréntesis no se hace aquí automáticamente
        const normalizedValue = normalizeName(value, toLowercase);

        if (normalizedValue) {
          uniqueValues.add(normalizedValue);
        }
      }
    }
  }
  return uniqueValues.size;
}

// src/services/analysis.ts (MODIFICADO - sumColumnValues para manejar formatos de moneda)

// ... (todas las funciones anteriores: normalizeName, UnifiedPeopleCounts, countUnifiedPeople,
//      countColumnOccurrences, countUniqueColumnValues) ...

// ========================================================================
// sumColumnValues - Suma valores numéricos de una columna (ahora más robusta)
// ========================================================================
/**
 * Suma los valores numéricos de una columna específica en un array de objetos.
 * Intenta convertir los valores de la columna a número, manejando formatos
 * comunes de moneda (ej. "$ 8.737" -> 8737).
 * Ignora valores no numéricos o vacíos.
 *
 * @param data Un array de objetos (registros de CSV).
 * @param column El nombre de la columna numérica a sumar.
 * @returns La suma total de los valores numéricos de la columna.
 */
export function sumColumnValues(
  data: Record<string, any>[],
  column: string
): number {
  let totalSum = 0;

  if (!data || data.length === 0) {
    return 0;
  }

  for (const row of data) {
    if (Object.prototype.hasOwnProperty.call(row, column)) {
      const cellValueRaw = String(row[column]); // Obtener el valor original como string
      const cellValueTrimmed = cellValueRaw.trim();

      if (cellValueTrimmed) {
        // --- Lógica de limpieza mejorada aquí ---
        let cleanedValue = cellValueTrimmed;

        // 1. Eliminar el símbolo de dólar o cualquier otro símbolo de moneda al inicio
        //    y espacios.
        cleanedValue = cleanedValue.replace(/^[$\s]+/, ""); // Elimina "$ ", " $ ", etc.

        // 2. Manejar separador de miles (el punto en este formato chileno/latam).
        //    Simplemente lo eliminamos antes de parsear a float.
        cleanedValue = cleanedValue.replace(/\./g, ""); // Elimina todos los puntos

        // 3. Manejar el separador decimal (si fuera coma, lo cambiamos a punto para parseFloat)
        //    Si el separador decimal en tu CSV es ',' y no '.', tendrías que hacer esto:
        //    cleanedValue = cleanedValue.replace(/,/g, '.');

        // Por tu ejemplo "$ 8.737", parece que no hay decimales y el punto es solo de miles.
        // Si tuvieras "$ 8.737,50", entonces la línea de arriba sería necesaria.
        // Dado que solo muestras enteros, con eliminar el punto de miles es suficiente.

        const numValue = parseFloat(cleanedValue);

        if (!isNaN(numValue)) {
          totalSum = (totalSum as number) + numValue;
        }
      }
    }
  }
  return totalSum * 1000000; // Convertir a MM$ (millones de pesos)
}
