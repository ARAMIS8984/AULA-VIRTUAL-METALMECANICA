/**
 * Parser del Reporte de Juicios de Evaluación (SOFIA Plus)
 * Extrae: programa, ficha, aprendices, competencias y resultados de aprendizaje.
 * Requiere SheetJS (XLSX) cargado globalmente.
 */

const ESTADOS_ACTIVOS = ['EN FORMACION'];

function parseReporteJuicio(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });

  // --- Encabezado ---
  const ficha = limpiarTexto(rows[2]?.[2]);
  const programa = limpiarTexto(rows[5]?.[2]);
  const estadoFicha = limpiarTexto(rows[6]?.[2]);
  const centroFormacion = limpiarTexto(rows[11]?.[2]);

  if (!ficha || !programa) {
    throw new Error('No se pudo leer la ficha o el programa. Verifica que el archivo sea un Reporte de Juicios de Evaluación exportado de SOFIA Plus.');
  }

  // --- Tabla de detalle (desde la fila 14, índice 13) ---
  const detalle = rows.slice(13).filter(r => r && r[1]); // requiere número de documento

  // --- Aprendices únicos ---
  const aprendicesMap = new Map();
  for (const r of detalle) {
    const numDoc = limpiarTexto(r[1]);
    if (!numDoc || aprendicesMap.has(numDoc)) continue;
    aprendicesMap.set(numDoc, {
      tipo_documento: limpiarTexto(r[0]),
      numero_documento: numDoc,
      nombre: limpiarTexto(r[2]),
      apellidos: limpiarTexto(r[3]),
      nombre_completo: `${limpiarTexto(r[2])} ${limpiarTexto(r[3])}`.trim(),
      estado: limpiarTexto(r[4]),
    });
  }
  const aprendices = Array.from(aprendicesMap.values());
  const aprendicesActivos = aprendices.filter(a => ESTADOS_ACTIVOS.includes(a.estado));

  // --- Competencias y resultados de aprendizaje (anidados) ---
  const competenciasMap = new Map();
  for (const r of detalle) {
    const competencia = limpiarTexto(r[5]);
    const resultado = limpiarTexto(r[6]);
    if (!competencia) continue;

    if (!competenciasMap.has(competencia)) {
      competenciasMap.set(competencia, new Set());
    }
    if (resultado) {
      competenciasMap.get(competencia).add(resultado);
    }
  }
  const competencias = Array.from(competenciasMap.entries()).map(([nombre, resultadosSet]) => ({
    nombre,
    resultados_aprendizaje: Array.from(resultadosSet),
  }));

  return {
    ficha,
    programa,
    estado_ficha: estadoFicha,
    centro_formacion: centroFormacion,
    total_aprendices: aprendices.length,
    total_aprendices_activos: aprendicesActivos.length,
    aprendices,
    aprendices_activos: aprendicesActivos,
    competencias,
  };
}

function limpiarTexto(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

// Exportar para uso en módulos (Node) o navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseReporteJuicio };
}
