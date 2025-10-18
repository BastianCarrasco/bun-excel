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
/**
 * Suma todos los valores numéricos válidos de una columna de un array de objetos.
 * Limpia formatos tipo “$ 8.737”, “8,737.50” o “1.234,56”.
 *
 * @param data Un array de objetos (registros CSV).
 * @param column Nombre de la columna numérica a sumar.
 * @returns La suma total como número (en MM$, sin multiplicar por millón).
 */
export function sumColumnValues(
  data: Record<string, any>[],
  column: string
): number {
  if (!data || data.length === 0) {
    return 0;
  }

  let totalSum = 0;

  for (const row of data) {
    if (!Object.prototype.hasOwnProperty.call(row, column)) continue;

    let value = String(row[column]).trim();
    if (!value) continue;

    // 1️⃣ Eliminar símbolos de moneda, espacios y letras
    value = value.replace(/[^0-9.,-]+/g, "");

    // 2️⃣ Detectar si hay coma y punto para determinar separador decimal real
    // Casos posibles:
    //   "1.234,56" -> miles ".", decimal ","
    //   "1,234.56" -> miles ",", decimal "."
    //   "1234,56"  -> decimal ","
    //   "1234.56"  -> decimal "."
    if (value.match(/^\d{1,3}(\.\d{3})+(,\d+)?$/)) {
      // Formato europeo/chileno → usar "," como decimal
      value = value.replace(/\./g, "").replace(",", ".");
    } else if (value.match(/^\d{1,3}(,\d{3})+(\.\d+)?$/)) {
      // Formato americano → eliminar comas
      value = value.replace(/,/g, "");
    } else {
      // Si sólo hay coma y parece decimal
      value = value.replace(/,/g, ".");
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      totalSum += num;
    }
  }

  // 🔹 NO multipliques aquí por 1e6 (ya está en millones)
  // Si quisieras convertirlo a pesos chilenos, podrías hacerlo en la ruta.
  return Number(totalSum.toFixed(2));
}

// src/services/analysis.ts
// ... (todas tus funciones existentes: normalizeName, UnifiedPeopleCounts, countUnifiedPeople,
//      countColumnOccurrences, countUniqueColumnValues, sumColumnValues) ...

// ========================================================================
// countDistinctCombinations - Nueva función para contar combinaciones únicas de columnas
// ========================================================================
/**
 * Cuenta el número de combinaciones únicas de valores en un conjunto de columnas.
 * Los valores de cada columna se normalizan antes de formar la combinación.
 *
 * @param data Un array de objetos (registros de CSV).
 * @param columns Un array de nombres de columnas cuyas combinaciones se desean contar.
 * @param toLowercase Si es true, convierte los textos a minúsculas durante la normalización. Por defecto es true.
 * @returns El número total de combinaciones únicas.
 */
export function countDistinctCombinations(
  data: Record<string, any>[],
  columns: string[],
  toLowercase: boolean = true
): number {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return 0;
  }

  const uniqueCombinations = new Set<string>();

  for (const row of data) {
    let combinationParts: string[] = [];
    let isValidRow = true;

    for (const column of columns) {
      if (Object.prototype.hasOwnProperty.call(row, column)) {
        const cellValue = String(row[column]).trim();
        if (!cellValue) {
          // Si un valor de una de las columnas está vacío, esta combinación no es válida.
          isValidRow = false;
          break;
        }
        // Limpiar contenido entre paréntesis antes de normalizar para los nombres de proyectos
        // NOTA: Si 'Fecha Postulación' tuviera paréntesis que no quieres limpiar,
        // esto podría ser un problema. Asumimos que no. Si sí, habría que
        // pasar una configuración más granular a normalizeName o aplicar la limpieza solo a ciertas columnas.
        let cleanedValue = cellValue.replace(/\([^)]*\)/g, "").trim();
        const normalizedValue = normalizeName(cleanedValue, toLowercase);
        combinationParts.push(normalizedValue);
      } else {
        // Si una de las columnas no existe en la fila, esta combinación no es válida.
        isValidRow = false;
        break;
      }
    }

    if (isValidRow && combinationParts.length === columns.length) {
      // Unimos las partes normalizadas con un separador robusto que probablemente
      // no aparezca en los nombres normalizados.
      const uniqueKey = combinationParts.join(":::");
      uniqueCombinations.add(uniqueKey);
    }
  }

  return uniqueCombinations.size;
}
