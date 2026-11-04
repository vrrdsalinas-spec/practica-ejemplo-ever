/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN CENTRALIZADO PARA ESTUDIANTES
 * ============================================================================
 * Cada equipo de estudiantes debe personalizar este archivo.
 * Modifica las propiedades de TEAM_CONFIG con los datos de tu equipo.
 *
 * ⚠️ ATENCIÓN: El pipeline de Jenkins ejecutará la prueba unitaria en
 * 'test/team-config.test.js' antes de permitir el build y despliegue.
 * Si 'teamName' permanece vacío o con el valor por defecto, o si 'members'
 * no tiene integrantes registrados, el pipeline FALLARÁ para evitar releases erróneos.
 * ============================================================================
 */

export interface TeamConfig {
  /** Nombre representativo del equipo (Ej. 'CyberDragons') */
  teamName: string;
  /** Lema o slogan técnico del equipo */
  slogan: string;
  /** Clases de Tailwind para el fondo principal (paleta en tonos blancos y pasteles) */
  primaryBg: string;
  /** Clases de Tailwind para colores de acento y bordes suaves */
  accentColor: string;
  /** Clases de Tailwind para las insignias / badges de estado */
  badgeColor: string;
  /** Lista con los nombres de los estudiantes que componen el equipo (mínimo 1) */
  members: string[];
  /** Versión semántica del release actual */
  releaseVersion: string;
}

export const TEAM_CONFIG: TeamConfig = {
  // ✏️ PASO 1: Reemplaza con el nombre oficial de tu equipo
  teamName: "[CAMBIAR_POR_NOMBRE_DE_TU_EQUIPO]",

  // ✏️ PASO 2: Escribe el slogan de tu equipo
  slogan: "Construyendo el futuro con DevOps, Jenkins CI y AWS Amplify",

  // ✏️ PASO 3: Personaliza los estilos visuales con tonos blancos y pasteles
  // Ejemplos recomendados (blanco cálido + degradados pasteles sutiles):
  // "bg-gradient-to-br from-slate-50 via-rose-50/40 to-indigo-50/40"
  // "bg-gradient-to-br from-slate-50 via-teal-50/40 to-sky-50/40"
  // "bg-gradient-to-br from-slate-50 via-purple-50/40 to-amber-50/40"
  primaryBg: "bg-gradient-to-br from-slate-50 via-rose-50/40 to-indigo-50/40",

  // Clases de acento para textos y bordes en tonos pasteles
  // Ej: "text-rose-700 border-rose-200 bg-rose-50/70"
  accentColor: "text-rose-700 border-rose-200 bg-rose-50/70",

  // Clases para badges en tonos pasteles
  // Ej: "bg-purple-50 text-purple-700 border-purple-200/80"
  badgeColor: "bg-purple-50 text-purple-700 border-purple-200/80",

  // ✏️ PASO 4: Ingresa el nombre de los 4 integrantes del equipo
  members: [
    "[NOMBRE_INTEGRANTE_1]",
    "[NOMBRE_INTEGRANTE_2]",
    "[NOMBRE_INTEGRANTE_3]",
    "[NOMBRE_INTEGRANTE_4]",
  ],

  // ✏️ PASO 5: Versión del release
  releaseVersion: "v1.0.0",
};
