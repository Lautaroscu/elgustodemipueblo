/** Utilidades puras para direcciones dinámicas. */

export type AddressData = Record<string, string>;

/** Arma un resumen legible a partir de los datos de una dirección. */
export function buildResumen(datos: AddressData): string {
  const calle = [datos.calle, datos.numero].filter(Boolean).join(" ");
  const pisoDepto = [
    datos.piso ? `Piso ${datos.piso}` : "",
    datos.departamento ? `Depto ${datos.departamento}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const zona = [datos.barrio, datos.ciudad].filter(Boolean).join(", ");

  return [calle, pisoDepto, zona].filter(Boolean).join(" · ") || "Dirección";
}

/** Dirección completa en una línea (para WhatsApp / admin). */
export function fullAddressLine(datos: AddressData): string {
  const parts = [
    [datos.calle, datos.numero].filter(Boolean).join(" "),
    datos.piso && `Piso ${datos.piso}`,
    datos.departamento && `Depto ${datos.departamento}`,
    datos.entreCalles && `entre ${datos.entreCalles}`,
    datos.barrio,
    datos.ciudad,
    datos.provincia,
    datos.codigoPostal && `CP ${datos.codigoPostal}`,
    datos.referencias && `(${datos.referencias})`,
  ].filter(Boolean);
  return parts.join(", ");
}
