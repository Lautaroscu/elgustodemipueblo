/**
 * Configuración estática del sitio.
 * Datos operativos editables (envíos, horarios, alias) viven en la tabla
 * Setting; acá quedan las constantes usadas en build/SEO.
 */

export const site = {
  name: "El Gusto de mi Pueblo",
  shortName: "El Gusto de mi Pueblo",
  tagline: "Postres artesanales hechos con amor",
  description:
    "Postres artesanales hechos con amor. Tortas, cheesecakes, postres en vaso, brownies y más. Pedí online en un minuto y pagá con Mercado Pago, transferencia o efectivo.",
  // Reemplazar por el dominio real al desplegar.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elgustodemipueblo.com.ar",
  locale: "es_AR",
  currency: "ARS",
  instagram: "https://instagram.com/elgustodemipueblo2023",
  instagramHandle: "@elgustodemipueblo2023",
  // Número en formato internacional sin símbolos para wa.me
  whatsapp: "5492281401234",
  whatsappDisplay: "+54 9 2281 40-1234",
  email: "hola@elgustodemipueblo.com.ar",
  address: "Benito Juárez, Buenos Aires, Argentina",
  hours: "Mar a Dom · 10 a 20 hs",
} as const;

export type Site = typeof site;
