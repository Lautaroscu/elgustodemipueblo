/**
 * Configuración operativa del negocio, guardada en la tabla Setting
 * bajo la clave "negocio". Tipada y con valores por defecto.
 */

export type DeliveryZone = {
  nombre: string;
  costo: number;
};

/** Visibilidad de un campo de entrega configurable. */
export type FieldVisibility = "OCULTO" | "OPCIONAL" | "OBLIGATORIO";

/** Configuración de un campo del formulario de envío. */
export type DeliveryField = {
  key: string;
  label: string;
  visibilidad: FieldVisibility;
  /** true = no editable (siempre presente, ej. nombre/teléfono). */
  fijo?: boolean;
};

export type BusinessSettings = {
  nombre: string;
  whatsapp: string;
  instagram: string;
  email: string;
  direccion: string;
  horarios: string;
  // Pagos
  aliasTransferencia: string;
  cbu: string;
  titularCuenta: string;
  // Envíos
  envioGratisDesde: number | null;
  costoEnvioBase: number;
  zonas: DeliveryZone[];
  retiroDisponible: boolean;
  direccionRetiro: string;
  // Retiro en local
  direccionLocal: string;
  horariosRetiro: string;
  localLat: number | null;
  localLng: number | null;
  // Datos de entrega configurables
  camposEntrega: DeliveryField[];
};

/** Campos de entrega por defecto (adaptables desde el backoffice). */
export const DEFAULT_DELIVERY_FIELDS: DeliveryField[] = [
  { key: "nombre", label: "Nombre y apellido", visibilidad: "OBLIGATORIO", fijo: true },
  { key: "telefono", label: "Teléfono / WhatsApp", visibilidad: "OBLIGATORIO", fijo: true },
  { key: "calle", label: "Calle", visibilidad: "OBLIGATORIO" },
  { key: "numero", label: "Número", visibilidad: "OBLIGATORIO" },
  { key: "piso", label: "Piso", visibilidad: "OPCIONAL" },
  { key: "departamento", label: "Departamento", visibilidad: "OPCIONAL" },
  { key: "barrio", label: "Barrio", visibilidad: "OPCIONAL" },
  { key: "ciudad", label: "Ciudad", visibilidad: "OPCIONAL" },
  { key: "provincia", label: "Provincia", visibilidad: "OCULTO" },
  { key: "codigoPostal", label: "Código Postal", visibilidad: "OPCIONAL" },
  { key: "entreCalles", label: "Entre calles", visibilidad: "OPCIONAL" },
  { key: "empresa", label: "Empresa", visibilidad: "OCULTO" },
  { key: "timbre", label: "Timbre", visibilidad: "OCULTO" },
  { key: "referencias", label: "Referencias", visibilidad: "OPCIONAL" },
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  nombre: "El Gusto de mi Pueblo",
  whatsapp: "5492281401234",
  instagram: "https://instagram.com/elgustodemipueblo2023",
  email: "hola@elgustodemipueblo.com.ar",
  direccion: "Benito Juárez, Buenos Aires",
  horarios: "Martes a Domingo · 10 a 20 hs",
  aliasTransferencia: "gusto.pueblo.mp",
  cbu: "0000003100000000000000",
  titularCuenta: "Facundo Benítez",
  envioGratisDesde: 25000,
  costoEnvioBase: 1500,
  zonas: [
    { nombre: "Centro", costo: 1200 },
    { nombre: "Barrios cercanos", costo: 1800 },
    { nombre: "Periferia", costo: 2500 },
  ],
  retiroDisponible: true,
  direccionRetiro: "Retiro coordinado por WhatsApp",
  direccionLocal: "Av. Mitre 550, Benito Juárez",
  horariosRetiro: "Martes a Domingo · 10 a 20 hs",
  localLat: -37.6772,
  localLng: -59.8027,
  camposEntrega: DEFAULT_DELIVERY_FIELDS,
};

export const SETTINGS_KEY = "negocio";
