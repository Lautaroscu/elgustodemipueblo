/**
 * Motor de preparación (puro). Calcula el tiempo total de preparación de un
 * pedido y, a partir de la hora deseada de entrega, cuándo hay que empezar a
 * prepararlo para llegar a tiempo (backward scheduling).
 */

export type PrepLine = { prepMinutos: number; cantidad: number };

/**
 * Tiempo total de preparación del pedido.
 * Los ítems se preparan en paralelo hasta cierto punto, así que usamos el
 * máximo prep de un ítem + una fracción del resto (no es una suma lineal:
 * mientras se hornea la torta se arman los vasitos).
 */
export function totalPrepMinutos(lines: PrepLine[]): number {
  if (lines.length === 0) return 0;
  const preps = lines.map((l) => l.prepMinutos);
  const max = Math.max(...preps, 0);
  const restoSum = preps.reduce((s, p) => s + p, 0) - max;
  // El ítem más lento marca el piso; el resto suma al 40% (solapamiento).
  return Math.round(max + restoSum * 0.4);
}

/**
 * Momento en que hay que empezar a preparar para llegar a `fechaEntrega`.
 * Si no hay fecha (ASAP), devuelve "ahora".
 */
export function prepStartTime(
  fechaEntrega: Date | null,
  prepMinutos: number,
  now: Date = new Date(),
): Date {
  if (!fechaEntrega) return now;
  const start = new Date(fechaEntrega.getTime() - prepMinutos * 60_000);
  // Nunca antes de ahora.
  return start < now ? now : start;
}

/** Etiqueta legible de cuánto falta / hace cuánto venció (min). */
export function minutesUntil(target: Date, now: Date = new Date()): number {
  return Math.round((target.getTime() - now.getTime()) / 60_000);
}
